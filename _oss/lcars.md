---
title:  LCARS
period: Jun 2025
date:   2025-06-01
github: https://github.com/built-fast/lcars
license: MIT
tags:
  - laravel
  - cli
languages:
  - name: Bash
    icon: bash
tagline: CLI toolkit for Laravel development
excerpt: |
  LCARS (Laravel CLI and Reusable Scripts) is a command-line toolkit that
  enhances Laravel development workflows with convenient utilities and
  shortcuts.
---

LCARS (Laravel CLI and Reusable Scripts) is a command-line toolkit that
enhances Laravel development workflows with convenient utilities and
shortcuts. It provides quick access to common Laravel tasks, testing tools,
development utilities, and documentation browsing—all through a unified CLI
interface.

Key features:

- **Testing Suite**: Run Pest, PHPStan, Pint, and ShellCheck with simple
  commands
- **Documentation**: Browse Laravel docs with fuzzy search using `fzf`
- **Development Utilities**: Hash generation, HTTP header and SSL inspection,
  clipboard operations, and more

## Installation

### Install globally via Homebrew on macOS

On macOS, `lcars` can be installed via Homebrew with:

```
brew install built-fast/devtools/lcars
```

### Install globally via make

macOS and most Linux distributions add `/usr/local/bin` to `$PATH` and
`/usr/local/share/man` to `$MANPATH`. If you are the only user on the machine,
or if you want to make `lcars` available for all users, you can install
it globally as follows:

```
git clone https://github.com/built-fast/lcars
cd lcars
sudo make install PREFIX=/usr/local
```

### Install locally via make

If you don't want a global installation, another common pattern is to install
to `~/.local`. This is enabled on Ubuntu by default.

```
git clone https://github.com/built-fast/lcars
cd lcars
make install PREFIX=~/.local
```

To test, verify that `lcars help` works and that `man lcars` prints the man
page.

If you see `lcars: command not found`, you need to update your `$PATH`.
If you are using Bash, add the following to `~/.bash_profile`, or if you are
using ZSH, add it to `~/.zshenv`:

```
export PATH="$HOME/.local/bin:$PATH"
```

If `man lcars` reports `No manual entry for lcars`, you need to
update your `$MANPATH`. This can be done by adding the following to
`~/.manpath` (note, change USER to your username):

```
MANDATORY_MANPATH /home/USER/.manpath
```

## Usage

```
Usage: lcars <command>

NAME
  lcars -- Laravel CLI and Reusable Scripts

SYNOPSIS
  lcars <command>

DESCRIPTION
  LCARS contains CLI tools for working with Laravel projects.

OPTIONS
  -h
      Print short help and exit.

  --help
      Print full help text and exit. Same as `lcars help`.

  --root
      Print the root directory that LCARS is installed to and exit.

COMMANDS
  app:artisan         Interactive Laravel Artisan command launcher with fuzzy search
  app:console         Opens the Tinker console
  app:decrypt         Decrypts input data using Laravel's encryption service
  app:encrypt         Encrypts input data using Laravel's encryption service
  app:environment     Prints the current application environment
  app:eval            Runs the given PHP code in the context of a Laravel application
  app:new             Creates a new Laravel app with sensible defaults
  app:reset           Fully resets the application database and clears caches.
  app:root            Prints the application root path
  cli:aliases         Lists all LCARS aliases
  cli:commands        Lists all LCARS commands
  cli:config:edit     Opens the LCARS config file in $EDITOR
  cli:config:get      Gets a local LCARS config
  cli:config:set      Sets a local LCARS config
  cli:help            Prints help for LCARS commands
  cli:update          Updates LCARS
  docs                Open Laravel documentation pages
  hash:md5            Hashes a string or file contents using MD5
  hash:random         Generates a random hash using OpenSSL
  hash:sha1           Hashes a string or file contents using SHA-1
  hash:sha256         Hashes a string or file contents using SHA-256
  inspect:headers     Makes a cURL request and prints the headers
  inspect:php:ext     Checks if a PHP extension is installed
  inspect:ssl:expiry  Prints SSL expiration dates for domains
  test                Runs Pint, Pest, PHPStan, and ShellCheck tests
  test:pest           Runs Pest test suite
  test:phpstan        Runs PHPStan on PHP files in the project
  test:pint           Runs Pint on PHP files in the project
  test:shellcheck     Runs ShellCheck on all Bash files in the project
  util:copy           Copies strings to the clipboard
  util:ip             Prints public IP address using CloudFlare DNS
  util:paste          Pastes the contents of the clipboard
  util:path           Prints your current PATH
  util:retry          Retries a command

See `lcars help <command>' for information on a specific command.

ALIASES
  commands:    cli:commands
  console:     app:console
  hash:        hash:sha256
  help:        cli:help
  test:types:  test:phpstan
```
