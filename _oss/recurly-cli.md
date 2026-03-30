---
title: Recurly CLI
period: 2025-Present
date: 2026-03-15
github: https://github.com/built-fast/recurly-cli
license: MIT
tags:
  - recurly
  - cli
  - billing
  - go
languages:
  - name: Go
    icon: go
tagline: CLI for the Recurly v3 API
excerpt: |
  Command-line interface for the Recurly v3 API. Manage accounts,
  subscriptions, plans, invoices, items, coupons, and transactions
  directly from your terminal.
---

A command-line interface for the [Recurly](https://recurly.com) v3 API. Built
in Go with interactive configuration, multiple output formats, built-in jq
filtering, and watch mode for polling resources.

## Installation

### Go install

```bash
go install github.com/built-fast/recurly-cli@latest
```

### From source

```bash
make build    # produces ./bin/recurly
```

## Quick Start

```bash
# Interactive setup — creates ~/.config/recurly/config.toml
recurly configure

# List accounts
recurly accounts list --limit 50 --sort created_at --order desc

# Get a subscription
recurly subscriptions get <subscription_id>

# Create an account
recurly accounts create --code acct-1 --email user@example.com

# Create a plan from a YAML file
recurly plans create --from-file plan.yaml

# Open an account in the browser
recurly open accounts <account_id>
```

## Configuration

Three-tier configuration with flags taking highest priority:

1. **Command-line flags** (highest)
2. **Environment variables**
3. **Config file** `~/.config/recurly/config.toml` (lowest)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `RECURLY_API_KEY` | API key (overrides config file) |
| `RECURLY_REGION` | Region: `us` (default) or `eu` |
| `RECURLY_SITE` | Site subdomain |

## API Reference

### Accounts

```bash
recurly accounts list
recurly accounts get <account_id>
recurly accounts create --code <code> --email <email>
recurly accounts update <account_id> [--email <email>]
recurly accounts deactivate <account_id>
recurly accounts reactivate <account_id>
```

### Accounts - Billing Info

```bash
recurly accounts billing-info get <account_id>
recurly accounts billing-info update <account_id>
recurly accounts billing-info remove <account_id>
```

### Accounts - Nested Resources

```bash
recurly accounts subscriptions list <account_id>
recurly accounts invoices list <account_id>
recurly accounts transactions list <account_id>
recurly accounts redemptions list <account_id>
recurly accounts redemptions list-active <account_id>
recurly accounts redemptions create <account_id>
recurly accounts redemptions remove <account_id> <redemption_id>
```

### Subscriptions

```bash
recurly subscriptions list
recurly subscriptions get <subscription_id>
recurly subscriptions create --plan-code <code> --account-code <code>
recurly subscriptions update <subscription_id> [--auto-renew true]
recurly subscriptions cancel <subscription_id>
recurly subscriptions reactivate <subscription_id>
recurly subscriptions pause <subscription_id>
recurly subscriptions resume <subscription_id>
recurly subscriptions terminate <subscription_id>
recurly subscriptions convert-trial <subscription_id>
```

### Plans

```bash
recurly plans list
recurly plans get <plan_id>
recurly plans create --code <code> --name <name>
recurly plans update <plan_id> [--name <name>]
recurly plans deactivate <plan_id>
```

### Plans - Add-ons

```bash
recurly plans add-ons list <plan_id>
recurly plans add-ons get <plan_id> <add_on_id>
recurly plans add-ons create <plan_id> --code <code> --name <name>
recurly plans add-ons update <plan_id> <add_on_id> [--name <name>]
recurly plans add-ons delete <plan_id> <add_on_id>
```

### Items

```bash
recurly items list
recurly items get <item_id>
recurly items create --code <code> --name <name>
recurly items update <item_id> [--name <name>]
recurly items deactivate <item_id>
recurly items reactivate <item_id>
```

### Invoices

```bash
recurly invoices list
recurly invoices get <invoice_id>
recurly invoices line-items <invoice_id>
recurly invoices collect <invoice_id>
recurly invoices void <invoice_id>
recurly invoices mark-failed <invoice_id>
```

### Coupons

```bash
recurly coupons list
recurly coupons get <coupon_id>
recurly coupons create-percent --code <code> --name <name> --discount-percent 20
recurly coupons create-fixed --code <code> --name <name>
recurly coupons create-free-trial --code <code> --name <name>
recurly coupons update <coupon_id> [--name <name>]
recurly coupons deactivate <coupon_id>
recurly coupons restore <coupon_id>
recurly coupons list-codes <coupon_id>
recurly coupons generate-codes <coupon_id>
```

### Transactions

```bash
recurly transactions list
recurly transactions get <transaction_id>
```

## Output Format

```bash
# Table (default), JSON, or pretty JSON
recurly accounts list --output table
recurly accounts list --output json
recurly accounts list --output json-pretty

# Select specific fields
recurly accounts list --field id,code,email

# Built-in jq filtering (no external jq needed)
recurly subscriptions list --jq '.data[] | select(.state == "active") | .id'
```

## Watch Mode

Poll a resource on an interval:

```bash
recurly subscriptions get <sub_id> --watch 10s
```

## Shell Completion

```bash
recurly completion bash
recurly completion zsh
```
