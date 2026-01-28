---
layout: post
title: "How we test and maintain our apps with GitHub Actions"
date: "Fri Sep 26 21:44:00 -0400 2025"
categories: [laravel, ci-cd, github-actions, devops]
tags: [php, testing, automation, workflow]
author: Josh Priddle
tagline: "A deep dive into our production-ready CI pipeline for Laravel monoliths—balancing speed, quality, and maintainability."
---

Setting up a comprehensive CI/CD pipeline for Laravel applications can be complex, but GitHub Actions provides the flexibility to create efficient, maintainable workflows. Here's how we built a production-ready CI pipeline for a [majestic monolith](https://signalvnoise.com/svn3/the-majestic-monolith/) that balances speed, quality, and maintainability.

## Project Architecture

Our application follows the majestic monolith pattern with a clear separation of concerns:

- **Laravel backend**: Main application in the root directory with a comprehensive Pest test suite, strict PHPStan type checking, and Laravel Pint code style enforcement
- **Vue.js SPA frontend**: Separate TypeScript application living under `frontend/` with Playwright E2E tests, ESLint validation, and Prettier formatting
- **Utility scripts**: Bash scripts at `script/` that undergo ShellCheck validation and shfmt formatting

The key to keeping CI fast on a monolithic project is using GitHub Actions' **path-based triggering**. This ensures that PHP changes don't trigger unnecessary frontend builds, frontend changes don't run backend tests, and script changes only run shell validation.

## Pipeline Architecture Overview

Our CI/CD pipeline follows a multi-layered approach with these principles:

- **Path-based triggering** to avoid unnecessary workflow runs
- **Parallel execution** for faster feedback
- **Quality gates** that must pass before deployment
- **Automated maintenance** tasks

## Test Pipelines

### Backend CI Pipeline

The main backend testing pipeline (`ci.yml`) runs in approximately 2 minutes and handles all PHP-related changes. Here's the complete workflow:

```yaml
{%- raw -%}
name: CI

on:
  pull_request:
    branches:
      - main
    paths:
      - '**.php'
      - '.github/workflows/ci.yml'
      - 'composer.json'
      - 'composer.lock'
      - 'database/schema/mysql-schema.sql'
      - 'phpstan.neon.dist'
      - 'phpunit.xml'
      - '!frontend/**'

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true

jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard_index: [1, 2]
        shard_count: [2]

    name: Run test suite (shard ${{ matrix.shard_index }}/${{ matrix.shard_count }})

    env:
      DB_CONNECTION: mysql
      DB_DATABASE: app_test
      DB_USERNAME: root
      DB_PASSWORD: root
      APP_ENV: testing

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Laravel app
        uses: ./.github/actions/laravel-setup
        with:
          database: true

      - name: Run Pest testsuite
        run: |
          ./vendor/bin/pest --compact --parallel --shard ${{ matrix.shard_index }}/${{ matrix.shard_count }}

  quality:
    env:
      APP_ENV: testing
    runs-on: ubuntu-latest
    name: Run code quality checks

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Laravel app
        uses: ./.github/actions/laravel-setup

      - name: Run phpstan type analysis
        if: always()
        run: |
          ./vendor/bin/phpstan analyze --no-progress --error-format=github

      - name: Run Pint code style analysis
        if: always()
        run: |
          ./vendor/bin/pint --test --format=checkstyle | cs2pr
{% endraw %}
```

#### Path-Based Triggering

The `paths` configuration ensures this workflow only runs when PHP-related files change:
- `**.php` - Any PHP file in the project
- Configuration files: `composer.json`, `composer.lock`, `phpstan.neon.dist`, `phpunit.xml`
- Database schema: `database/schema/mysql-schema.sql`
- The workflow itself: `.github/workflows/ci.yml`
- `!frontend/**` - Explicitly excludes frontend directory changes

This path-based approach is crucial for monolith performance - frontend changes won't trigger backend tests, saving minutes per commit.

#### Parallel Test Execution

Tests run across 2 parallel shards using Pest's built-in sharding:
- Each shard runs independently with `fail-fast: false`
- Reduces total test time from ~4 minutes to ~2 minutes
- Uses dedicated `app_test` MySQL database for isolation

#### Quality Checks

Quality assurance runs independently of tests for faster feedback:
- **PHPStan**: Level 7 static analysis with GitHub-formatted output
- **Laravel Pint**: Code style enforcement with `cs2pr` for inline annotations
- Both use `if: always()` to run even if other steps fail

#### Database Setup

We use MySQL directly on the GitHub Actions runner rather than Docker for speed:
- Faster startup time compared to container-based databases
- Simple to configure with the Laravel setup action
- Could easily be swapped for Docker if needed for specific database features

We're strong believers in using the same database across local, test, and production environments. While SQLite is great and fast for testing, you'll eventually run into subtle database differences or find yourself littering code with `if ($mysql) ... elseif ($sqlite) ...` type checks. The slight performance cost is worth the peace of mind that comes from knowing your tests run against the same database your users will experience.

#### Custom Laravel Setup Action

To ensure consistency across all workflows, we created a reusable Laravel setup action:

```yaml
{%- raw -%}
# .github/actions/laravel-setup/action.yml
name: Setup Laravel Environment
description: |
  Sets up a Laravel environment for testing, including PHP, Composer, and database migrations.

inputs:
  database:
    description: 'Whether to setup database and run migrations'
    required: false
    default: 'false'
  coverage:
    description: 'Code coverage driver (xdebug, pcov, none)'
    required: false
    default: 'none'

runs:
  using: 'composite'
  steps:
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.3'
        extensions: dom, curl, libxml, mbstring, zip, bcmath
        ini-values: error_reporting=E_ALL
        tools: composer:v2, cs2pr
        coverage: ${{ inputs.coverage }}

    - name: Get composer cache directory
      id: composer-cache
      run: |
        echo "dir=$(composer config cache-files-dir)" >> "$GITHUB_OUTPUT"
      shell: bash

    - name: Cache composer dependencies
      uses: actions/cache@v4
      with:
        path: ${{ steps.composer-cache.outputs.dir }}
        key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
        restore-keys: ${{ runner.os }}-composer-

    - name: Install dependencies
      run: |
        composer install --no-scripts --no-progress --optimize-autoloader --prefer-dist
      shell: bash

    - name: Prepare the environment
      run: |
        cp .env.example .env
      shell: bash

    - name: Generate an application key
      run: |
        php artisan key:generate
      shell: bash

    - name: Start MySQL
      if: inputs.database == 'true'
      run: |
        sudo /etc/init.d/mysql start
      shell: bash

    - name: Run migrations
      if: inputs.database == 'true'
      run: |
        php artisan migrate --env=testing --force
      shell: bash
{% endraw %}
```

This action handles:
- **PHP 8.3 setup** with required extensions
- **Composer caching** using lock file hash
- **Environment preparation** from `.env.example`
- **Optional database setup** with migrations
- **Coverage drivers** (xdebug, pcov) for testing

Usage across workflows:
```yaml
{%- raw -%}
- name: Setup Laravel app
  uses: ./.github/actions/laravel-setup
  with:
    database: true
    coverage: xdebug
{% endraw %}
```

### Frontend CI Pipeline

The frontend workflow (`frontend.yml`) handles TypeScript/Vue.js validation and E2E testing, running only when frontend files change:

#### Path-Based Triggering for Frontend

```yaml
{%- raw -%}
name: Frontend CI

on:
  pull_request:
    branches:
      - main
    paths:
      - '.github/workflows/frontend.yml'
      - '!composer.json'
      - '!composer.lock'
      - '!phpstan.neon.dist'
      - '!phpunit.xml'
      - '!script/**'
      - '!tests/**'
      - 'frontend/**'

env:
    NODE_VERSION: '22'
    CI: true
    FORCE_COLOR: 1

defaults:
    run:
        working-directory: ./frontend
{% endraw %}
```

Notice how this workflow explicitly excludes backend files with `!` patterns, ensuring frontend changes don't trigger backend builds.

### Script Validation Pipeline

The pipeline includes comprehensive shell script validation for utility scripts:

```yaml
{%- raw -%}
name: Scripts

on:
  pull_request:
    branches:
      - main
    paths:
      - '**.sh'
      - 'script/**'
      - 'frontend/scripts/**'
      - '.github/workflows/scripts.yml'

jobs:
  lint:
    name: Lint shell scripts
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Install gh-shellcheck
        run: |
          gh extension install github/gh-shellcheck
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Lint shell scripts with ShellCheck
        run: |
          gh shellcheck

      - name: Install shfmt
        run: |
          curl -L https://github.com/mvdan/sh/releases/latest/download/shfmt_v3.8.0_linux_amd64 -o shfmt
          chmod +x shfmt
          sudo mv shfmt /usr/local/bin/

      - name: Check shell script formatting
        run: |
          ./script/test scripts:shfmt
{% endraw %}
```

This workflow provides two levels of shell script validation:

- **ShellCheck**: Static analysis to catch common shell scripting mistakes and improve code quality
- **shfmt**: Formatting validation to ensure consistent shell script style across the project

The workflow only runs when shell script files (`.sh` extension) or scripts in the `script/` and `frontend/scripts/` directories change, keeping CI fast by avoiding unnecessary runs.

## General Maintenance Pipelines

Beyond the core testing workflows, we have several automated maintenance pipelines that keep the codebase healthy without manual intervention.


### Automated Code Coverage

Monthly coverage analysis with automated reporting:

```yaml
{%- raw -%}
# .github/workflows/coverage.yml
name: Coverage

on:
  workflow_dispatch:  # Allows manual trigger from GitHub.com or `gh workflow run coverage.yml`
  pull_request:
    branches:
      - main
    paths:
      - '.github/workflows/coverage.yml'
  schedule:
    - cron: '0 12 1 * *'  # 8am Eastern on 1st of every month
    - cron: '20 3 24 8 *'  # Special August date

jobs:
  tests:
    name: Run test suite with coverage
    runs-on: ubuntu-latest

    env:
      DB_CONNECTION: mysql
      DB_DATABASE: app_test
      APP_ENV: testing

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Laravel app
        uses: ./.github/actions/laravel-setup
        with:
          database: true
          coverage: xdebug

      - name: Run Pest testsuite with coverage
        continue-on-error: true  # Allow coverage reports even if some tests fail
        run: |
          ./vendor/bin/pest --coverage-clover clover.xml --parallel

      - name: Generate coverage report
        if: always()  # Run even if tests failed
        run: |
          gh clover-annotate clover.xml | tee coverage-report.md >> "$GITHUB_STEP_SUMMARY"  # Adds to GitHub Actions job summary

      - name: Post coverage comment on PR
        if: always() && github.event_name == 'pull_request'  # Run for PRs regardless of test results
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ -f coverage-report.md ]; then
            gh pr comment ${{ github.event.number }} --body-file coverage-report.md
          fi

      - name: Create monthly coverage issue
        if: always() && github.event_name == 'schedule'  # Run for scheduled runs regardless of test results
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ -f coverage-report.md ]; then
            issue_number=$(gh issue create \
              --title "Monthly Coverage Report - $(date '+%B %Y')" \
              --body-file coverage-report.md \
              --assignee itspriddle \
              --label "coverage" | grep -oE '[0-9]+$')
            gh issue close "$issue_number"
          fi
{% endraw %}
```

**Coverage Report Generation**

We use the [`gh clover-annotate`](https://github.com/built-fast/gh-clover-annotate) extension to automatically generate coverage reports and post them to PRs. This extension parses Clover XML and generates markdown tables with color-coded indicators, handling both PR comments and monthly tracking issues automatically.

The coverage report is also written to GitHub's [`$GITHUB_STEP_SUMMARY`](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#adding-a-job-summary), which displays the coverage data directly in the workflow run summary page.

### Database Schema Maintenance

Automated monthly schema squashing to maintain clean migration history:

```yaml
{%- raw -%}
# .github/workflows/squash-migrations.yml
name: Squash migrations

on:
  workflow_dispatch:
  schedule:
    - cron: '0 13 1 * *'  # 8am EST/9am EDT on the 1st of every month

jobs:
  tests:
    name: Squash migrations
    runs-on: ubuntu-latest

    env:
      DB_CONNECTION: mysql
      DB_DATABASE: app_test
      APP_ENV: testing

    steps:
      - name: Checkout code
        uses: actions/checkout@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Laravel app
        uses: ./.github/actions/laravel-setup
        with:
          database: 'true'

      - name: Squash migrations
        run: |
          php artisan schema:dump --env=testing

      - name: Configure Git
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"

      - name: Commit and create PR
        run: |
          git add database/schema/mysql-schema.sql

          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            BRANCH_NAME="feature/schema-dump-$(date '+%Y%m%d%H%I%S')"
            git checkout -b "$BRANCH_NAME"
            git commit -m "Update schema dump after migration squash"
            git push origin "$BRANCH_NAME"

            gh pr create \
              --title "Update schema dump - $(date +%Y-%m-%d)" \
              --body "Automated schema dump update from GitHub Actions" \
              --head "$BRANCH_NAME" \
              --base main
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
{% endraw %}
```

This workflow only creates a PR if there are actual schema changes, maintaining clean git history.


### Dependency Management

Dependabot handles all dependency updates on a coordinated schedule:

```yaml
{%- raw -%}
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "composer"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "11:00"
      timezone: "America/New_York"
    groups:
      composer:
        patterns: ["*"]

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "11:00"
      timezone: "America/New_York"
    groups:
      npm:
        patterns: ["*"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "11:00"
      timezone: "America/New_York"
    groups:
      github-actions:
        patterns: ["*"]

  - package-ecosystem: "github-actions"
    directory: "/.github/actions/laravel-setup"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "11:00"
      timezone: "America/New_York"
    groups:
      github-actions:
        patterns: ["*"]
{% endraw %}
```

All ecosystems (Composer, npm, GitHub Actions) update simultaneously on Monday mornings for predictable maintenance windows. Dependencies are grouped so all updates for each ecosystem come in a single PR.

## Key Takeaways

1. **Path-based triggering** prevents unnecessary workflow runs
2. **Parallel execution** reduces feedback time from ~5 minutes to ~2 minutes
3. **Custom actions** ensure consistent environment setup
4. **Automated maintenance** keeps the codebase healthy without manual intervention
5. **Quality gates** prevent bad code from reaching expensive E2E tests

This pipeline architecture has proven robust for Laravel applications, providing fast feedback while maintaining high code quality standards. The key is balancing thoroughness with speed through smart triggering and parallel execution.
