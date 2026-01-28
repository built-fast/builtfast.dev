---
layout: post
title: "Automating API Documentation with Scribe and GitHub Actions"
date: "Thu Jan 23 18:00:00 -0500 2026"
categories: [development]
tags: [laravel, php, github-actions, documentation, automation]
author: Josh Priddle
tagline: "Stale API docs erode developer trust. Automating Scribe documentation publishing with cross-repository GitHub Actions."
---

One of the less glamorous but critically important aspects of building an API is keeping documentation current. Stale docs erode developer trust faster than almost anything else. Here's how we automated pushing Laravel Scribe-generated API documentation to our public Jekyll developer portal.

## The problem

We use [Scribe](https://scribe.knuckles.wtf) to generate API documentation from our Laravel codebase. It's excellent—it reads your routes, controllers, form requests, and docblocks to produce comprehensive docs. But the generated output lives in our private API repository, while our public developer portal is a separate Jekyll site.

Manually copying files after every API change? Not sustainable.

## The solution: cross-repository GitHub Actions

The workflow triggers whenever relevant files change—controllers, requests, resources, routes, or the Scribe config itself:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'config/scribe.php'
      - 'app/Http/Controllers/**'
      - 'app/Http/Requests/**'
      - 'app/Http/Resources/**'
      - 'routes/api.php'
```

## Generating the docs

Scribe needs a working Laravel environment with database access—it actually boots your app and introspects routes. The workflow sets up MySQL and runs:

```bash
php artisan scribe:generate
```

## The cross-repository push

Here's where it gets interesting. GitHub Actions can check out and push to a different repository using deploy keys:

```yaml
{%- raw -%}
- name: Checkout Documentation Repo
  uses: actions/checkout@v6
  with:
    repository: built-fast/builtfast.dev
    path: builtfast.dev
    ssh-key: ${{ secrets.SCRIBE_DEPLOY_KEY }}
{% endraw %}
```

The sync step copies Scribe's structured endpoint data into Jekyll's `_data` directory:

```bash
mkdir -p builtfast.dev/_data/vector_pro_endpoints/
rm -rf builtfast.dev/_data/vector_pro_endpoints/*
cp -r .scribe/endpoints/* builtfast.dev/_data/vector_pro_endpoints/

# Also sync Postman collection and OpenAPI spec
cp public/vector-pro/collection.json builtfast.dev/vector-pro/api/
cp public/vector-pro/openapi.yaml builtfast.dev/vector-pro/api/
```

## Why YAML endpoint data?

Scribe generates structured YAML files in `.scribe/endpoints/` that contain all the endpoint metadata—parameters, responses, examples. By syncing these to Jekyll's `_data` directory rather than the rendered HTML, our developer portal can:

- Apply its own theme and styling
- Build custom navigation
- Add search functionality
- Integrate docs with other portal content

Jekyll makes the data available as `site.data.vector_pro_endpoints`, which templates can iterate over however they like.

## Controlling endpoint group order

Scribe generates YAML files with numeric prefixes based on controller order, but that's rarely the order you want in your documentation. We built a custom Jekyll plugin that provides an `ordered_data` Liquid filter for explicit ordering control.

The plugin lives in `_plugins/ordered_data_filter.rb`:

```ruby
module Jekyll
  module OrderedDataFilter
    def ordered_data(data, config_key)
      return [] if data.nil?

      site_config = @context.registers[:site].config
      ordering = site_config.dig("ordered_data", config_key) || {}

      key_field = ordering["key"] || "name"
      order_list = ordering["order"] || ["*"]

      # Find wildcard position - items before * come first,
      # then alphabetical, then items after *
      wildcard_idx = order_list.index("*")
      # ... partitioning and sorting logic
    end
  end
end

Liquid::Template.register_filter(Jekyll::OrderedDataFilter)
```

Configuration goes in `_config.yml`:

```yaml
ordered_data:
  vector_pro_endpoints:
    key: name
    order:
      - Sites
      - Environments
      - Deployments
      - "*"
      - API Keys
```

The wildcard `*` means "everything else, sorted alphabetically." Items listed before the wildcard appear first in that exact order. Items after the wildcard appear last. This lets us ensure the most important endpoint groups lead the documentation while less common ones (like API Keys) sit at the bottom.

Usage in Liquid templates:

```liquid
{%- raw -%}
{% assign endpoint_files = site.data.vector_pro_endpoints | ordered_data: "vector_pro_endpoints" %}
{% for file in endpoint_files %}
    {% assign group = file[1] %}
    <!-- Render endpoint group -->
{% endfor %}
{% endraw %}
```

The plugin also sorts endpoints within each group by their `subgroup` metadata, keeping related operations together.

## Setting up deploy keys

The workflow requires an SSH deploy key for cross-repository access. Here's how to set it up:

```bash
# Generate key pair
ssh-keygen -t ed25519 -C "scribe-bot" -f scribe_deploy_key -N ""

# Add public key to target repo with write access
gh repo deploy-key add scribe_deploy_key.pub \
  --repo built-fast/builtfast.dev \
  --allow-write \
  --title "Scribe Documentation Update"

# Add private key as secret in source repo
gh secret set SCRIBE_DEPLOY_KEY --repo built-fast/quark < scribe_deploy_key
```

The public key goes to the destination repository (the Jekyll site) as a deploy key with write access. The private key becomes a secret in the source repository (the Laravel API) that the workflow uses to authenticate.

## Concurrency control

A nice touch for busy repositories:

```yaml
{%- raw -%}
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
{% endraw %}
```

If multiple API changes land in quick succession, we don't waste CI minutes generating intermediate doc versions.

## The complete workflow

Here's the full GitHub Actions workflow:

```yaml
{%- raw -%}
name: Generate and Publish API Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'config/scribe.php'
      - 'app/Http/Controllers/**'
      - 'app/Http/Requests/**'
      - 'app/Http/Resources/**'
      - 'routes/api.php'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testing
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
      - uses: actions/checkout@v6

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite, bcmath, soap, intl, gd, exif, iconv, pdo_mysql

      - name: Install dependencies
        run: composer install --prefer-dist --no-interaction

      - name: Setup environment
        run: |
          cp .env.ci .env
          php artisan key:generate
          php artisan migrate

      - name: Generate API documentation
        run: php artisan scribe:generate

      - name: Checkout Documentation Repo
        uses: actions/checkout@v6
        with:
          repository: built-fast/builtfast.dev
          path: builtfast.dev
          ssh-key: ${{ secrets.SCRIBE_DEPLOY_KEY }}

      - name: Sync documentation
        run: |
          mkdir -p builtfast.dev/_data/vector_pro_endpoints/
          rm -rf builtfast.dev/_data/vector_pro_endpoints/*
          cp -r .scribe/endpoints/* builtfast.dev/_data/vector_pro_endpoints/
          cp public/vector-pro/collection.json builtfast.dev/vector-pro/api/
          cp public/vector-pro/openapi.yaml builtfast.dev/vector-pro/api/

      - name: Commit and push
        working-directory: builtfast.dev
        run: |
          git config user.name 'Scribe Bot'
          git config user.email 'bot@builtfast.dev'
          git add -A
          git diff --staged --quiet || git commit -m "Update API documentation"
          git push
{% endraw %}
```

## The result

Every merge to main that touches API-related code now automatically updates our public developer portal. No manual steps, no stale documentation, no "I'll update the docs later" that never happens.

The internal Scribe-generated docs remain available for development, while the public portal maintains its own styling and navigation structure—all powered by the same source data.
