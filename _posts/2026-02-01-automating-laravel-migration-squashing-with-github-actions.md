---
layout: post
title: "Automating Laravel Migration Squashing with GitHub Actions"
date: "Sat Feb 01 10:00:00 -0500 2026"
author: Josh Priddle
categories: [laravel, github-actions, automation, devops]
tags: [php, database, migrations, workflow]
tagline: "Keep your migration history clean with automated monthly schema dumps."
---

Laravel's `schema:dump` command is a great way to keep your migration history manageable. Instead of running dozens (or hundreds) of migrations during tests and deployments, Laravel can load a single SQL dump and only run migrations created after the dump. The catch? Someone has to remember to run it. Here's how we automated the entire process with GitHub Actions.

## The Problem

Over time, Laravel applications accumulate migrations. Each new feature, refactor, or bug fix adds to the pile. This creates several issues:

- **Slower test runs** as migrations execute sequentially
- **Longer deployment times** for fresh database setups
- **Cognitive overhead** when scrolling through years of migration history

Laravel's solution is `php artisan schema:dump`, which captures the current database state as a SQL file. When migrations run, Laravel loads this dump first, then only executes migrations created after the dump.

The problem? It's easy to forget. Months pass, migrations pile up, and the schema dump becomes stale.

## The Solution: Monthly Automation

We run a GitHub Actions workflow on the first of every month that:

1. Sets up a fresh database and runs all migrations
2. Generates a new schema dump
3. Creates a pull request if the schema changed

```yaml
{%- raw %}
name: Squash migrations

on:
  workflow_dispatch:
  schedule:
    - cron: '0 13 1 * *'  # 8am EST/9am EDT on the 1st of every month

jobs:
  squash:
    name: Squash migrations
    runs-on: ubuntu-latest

    env:
      DB_CONNECTION: mysql
      DB_DATABASE: app_test
      DB_USERNAME: root
      DB_PASSWORD: root
      APP_ENV: testing

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'

      - name: Install dependencies
        run: composer install --no-scripts --no-progress --prefer-dist

      - name: Prepare environment
        run: |
          cp .env.example .env
          php artisan key:generate

      - name: Start MySQL and run migrations
        run: |
          sudo /etc/init.d/mysql start
          php artisan migrate --env=testing --force

      - name: Generate schema dump
        run: php artisan schema:dump --env=testing

      - name: Create PR if schema changed
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add database/schema/mysql-schema.sql

          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            BRANCH_NAME="chore/schema-dump-$(date '+%Y%m%d')"
            git checkout -b "$BRANCH_NAME"
            git commit -m "Update schema dump"
            git push origin "$BRANCH_NAME"

            gh pr create \
              --title "Update schema dump - $(date +%Y-%m-%d)" \
              --body "Automated schema dump update from GitHub Actions" \
              --head "$BRANCH_NAME" \
              --base main
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
{% endraw -%}
```

## How It Works

**Scheduled execution**: The `cron` expression `0 13 1 * *` runs at 1pm UTC on the first of every month. We also include `workflow_dispatch` to allow manual triggers when needed.

**Database setup**: GitHub Actions runners include MySQL by default. We start the service, run migrations to build the current schema, then dump it.

**Conditional PR creation**: The workflow checks `git diff --staged --quiet` to determine if the schema actually changed. No changes means no PR—keeping your repository clean.

**Automatic PR**: When changes exist, the workflow creates a timestamped branch, commits the schema dump, and opens a pull request for review.

## Why a Pull Request?

We create a PR rather than committing directly to main for a few reasons:

- **Review opportunity**: Schema changes are visible before merging
- **CI validation**: The PR triggers your normal test suite to catch any issues
- **Audit trail**: PRs provide context and history for schema changes

## Adapting for PostgreSQL

If you're using PostgreSQL instead of MySQL, adjust the workflow:

```yaml
{%- raw %}
env:
  DB_CONNECTION: pgsql
  DB_DATABASE: app_test
  DB_USERNAME: postgres
  DB_PASSWORD: postgres

# ...

- name: Start PostgreSQL and run migrations
  run: |
    sudo systemctl start postgresql
    sudo -u postgres createdb app_test
    php artisan migrate --env=testing --force

- name: Generate schema dump
  run: php artisan schema:dump --env=testing

# Update the git add path
- name: Create PR if schema changed
  run: |
    git add database/schema/pgsql-schema.sql
    # ... rest of the script
{% endraw -%}
```

## Benefits

This automation provides:

- **Consistent schema dumps** without relying on human memory
- **Faster CI runs** as migrations stay minimal between dumps
- **Clean git history** with predictable monthly updates
- **Zero maintenance** once configured

The workflow runs quietly in the background. Once a month, if your schema has changed, a PR appears for review. If nothing changed, nothing happens. Set it and forget it.
