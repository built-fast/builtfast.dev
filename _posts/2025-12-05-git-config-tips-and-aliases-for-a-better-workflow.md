---
layout: post
title: "Git config tips and aliases for a better workflow"
date: "Fri Dec 05 10:00:00 -0500 2025"
categories: [devops]
tags: [git, productivity, cli]
author: Josh Priddle
tagline: "Your ~/.gitconfig is one of the most underutilized tools in a developer's arsenal. Configs and aliases we've accumulated over the years."
---

Your `~/.gitconfig` file is one of the most underutilized tools in a
developer's arsenal. A well-tuned git config can save you keystrokes, surface
useful information faster, and eliminate friction from your daily workflow.

Here's a collection of configs and aliases I've accumulated over the years.
Note that I'm breaking these into logical sections, but your actual
`~/.gitconfig` should only have one `[alias]` block with all aliases grouped
together.

## Sensible defaults

### Default branch

Recent git versions default to `main` for new repositories. If you prefer
`master`:

```ini
[init]
  defaultBranch = master
```

### Push behavior

Older git versions would push _all_ branches when you ran `git push` without
arguments. That's almost never what you want. Modern git defaults to safer
behavior, but you can be explicit:

```ini
[push]
  default = current
```

Now `git push` only operates on the currently checked out branch.

### Pull with rebase

If you prefer rebasing over merge commits when pulling:

```ini
[pull]
  rebase = true
```

### Auto-prune on fetch

Tired of seeing stale remote branches that were merged weeks ago? Tell git to
clean them up automatically:

```ini
[fetch]
  prune = true
```

## Making output more readable

### Enable colors

Colors everywhere:

```ini
[color]
  ui = auto
```

You can customize specific colors too (see `man git-config` for all options):

```ini
[color "status"]
  header    = yellow bold
  added     = green bold
  updated   = green reverse
  changed   = magenta bold
  untracked = red

[color "diff"]
  meta       = yellow bold
  frag       = magenta bold
  old        = red bold
  new        = green bold
  whitespace = red reverse
```

### Compact log format

The default `git log` output is verbose. You can set a custom format that
shows commits on a single line with just the essentials:

```ini
[format]
  pretty = format:%C(red)%h%Creset%C(yellow)%d%Creset %C(magenta)%an%Creset: %s %C(green)(%ar)%Creset
```

When you need full details, use `git show --format=fuller [sha]`.

### Compact status

For a more concise `git status`:

```ini
[status]
  short = true
  branch = true
```

This gives you `git status -sb` behavior by default. Use `git status
--no-short` when you want the verbose output.

### Sort branches by date

See your most recently worked-on branches first:

```ini
[branch]
  sort = -authordate
```

### Disable advice messages

Git helpfully explains how to use commands. Once you know what you're doing,
this can get noisy:

```ini
[advice]
  statusHints        = false
  pushNonFastForward = false
```

Check `man git-config` for the full list of `advice.*` options.

## Useful aliases

### Viewing commits

A graph view showing branch structure and merge points:

```ini
[alias]
  lg = log --graph --abbrev-commit --date=relative
```

Full commit details when you need them:

```ini
[alias]
  showf = show --format=fuller
  full-log = log --format=fuller
```

Get the last commit SHA (useful for pasting into PRs or issue trackers):

```ini
[alias]
  last-sha = rev-parse --short HEAD
```

See commits you haven't pushed yet:

```ini
[alias]
  pending = !git --no-pager log @{u}.. && echo
```

Just the last commit's subject line (great for copy-pasting):

```ini
[alias]
  last-subject = !git --no-pager log --pretty="%s" -1
```

Show only the filenames changed in a commit:

```ini
[alias]
  show-files = !git --no-pager show --name-only --format=
```

This also works on ranges: `git show-files main..HEAD` shows everything
changed on your branch.

### Working with branches

Get the current branch name:

```ini
[alias]
  branch-name = rev-parse --abbrev-ref HEAD
```

Combine with `pbcopy` on macOS: `git branch-name | pbcopy`

List the 10 most recent branches:

```ini
[alias]
  recent-branches = for-each-ref --count=10 --sort=-committerdate --format=\"%(refname:short)\" refs/heads/
```

Clean up merged local branches:

```ini
[alias]
  prune-branches = !git branch --merged | grep -v '^master$' | grep -v "\\\\*" | xargs -n 1 git branch -d
```

### Undoing mistakes

Unstage files (use `git unstage -- .` for everything, or specify files):

```ini
[alias]
  unstage = reset HEAD -- ...
```

Undo the last commit but keep changes staged:

```ini
[alias]
  undo = reset --soft HEAD^
```

Amend the last commit (updates the date so it sorts correctly):

```ini
[alias]
  amend = !git commit --amend --date=\"$(date)\" -C HEAD
```

### Utilities

Find the root directory of a repo:

```ini
[alias]
  root = rev-parse --show-toplevel
```

Scan for TODO and FIXME comments:

```ini
[alias]
  todo = grep -wniI -e TODO -e FIXME
```

Create an empty commit (useful for initializing repos):

```ini
[alias]
  msg = commit --allow-empty -m
```

Usage: `git msg "Initial commit"`

## Editor configuration

Set your preferred editor for commit messages:

```ini
[core]
  editor = vim
```

For VS Code:

```ini
[core]
  editor = code --wait
```

Or set the `GIT_EDITOR` environment variable in your shell profile.

## Managing multiple identities

### Include files

Keep work and personal configs separate with includes. In `~/.gitconfig`:

```ini
[user]
  email = personal@example.com

[include]
  path = ~/.gitconfig.local
```

Then in `~/.gitconfig.local` on your work machine:

```ini
[user]
  email = work@example.com
```

### Directory-based author with direnv

If you use [direnv][1], you can set git author info per-directory. Create a
`.envrc` in your work projects folder:

```bash
export GIT_AUTHOR_EMAIL=work@example.com
export GIT_COMMITTER_EMAIL=work@example.com
```

Now any commit under that directory tree uses your work email automatically.

## Local gitignore

Need to ignore files in your local checkout without affecting the shared
`.gitignore`? Add patterns to `.git/info/exclude`:

```
_my_scripts/*
.local-notes.md
```

Use this sparingly. If multiple developers need the same ignores, put them in
`.gitignore`.

## Shell aliases

These shell aliases cover the most common operations. Add to `~/.bashrc` or
`~/.zshrc`:

```bash
alias gb='git branch'
alias gbd='git branch -d'
alias gco='git checkout'
alias gd='git diff'
alias gdc='git diff --cached'
alias gs='git status'
```

Checkout main, pull, then return to your previous branch:

```bash
alias gcomp='git checkout main; git pull'
alias gcomp-='git checkout main; git pull; git checkout -'
```

Before pushing a PR: `gcomp- && git rebase main`

Remove deleted files from git tracking:

```bash
alias grm="git status --porcelain | awk '\$1 == \"D\" {print \$2}' | xargs git --git-dir=\$(git rev-parse --git-dir) rm --ignore-unmatch"
```

---

These configs have evolved over years of daily use. Start with the ones that
address friction you actually experience, and build from there.

[1]: https://direnv.net
