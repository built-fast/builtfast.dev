---
layout: post
title: "How we test our Laravel monolith with Bash scripts"
date: "Sat Jan 24 00:00:00 -0500 2026"
categories: [laravel, devops]
tags: [php, testing, bash, pest, phpstan]
author: Josh Priddle
tagline: "One command to run PHP tests, static analysis, frontend linting, and more. A unified Bash test runner for our Laravel monolith."
---

Running tests in a monolith can get unwieldy. You've got PHP tests, static analysis, code style checks, frontend linting, TypeScript compilation, security audits, bundle size checks, and shell script validation. Remembering all the commands --- and their flags --- is tedious.

We solved this with a simple `script/test` runner that orchestrates everything. One command to run it all, or drill down to exactly what you need.

This approach is based on GitHub's [Scripts to Rule Them All][7] pattern. The idea is simple: every project has a `script/` directory with predictable entry points --- `script/setup`, `script/test`, `script/server`, etc. New contributors don't need to read documentation to figure out how to run tests. They just run `script/test`. The same scripts work on developer machines and in CI. When you've worked on a few projects that follow this pattern, you can jump into any of them and immediately know how to get started.

## The orchestrator

The main `script/test` file is the entry point. It routes commands to individual test scripts and handles timing and status reporting.

```bash
#!/usr/bin/env bash
# Usage: test [all]               - runs all tests
#        test backend             - runs all backend tests
#        test backend:pest        - runs Pest tests
#        test backend:phpstan     - runs PHPStan static analysis
#        test backend:pint        - runs Laravel Pint code style checks
#        test backend:vendors     - validate composer.json and composer.lock
#        test frontend            - runs all frontend tests
#        test frontend:build      - runs the frontend production build
#        test frontend:bundle     - runs the frontend bundling size check
#        test frontend:eslint     - runs ESLint checks on frontend code
#        test frontend:browser    - runs Pest Browser end-to-end tests
#        test frontend:prettier   - runs Prettier code formatting checks
#        test frontend:security   - runs security checks on NPM dependencies
#        test frontend:typescript - runs TypeScript type checks
#        test frontend:vendors    - validate package.json and package-lock.json
#        test scripts:actionlint  - runs Actionlint on GitHub Actions workflows
#        test scripts:shellcheck  - runs ShellCheck on bash scripts
#        test scripts:shfmt       - runs shfmt on bash scripts
#
# NAME
#   test -- Run the test suite
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

print_help() {
  local cmd="$1"

  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  return 1
}

cd "$(dirname "$0")/.."

run_command() {
  local cmd="$1" path

  shift

  path="script/test-$cmd"

  if [[ ! -x "$path" ]]; then
    echo "Unknown command: $cmd" >&2
    return 1
  fi

  bash "script/test-$cmd" "$@"
}

timeformat() {
  local target="$1"

  printf '\e[1;35m'
  printf '[%s] ⏰ Ran %s in %%3lR seconds' "$(date +%T)" "$target"
  printf '\e[0m'
}

list_commands() {
  local file

  for file in script/test-*; do
    echo "${file##*/test-}"
  done
}

main() {
  local target="$1" FAILED=0

  : "${TIMEFORMAT:="$(timeformat "$target")"}"

  case "$target" in
    all)
      shift
      main scripts || FAILED=1
      main backend || FAILED=1
      main frontend || FAILED=1
      ;;
    pint | pest | phpstan | types)
      shift
      run_command backend:"${target//types/phpstan}" "$@" || FAILED=1
      ;;
    scripts)
      shift
      run_command scripts:shellcheck || FAILED=1
      run_command scripts:actionlint || FAILED=1
      run_command scripts:shfmt || FAILED=1
      ;;
    backend)
      shift
      run_command backend:vendors || FAILED=1
      run_command backend:phpstan || FAILED=1
      run_command backend:pint || FAILED=1
      run_command backend:pest || FAILED=1
      ;;
    backend:lint)
      shift
      run_command backend:pint || FAILED=1
      ;;
    frontend)
      shift
      run_command frontend:vendors || FAILED=1
      run_command frontend:typescript || FAILED=1
      run_command frontend:eslint || FAILED=1
      run_command frontend:prettier || FAILED=1
      run_command frontend:security || FAILED=1
      run_command frontend:build || FAILED=1
      run_command frontend:bundle || FAILED=1
      ;;
    frontend:lint)
      shift
      run_command frontend:typescript || FAILED=1
      run_command frontend:eslint || FAILED=1
      run_command frontend:prettier || FAILED=1
      ;;
    e2e | frontend:e2e)
      shift
      run_command frontend:browser || FAILED=1
      ;;
    logger)
      TIMEFORMAT=''
      run_command logger "$@"
      return 0
      ;;
    -L | --list)
      TIMEFORMAT=''
      list_commands
      return 0
      ;;
    -h | --help)
      TIMEFORMAT=''
      print_help "$target"
      return 0
      ;;
    *)
      run_command "$@"
      return $?
      ;;
  esac

  if [[ "$FAILED" -eq 0 ]]; then
    run_command logger success "Task $target passed."
  else
    run_command logger error "Task $target failed!"
  fi

  return $FAILED
}

time {
  main "${@:-all}"
}
```

A few things to note:

- **Convention-based routing**: `script/test backend:pest` runs `script/test-backend:pest`. Simple and predictable.
- **Grouped commands**: `script/test backend` runs all backend checks in sequence. `script/test all` runs everything.
- **Shortcuts**: `script/test pest` expands to `script/test backend:pest` for common commands.
- **Timing**: The `time` wrapper with custom `TIMEFORMAT` shows how long each run took.
- **Fail tracking**: The `FAILED` variable tracks failures without exiting early, so you see all failures in one run.

## Consistent logging

Every test script uses a shared logger for consistent output:

```bash
#!/usr/bin/env bash
# Usage: test-logger
#
# NAME
#   test-logger -- Log test execution messages with timestamps and color coding
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

RED='\e[31m'
GREEN='\e[32m'
YELLOW='\e[33m'
BLUE='\e[34m'
RESET='\e[0m'
BOLD='\e[1m'

# shellcheck disable=SC2059
log() { printf "$@" >&2; }

timestamp() {
  date +"%T"
}

main() {
  local level="${1:-info}"

  shift

  case "$level" in
    error)
      log "%b[%s] ❌ %s%b\\n" "$RED$BOLD" "$(timestamp)" "$*" "$RESET"
      ;;
    warning)
      log "%b[%s] ⚠️  %s%b\\n" "$YELLOW$BOLD" "$(timestamp)" "$*" "$RESET"
      ;;
    success)
      log "%b[%s] ✅ %s%b\\n" "$GREEN$BOLD" "$(timestamp)" "$*" "$RESET"
      ;;
    info | *)
      log "%b[%s] 👀 %s%b\\n" "$BLUE$BOLD" "$(timestamp)" "$*" "$RESET"
      ;;
  esac
}

main "$@"
```

This gives you clear, timestamped output that's easy to scan:

```
[14:32:01] 👀 Running PHPStan...
[14:32:15] ✅ PHPStan checks passed.
[14:32:15] 👀 Running Pint...
[14:32:18] ✅ Pint checks passed.
```

## Backend tests

### Pest tests

```bash
#!/usr/bin/env bash
# Usage: test-backend:pest
#
# NAME
#   test-backend:pest -- Run Pest PHP tests
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

export XDEBUG_MODE=off

./script/test-logger info "Running Pest tests..."

if ./vendor/bin/pest --parallel "$@"; then
  ./script/test-logger success "Pest tests passed."
else
  ./script/test-logger error "Pest run failed."
  exit 1
fi
```

Note `XDEBUG_MODE=off` --- Xdebug slows down test execution significantly. We only enable it when generating coverage reports.

### PHPStan static analysis

```bash
#!/usr/bin/env bash
# Usage: test-backend:phpstan
#
# NAME
#   test-backend:phpstan -- Run PHPStan static analysis
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running PHPStan..."

if ./vendor/bin/phpstan analyze --memory-limit 1G "$@"; then
  ./script/test-logger success "PHPStan checks passed."
else
  ./script/test-logger error "PHPStan checks failed."
  exit 1
fi
```

The `--memory-limit 1G` flag prevents PHPStan from running out of memory on large codebases. Adjust as needed for your project.

### Laravel Pint code style

```bash
#!/usr/bin/env bash
# Usage: test-backend:pint
#
# NAME
#   test-backend:pint -- Run Laravel Pint code style checks
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running Pint..."

if ./vendor/bin/pint --test --format=txt --verbose "$@"; then
  ./script/test-logger success "Pint checks passed."
else
  ./script/test-logger error "Pint checks failed."
  exit 1
fi
```

The `--test` flag makes Pint report issues without fixing them --- ideal for CI. Developers can run `./vendor/bin/pint` without the flag to auto-fix.

### Composer validation

```bash
#!/usr/bin/env bash
# Usage: test-backend:vendors
#
# NAME
#   test-backend:vendors -- Run Composer validation
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running Composer validation..."

if composer validate > /dev/null 2>&1; then
  ./script/test-logger success "Composer validation passed."
else
  ./script/test-logger error "Composer validation failed."
  exit 1
fi
```

This catches malformed `composer.json` files before they cause problems. It's a quick check that runs first in the backend suite.

## Frontend tests

The frontend lives in a separate `frontend/` directory with its own `package.json`. Each script `cd`s into that directory to run npm commands.

### TypeScript compilation

```bash
#!/usr/bin/env bash
# Usage: test-frontend:typescript
#
# NAME
#   test-frontend:typescript -- Run TypeScript type checking
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Checking TypeScript compilation..."

if (cd frontend && npm run type-check "$@"); then
  ./script/test-logger success "TypeScript compilation check passed."
else
  ./script/test-logger error "TypeScript compilation check failed."
  exit 1
fi
```

Running `tsc --noEmit` (via `npm run type-check`) catches type errors without producing output files. This runs before ESLint since there's no point linting code that won't compile.

### ESLint

```bash
#!/usr/bin/env bash
# Usage: test-frontend:eslint
#
# NAME
#   test-frontend:eslint -- Run ESLint checks on frontend code
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running Eslint..."

if (cd frontend && npm run lint:check "$@"); then
  ./script/test-logger success "Eslint checks passed."
else
  ./script/test-logger error "Eslint checks failed."
  exit 1
fi
```

ESLint catches code quality issues --- unused variables, missing dependencies in React hooks, accessibility problems. The `lint:check` script runs ESLint in check mode without auto-fixing, which is what you want in CI.

### Prettier formatting

```bash
#!/usr/bin/env bash
# Usage: test-frontend:prettier
#
# NAME
#   test-frontend:prettier -- Check frontend code formatting with Prettier
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Checking code formatting..."

if (cd frontend && npm run format:check "$@"); then
  ./script/test-logger success "Code formating check passed."
else
  ./script/test-logger error "Code formating check failed."
  exit 1
fi
```

Prettier enforces consistent formatting --- indentation, quotes, trailing commas. The `format:check` script uses Prettier's `--check` flag to report issues without modifying files. Developers run `npm run format` locally to auto-fix before committing.

### Security audit

```bash
#!/usr/bin/env bash
# Usage: test-frontend:security
#
# NAME
#   test-frontend:security -- Run npm security audit on frontend dependencies
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running security audit..."

if (cd frontend && npm audit --audit-level=moderate "$@"); then
  ./script/test-logger success "Security audit passed."
else
  ./script/test-logger error "Security audit failed."
  exit 1
fi
```

The `--audit-level=moderate` flag fails the build on moderate or higher severity vulnerabilities. Adjust based on your risk tolerance.

### Production build

```bash
#!/usr/bin/env bash
# Usage: test-frontend:build
#
# NAME
#   test-frontend:build -- Build frontend for production
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running production build..."

if (cd frontend && npm run build "$@"); then
  ./script/test-logger success "Production built successfully."
else
  ./script/test-logger error "Production build failed."
  exit 1
fi
```

Running the production build in CI catches issues that don't appear in development mode --- tree-shaking problems, missing dependencies, build configuration errors.

### Bundle size check

```bash
#!/usr/bin/env bash
# Usage: test-frontend:bundle
#
# NAME
#   test-frontend:bundle -- Check frontend bundle size limits
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Checking bundle size..."

if (cd frontend && npm run check:bundle "$@"); then
  ./script/test-logger success "Bundle size is within limits."
else
  ./script/test-logger error "Bundle size check failed."
  exit 1
fi
```

Bundle size checks prevent accidental bloat. Tools like [bundlewatch][1] or [size-limit][2] can enforce limits and track changes over time.

### NPM validation

```bash
#!/usr/bin/env bash
# Usage: test-frontend:vendors
#
# NAME
#   test-frontend:vendors -- Run NPM package.json validation
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-logger info "Running NPM validation..."

# If we can get the package name, the json was valid
if (cd frontend && npm pkg get name > /dev/null 2>&1); then
  ./script/test-logger success "NPM validation passed."
else
  ./script/test-logger error "NPM validation failed. Invalid package.json."
  exit 1
fi
```

This is a simple sanity check --- if `npm pkg get name` works, the `package.json` is valid JSON with the required `name` field. It catches malformed JSON from merge conflicts or manual edits before other npm commands fail with cryptic errors.

### Browser tests

```bash
#!/usr/bin/env bash
# Usage: test-frontend:browser
#
# NAME
#   test-frontend:browser -- Runs Pest Browser (Playwright) end-to-end tests
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

./script/test-backend:pest tests/Browser/
```

Browser tests reuse the Pest runner but point to the `tests/Browser/` directory. This keeps E2E tests in PHP with [Pest Browser][3] (Playwright under the hood) rather than maintaining a separate JavaScript test suite.

## Script validation

We lint our Bash scripts too. These checks run first in the `all` suite to catch issues early.

### ShellCheck

```bash
#!/usr/bin/env bash
# Usage: test-scripts:shellcheck
#
# NAME
#   test-scripts:shellcheck -- Run ShellCheck linter for shell scripts
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

if ! type gh > /dev/null 2>&1; then
  echo "gh is required" >&2
  echo "Try: brew install gh" >&2
  return 127
fi

if ! type shellcheck > /dev/null 2>&1; then
  echo "shellcheck is required" >&2
  echo "Try: brew install shellcheck" >&2
  return 127
fi

if ! gh extension list | grep 'gh shellcheck' &> /dev/null; then
  echo "gh-shellcheck is required" >&2
  echo "Try: gh extension install built-fast/gh-shellcheck" >&2
  return 127
fi

./script/test-logger info "Running ShellCheck..."

if gh shellcheck "$@" -- :docs/; then
  ./script/test-logger success "ShellCheck passed."
else
  ./script/test-logger error "ShellCheck failed."
  exit 1
fi
```

We use our [gh-shellcheck][4] extension to run ShellCheck on all scripts in the repository. The `:docs/` syntax excludes documentation directories from the scan.

### Actionlint

```bash
#!/usr/bin/env bash
# Usage: test-scripts:actionlint
#
# NAME
#   test-scripts:actionlint -- Run GitHub Actions linter
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

if ! type gh > /dev/null 2>&1; then
  echo "gh is required" >&2
  echo "Try: brew install gh" >&2
  return 127
fi

if ! type shellcheck > /dev/null 2>&1; then
  echo "shellcheck is required" >&2
  echo "Try: brew install shellcheck" >&2
  return 127
fi

if ! gh extension list | grep 'gh actionlint' &> /dev/null; then
  echo "gh-actionlint is required" >&2
  echo "Try: gh extension install cschleiden/gh-actionlint" >&2
  return 127
fi

./script/test-logger info "Running Action Lint..."

if gh actionlint "$@"; then
  ./script/test-logger success "Action Lint passed."
else
  ./script/test-logger error "Action Lint failed."
  exit 1
fi
```

[Actionlint][5] catches errors in GitHub Actions workflows --- invalid syntax, unknown actions, type mismatches in expressions.

### shfmt

```bash
#!/usr/bin/env bash
# Usage: test-scripts:shfmt
#
# NAME
#   test-scripts:shfmt -- Run shfmt on the script/ directory
#
# OPTIONS
#   -h, --help
#     Print this help message and exit.

if [[ "$DEBUG" ]]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

set -euo pipefail

if [[ "${1:-}" = "-h" ]] || [[ "${1:-}" = "--help" ]]; then
  sed -ne '/^#/!q;s/^#$/# /;/^# /s/^# //p' < "$0" |
    awk -v f="${1#-h}" '!f && /^Usage:/ || u { u=!/^s*(eg:)?$/; if (!u) exit } u || f'
  exit 1
fi

cd "$(dirname "$0")/.."

if ! type shfmt > /dev/null 2>&1; then
  echo "shfmt is required" >&2
  echo "Try: brew install shfmt" >&2
  return 127
fi

./script/test-logger info "Running shfmt..."

if shfmt -d -i 2 -sr -ci script/; then
  ./script/test-logger success "shfmt passed."
else
  ./script/test-logger error "shfmt failed."
  exit 1
fi
```

[shfmt][6] enforces consistent formatting across shell scripts. The flags:
- `-d`: Diff mode (show what would change)
- `-i 2`: Two-space indentation
- `-sr`: Redirect operators followed by a space
- `-ci`: Indent switch cases

## Common patterns

Every script follows the same structure:

1. **Shebang and usage comment**: Documents what the script does
2. **Debug mode**: `DEBUG=1 script/test backend` shows execution trace
3. **Strict mode**: `set -euo pipefail` catches errors immediately
4. **Help flag**: `-h` or `--help` prints usage
5. **Directory change**: `cd "$(dirname "$0")/.."` ensures consistent working directory
6. **Logger calls**: Consistent output formatting
7. **Pass-through args**: `"$@"` forwards additional arguments to underlying tools

## Usage

```bash
# Run everything
script/test

# Run all backend checks
script/test backend

# Run just Pest tests
script/test pest
script/test backend:pest

# Run Pest tests with specific arguments
script/test pest --filter=UserTest

# Run all frontend checks
script/test frontend

# Run just TypeScript checks
script/test frontend:typescript

# List all available commands
script/test --list
```

## Wrapping up

This approach gives us a consistent interface for running tests locally and in CI. Developers don't need to remember tool-specific flags --- `script/test` handles that. CI just runs `script/test all` and gets comprehensive coverage.

The key benefits:

- **Discoverability**: `script/test --help` shows everything available
- **Consistency**: Same commands work locally and in CI
- **Composability**: Run everything or just what you need
- **Extensibility**: Add a new check by creating `script/test-new:check`

The overhead of maintaining these scripts is minimal compared to the friction they eliminate.

[1]: https://bundlewatch.io/
[2]: https://github.com/ai/size-limit
[3]: https://pestphp.com/docs/pest-browser
[4]: https://github.com/built-fast/gh-shellcheck
[5]: https://github.com/rhysd/actionlint
[6]: https://github.com/mvdan/sh
[7]: https://github.blog/engineering/scripts-to-rule-them-all/
