---
layout: post
title: "Managing Laravel env secrets with 1Password CLI"
date: "Sat Jan 31 12:00:00 -0500 2026"
categories: [laravel, devops]
tags: [php, security, 1password, bash]
author: Josh Priddle
tagline: "Encrypt and decrypt .env files without ever typing a secret."
---

Laravel 11 added native [environment encryption][1]. You can encrypt your `.env` files and commit them to version control, then decrypt them during deployment. The catch: you need to manage that encryption key somewhere.

We store ours in 1Password and use the [1Password CLI][2] to fetch it automatically. No copy-pasting secrets, no local key files.

## The problem with manual key management

Laravel's built-in commands work like this:

```bash
php artisan env:encrypt --env=production
# Enter the key when prompted, or pass --key=...

php artisan env:decrypt --env=production
# Same deal
```

That's fine for a solo project. But with a team, key management becomes a problem. Someone rotates it and forgets to tell everyone. Deployments break at 2am.

## Enter 1Password CLI

The 1Password CLI (`op`) lets you fetch secrets programmatically. If you're already using 1Password for team credentials, this is a natural fit.

First, store your encryption key in 1Password. Create a new item and add a field called `DOTENV_SECRET` with your Laravel encryption key.

Then install the CLI:

```bash
brew install 1password-cli
```

You can authenticate interactively with `op signin`, or --- better --- enable the [1Password app integration][3] so the CLI uses your already-authenticated desktop app. No more typing your master password in the terminal.

## The script

We wrap this in a script that handles the 1Password authentication check and passes the key to Laravel. This lives in our `script/` directory alongside other project automation.

```bash
#!/usr/bin/env bash
# Usage: env-encrypt [production] [--force]
#        env-encrypt production --decrypt

set -euo pipefail

export OP_ACCOUNT="${OP_ACCOUNT:-yourteam}"

get_secret() {
  local environment="$1" uri

  if ! type op > /dev/null 2>&1; then
    echo "1Password CLI is not installed"
    echo "  brew install 1password-cli"
    exit 1
  fi

  # If not signed in through 1Password CLI integration, do it manually
  if ! op whoami > /dev/null 2>&1; then
    eval "$(op signin --account "$OP_ACCOUNT")"

    if ! op whoami > /dev/null 2>&1; then
      echo "1Password signin failed"
      exit 1
    fi
  fi

  uri="op://CLI/com.example.app.$environment.encryption"

  op read "$uri/DOTENV_SECRET"
}

main() {
  local environment=production action=env:encrypt args=()

  while [[ "$#" -gt 0 ]]; do
    case "${1-}" in
      production)
        environment=production
        shift
        ;;
      -d | --decrypt)
        action=env:decrypt
        shift
        ;;
      *)
        args+=("$1")
        shift
        ;;
    esac
  done

  args+=("--env=$environment")
  args+=("--key=$(get_secret "$environment")")

  php artisan "$action" "${args[@]}"
}

main "$@"
```

A few things going on here:

- **Automatic auth detection**: The script checks `op whoami` first. If you're already authenticated (via app integration or a recent `op signin`), it skips the login prompt.
- **Vault URIs**: The `op://CLI/com.example.app.production.encryption` path points to a specific item in a specific vault. `DOTENV_SECRET` points to a specific value in that item. You'll need to adjust this to match your 1Password structure.
- **Argument forwarding**: The `args` array collects extra flags to pass through to Laravel. Need `--force`? Just add it.

## Usage

Encrypt your production .env file:

```bash
script/env-encrypt production
```

Decrypt it:

```bash
script/env-encrypt production --decrypt
```

That's it. No key prompts, no copy-paste. The secret stays in 1Password where it belongs.

## Why this matters

The encryption key is the crown jewel. If someone gets it, they can decrypt every secret in your `.env.production.encrypted` file. Treating it like any other credential --- stored in a password manager, accessed via CLI, never typed manually --- reduces the surface area for mistakes.

It also means your CI/CD pipeline can decrypt the env file without you hardcoding the key in GitHub Secrets or whatever your platform uses. Just authenticate with 1Password in your deployment script (they have [service accounts][4] for this) and the key stays in one place.

[1]: https://laravel.com/docs/11.x/configuration#encrypting-environment-files
[2]: https://developer.1password.com/docs/cli/
[3]: https://developer.1password.com/docs/cli/app-integration/
[4]: https://developer.1password.com/docs/service-accounts/
