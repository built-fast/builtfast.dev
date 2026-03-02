---
layout: post
title: "Git worktrees for parallel Laravel development"
date: "Sat Feb 28 12:00:00 -0500 2026"
categories: [laravel, devops]
tags: [git, php, bash, claude-code]
author: Josh Priddle
tagline: "Run multiple branches side by side, each with its own database, without stashing or switching."
---

If you've ever been deep in a feature branch and needed to review a pull
request or fix a bug on `main`, you know the drill: stash your changes, switch
branches, install dependencies, run migrations, do the thing, switch back,
pop the stash, hope nothing broke. It's fragile and it's slow.

Git worktrees let you check out multiple branches at the same time, each in
its own directory. For a typical web app that's enough on its own. For Laravel,
you also need an isolated database, a fresh `.env`, and dependencies installed.
We built a script to handle all of that.

## What's a worktree?

A worktree is a linked checkout of the same repository. It shares the same
`.git` data (history, refs, objects) but has its own working directory and
branch. You can have as many as you want.

```bash
git worktree add ../billing-refactor -b billing-refactor
```

That creates a new directory at `../billing-refactor` on a new branch. You
`cd` into it and work normally --- commits, diffs, pushes all work. When
you're done, remove it:

```bash
git worktree remove ../billing-refactor
```

The branch and all the shared git state remain in the original repo. The
worktree is just a view.

## The problem with Laravel

A bare worktree gives you the source code, but a Laravel app needs more than
that to run:

- **Dependencies** --- `vendor/` and `node_modules/` aren't checked in
- **Environment** --- each worktree needs its own `.env` with a unique
  `APP_KEY` and `DB_DATABASE`
- **Database** --- two worktrees sharing a database will stomp on each other's
  migrations
- **Caches** --- Laravel caches config, routes, and views. These need to be
  isolated too.

Doing this manually every time defeats the purpose. So we automated it.

## The script

We keep this at `script/worktree` in the project root. It handles create,
remove, and list.

```bash
#!/usr/bin/env bash
# Usage: script/worktree <command> [options]
#
# NAME
#   worktree -- Create and manage git worktrees with isolated databases
#
# SYNOPSIS
#   script/worktree create [--claude] [name] [commit-ish]
#   script/worktree remove [--claude] [name]
#   script/worktree list
#
# DESCRIPTION
#   Manages git worktrees under .worktrees/ in the project root, each with
#   its own database and environment for parallel development.
#
# COMMANDS
#   create [name] [commit-ish]
#     Creates .worktrees/{name} with branch {name} from {commit-ish} (default
#     HEAD). If the branch already exists, it is checked out. Sets up .env,
#     installs dependencies, generates app key, creates a MySQL database, and
#     runs migrations.
#
#     With --claude, reads JSON from stdin (expects .name), suppresses output
#     to stderr, and prints the absolute worktree path to stdout.
#
#   remove [name]
#     Removes .worktrees/{name}, drops its databases (including parallel test
#     databases), and deletes the branch.
#
#     With --claude, reads JSON from stdin (expects .worktree_path), runs
#     silently with no stdout output.
#
#   list
#     Runs `git worktree list`.
#
# EXAMPLES
#   script/worktree create billing-refactor
#   script/worktree create billing-refactor main
#   script/worktree list
#   script/worktree remove billing-refactor
#   echo '{"name":"hooktest"}' | script/worktree create --claude
#   echo '{"worktree_path":"/path"}' | script/worktree remove --claude
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREES_DIR="$SOURCE_DIR/.worktrees"

# -- Help ---------------------------------------------------------------------

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 0
fi

# -- Helpers ------------------------------------------------------------------

drop_databases() {
  local db_name="$1"

  mysql -u root -e "DROP DATABASE IF EXISTS \`${db_name}\`;" 2> /dev/null || true

  local parallel_dbs
  parallel_dbs=$(mysql -u root -N -e "SHOW DATABASES LIKE '${db_name}_test_%';" 2> /dev/null || true)
  if [[ -n "$parallel_dbs" ]]; then
    while IFS= read -r pdb; do
      mysql -u root -e "DROP DATABASE IF EXISTS \`${pdb}\`;" 2> /dev/null || true
    done <<< "$parallel_dbs"
  fi
}

# -- create -------------------------------------------------------------------

cmd_create() {
  local claude="" name="" base=""

  if [[ "${1:-}" = "--claude" ]]; then
    claude=1
    shift
  fi

  if [[ "${claude:-}" = 1 ]]; then
    name="$(jq -r .name)"
  else
    name="${1:?Usage: script/worktree create [name] [commit-ish]}"
    base="${2:-}"
  fi

  local worktree_path="$WORKTREES_DIR/$name"
  local db_name="${name//-/_}"

  if [[ -d "$worktree_path" ]]; then
    if [[ "${claude:-}" = 1 ]]; then
      echo "$worktree_path"
    else
      echo "Error: $worktree_path already exists." >&2
    fi
    exit 1
  fi

  if [[ ! -f "$SOURCE_DIR/.env" ]]; then
    echo "Error: $SOURCE_DIR/.env not found." >&2
    exit 1
  fi

  mkdir -p "$WORKTREES_DIR"

  # Redirect output: claude mode sends to stderr (suppressed by caller),
  # manual to stdout
  local out=/dev/stdout
  if [[ "${claude:-}" = 1 ]]; then
    out=/dev/stderr
  fi

  {
    echo "==> Creating git worktree at $worktree_path..."
    if git -C "$SOURCE_DIR" rev-parse --verify "$name" > /dev/null 2>&1; then
      if [[ -n "$base" ]]; then
        echo "Warning: branch '$name' already exists, ignoring base '$base'." >&2
      fi
      git -C "$SOURCE_DIR" worktree add "$worktree_path" "$name"
    else
      git -C "$SOURCE_DIR" worktree add -b "$name" "$worktree_path" ${base:+"$base"}
    fi

    cd "$worktree_path"

    echo "==> Setting up environment..."
    cp "$SOURCE_DIR/.env" .env
    sed -i '' "s/^DB_DATABASE=.*/DB_DATABASE=${db_name}/" .env
    sed -i '' "s/^CACHE_PREFIX=.*/CACHE_PREFIX=${db_name}_/" .env

    if [[ -f "$SOURCE_DIR/.env.testing" ]]; then
      cp "$SOURCE_DIR/.env.testing" .env.testing
      sed -i '' "s/^DB_DATABASE=.*/DB_DATABASE=${db_name}/" .env.testing
      sed -i '' "s/^CACHE_PREFIX=.*/CACHE_PREFIX=${db_name}_/" .env.testing
    fi

    if [[ -f "$SOURCE_DIR/.envrc" ]]; then
      cp "$SOURCE_DIR/.envrc" .envrc
    fi

    echo "==> Installing dependencies..."
    composer install --no-interaction
    if [[ -f package.json ]]; then
      npm ci
    fi

    echo "==> Generating application key..."
    php artisan key:generate --no-interaction

    echo "==> Creating MySQL database..."
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`${db_name}\`;"
    echo "  Created: ${db_name}"

    echo "==> Running database migrations..."
    php artisan migrate --no-interaction

    php artisan optimize:clear
  } > "$out" 2>&1

  if [[ "${claude:-}" = 1 ]]; then
    echo "$worktree_path"
  else
    local current_branch
    current_branch="$(git -C "$worktree_path" branch --show-current)"

    cat << EOF

Worktree ready!
  Path:     $worktree_path
  Branch:   $current_branch
  Database: $db_name

Get started:
  cd $worktree_path
  claude

To remove later:
  script/worktree remove $name
EOF
  fi
}

# -- remove -------------------------------------------------------------------

cmd_remove() {
  local claude="" name="" worktree_path=""

  if [[ "${1:-}" = "--claude" ]]; then
    claude=1
    shift
  fi

  if [[ "${claude:-}" = 1 ]]; then
    worktree_path="$(jq -r .worktree_path)"
  else
    name="${1:?Usage: script/worktree remove [name]}"
    worktree_path="$WORKTREES_DIR/$name"
  fi

  # Redirect output: claude mode suppresses everything, manual to stdout
  local out=/dev/stdout

  if [[ "${claude:-}" = 1 ]]; then
    out=/dev/null
  fi

  {
    if [[ -f "$worktree_path/.env" ]]; then
      local db_name
      db_name=$(grep '^DB_DATABASE=' "$worktree_path/.env" | cut -d= -f2)
      if [[ -n "$db_name" ]]; then
        echo "==> Dropping databases..."
        drop_databases "$db_name"
        echo "  Dropped: ${db_name}"
      fi
    fi

    local branch_name
    branch_name="$(git -C "$worktree_path" branch --show-current 2> /dev/null || true)"

    echo "==> Removing worktree..."
    git -C "$SOURCE_DIR" worktree remove --force "$worktree_path"
    git -C "$SOURCE_DIR" worktree prune

    if [[ -n "$branch_name" ]]; then
      echo "==> Deleting branch ${branch_name}..."
      git -C "$SOURCE_DIR" branch -D "$branch_name" 2> /dev/null || true
    fi

    echo "Done."
  } > "$out" 2>&1
}

# -- list ---------------------------------------------------------------------

cmd_list() {
  git -C "$SOURCE_DIR" worktree list
}

# -- Dispatch -----------------------------------------------------------------

case "${1:-}" in
  create)
    shift
    cmd_create "$@"
    ;;
  remove)
    shift
    cmd_remove "$@"
    ;;
  list) cmd_list ;;
  *)
    echo "Usage: script/worktree <create|remove|list> [options]" >&2
    echo "" >&2
    echo "Run 'script/worktree --help' for details." >&2
    exit 1
    ;;
esac
```

Ignore the `--claude` flags for now --- we'll come back to those at the end.

## What create does

The `create` command does everything you'd do by hand, in order:

1. **Creates the worktree** under `.worktrees/{name}` with a branch of the
   same name. If you pass a second argument, it uses that as the base commit
   instead of `HEAD`.
2. **Copies `.env`** from the main checkout and rewrites `DB_DATABASE` and
   `CACHE_PREFIX` to use the worktree name. Same for `.env.testing` if it
   exists.
3. **Installs dependencies** via `composer install`. If a `package.json`
   exists, it runs `npm ci` too.
4. **Generates a fresh `APP_KEY`** so the worktree isn't sharing encryption
   keys with your main checkout.
5. **Creates a MySQL database** named after the worktree. Hyphens in the name
   are converted to underscores.
6. **Runs migrations** so the database is ready.
7. **Clears caches** via `php artisan optimize:clear` so Laravel doesn't serve
   stale config or routes from the main checkout.

The database naming convention is simple: a worktree named `billing-refactor`
gets a database called `billing_refactor`. This keeps things predictable and
easy to clean up.

## What remove does

Teardown mirrors setup:

1. **Reads `DB_DATABASE`** from the worktree's `.env` to find the database
   name.
2. **Drops the database** and any parallel testing databases (Laravel's
   parallel test runner creates databases like `billing_refactor_test_1`,
   `billing_refactor_test_2`, etc.).
3. **Removes the git worktree** and prunes stale references.
4. **Deletes the branch** since it was created for this worktree.

This is the part that matters most. Leftover databases and branches accumulate
fast if you don't clean up. Having a single command to tear everything down
means you actually do it.

## Usage

Create a worktree branching from the current `HEAD`:

```bash
script/worktree create billing-refactor
```

Create one from a specific branch or commit:

```bash
script/worktree create billing-refactor main
```

See what's active:

```bash
script/worktree list
```

Clean up when you're done:

```bash
script/worktree remove billing-refactor
```

The output after create tells you everything you need:

```
Worktree ready!
  Path:     /path/to/project/.worktrees/billing-refactor
  Branch:   billing-refactor
  Database: billing_refactor

Get started:
  cd /path/to/project/.worktrees/billing-refactor
  claude

To remove later:
  script/worktree remove billing-refactor
```

## Adapting it to your project

One thing you may need to change: this script uses MySQL with a passwordless
root user. If you use Postgres, swap the `mysql` calls for `createdb`/`dropdb`.
If your database requires a password, adjust the connection flags accordingly.

## Using worktrees with Claude Code

The `--claude` flags in the script exist so Claude Code can create and remove
worktrees automatically using [hooks][2]. When you run `claude -w [name]`,
Claude Code fires a `WorktreeCreate` hook to set up the worktree and a
`WorktreeRemove` hook to tear it down when you're done.

The hook configuration lives in `.claude/settings.json`:

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/script/worktree\" create --claude",
            "timeout": 300
          }
        ]
      }
    ],
    "WorktreeRemove": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/script/worktree\" remove --claude",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

In `--claude` mode, the create command reads a JSON payload from stdin
(containing the worktree name), suppresses its normal output, and prints the
absolute worktree path to stdout so Claude Code knows where to `cd`. The
remove command reads the worktree path from stdin and runs silently.

The 300 second timeout on create gives enough room for `composer install` and
migrations. The 30 second timeout on remove is plenty for dropping a database
and cleaning up the worktree.

With this in place, `claude -w billing-refactor` gives Claude its own branch,
database, and working directory. When the session ends, everything gets cleaned
up. Claude can run migrations, execute tests, and make changes without
touching your main checkout.

[1]: https://direnv.net
[2]: https://docs.anthropic.com/en/docs/claude-code/hooks
