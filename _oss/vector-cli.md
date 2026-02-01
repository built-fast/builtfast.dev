---
title: Vector CLI
period: 2025-Present
date: 2026-01-17
featured: true
github: https://github.com/built-fast/vector-cli
license: MIT
tags:
  - vector-pro
  - cli
  - devops
  - infrastructure
languages:
  - name: Rust
    icon: rust
tagline: CLI for the Vector Pro API
excerpt: |
  Official command-line interface for the Vector Pro API. Manage sites,
  environments, deployments, and more directly from your terminal.
---

The official CLI for the [Vector Pro API](https://builtfast.dev/api). Built in
Rust for speed and reliability, with automatic JSON output for scripting and
human-readable tables for interactive use.

## Installation

### Pre-built binaries

Download from [Releases](https://github.com/built-fast/vector-cli/releases):

| Platform | Architecture | File |
|----------|--------------|------|
| Linux | x86_64 | `vector-x86_64-unknown-linux-gnu.tar.gz` |
| Linux | ARM64 | `vector-aarch64-unknown-linux-gnu.tar.gz` |
| macOS | x86_64 (Intel) | `vector-x86_64-apple-darwin.tar.gz` |
| macOS | ARM64 (Apple Silicon) | `vector-aarch64-apple-darwin.tar.gz` |
| Windows | x86_64 | `vector-x86_64-pc-windows-msvc.zip` |

```bash
# Example: Linux x86_64
curl -LO https://github.com/built-fast/vector-cli/releases/latest/download/vector-x86_64-unknown-linux-gnu.tar.gz
tar xzf vector-x86_64-unknown-linux-gnu.tar.gz
sudo mv vector /usr/local/bin/
```

**macOS Gatekeeper:** If you get a security warning, run:
```bash
xattr -d com.apple.quarantine ./vector
```

### From source

```bash
cargo install --path .
```

## Quick Start

```bash
# Login with your API token
vector auth login

# List all sites
vector site list

# Create a new site
vector site create --customer-id cust-123 --dev-php-version 8.3

# Create a staging environment
vector env create site-id --name staging --php-version 8.3

# Trigger a deployment
vector deploy trigger site-id production

# View deployment history
vector deploy list site-id production
```

## API Reference

### Authentication

```bash
vector auth login                    # Interactive login
vector auth login --token YOUR_TOKEN # Login with token
vector auth status                   # Check auth status
vector auth logout                   # Clear credentials
```

### Sites

```bash
vector site list
vector site show <site_id>
vector site create --customer-id <id> --dev-php-version 8.3 [--tags tag1,tag2]
vector site update <site_id> [--customer-id <id>] [--tags tag1,tag2]
vector site clone <site_id> [--customer-id <id>] [--dev-php-version 8.3]
vector site delete <site_id>
vector site suspend <site_id>
vector site unsuspend <site_id>
vector site reset-sftp-password <site_id>
vector site reset-db-password <site_id>
vector site purge-cache <site_id> [--cache-tag <tag>] [--url <url>]
vector site logs <site_id> [--start-time <time>] [--end-time <time>] [--limit 100]
```

### Sites - SSH Keys

```bash
vector site ssh-key list <site_id>
vector site ssh-key add <site_id> --name "My Key" --public-key "ssh-rsa ..."
vector site ssh-key remove <site_id> <key_id>
```

### Environments

```bash
vector env list <site_id>
vector env show <site_id> <env_name>
vector env create <site_id> --name staging --custom-domain example.com --php-version 8.3 [--is-production]
vector env update <site_id> <env_name> [--name <name>] [--custom-domain <domain>]
vector env delete <site_id> <env_name>
vector env reset-db-password <site_id> <env_name>
```

### Environments - Secrets

```bash
vector env secret list <site_id> <env_name>
vector env secret show <site_id> <env_name> <secret_id>
vector env secret create <site_id> <env_name> --key MY_SECRET --value "secret-value"
vector env secret update <site_id> <env_name> <secret_id> [--key <key>] [--value <value>]
vector env secret delete <site_id> <env_name> <secret_id>
```

### Deployments

```bash
vector deploy list <site_id> <env_name>
vector deploy show <site_id> <env_name> <deploy_id>
vector deploy trigger <site_id> <env_name>
vector deploy rollback <site_id> <env_name> [--target-deployment-id <id>]
```

### SSL

```bash
vector ssl status <site_id> <env_name>
vector ssl nudge <site_id> <env_name> [--retry]
```

### Database

```bash
# Direct import (files under 50MB)
vector db import <site_id> <file.sql>

# Import session for large files
vector db import-session create <site_id>
vector db import-session run <site_id> <import_id>
vector db import-session status <site_id> <import_id>

# Export
vector db export create <site_id>
vector db export status <site_id> <export_id>
```

### WAF - Rate Limits

```bash
vector waf rate-limit list <site_id>
vector waf rate-limit show <site_id> <rule_id>
vector waf rate-limit create <site_id> --name "Limit" --request-count 100 --timeframe 60 --block-time 300
vector waf rate-limit update <site_id> <rule_id> [--name <name>] [--request-count <n>]
vector waf rate-limit delete <site_id> <rule_id>
```

### WAF - IP & Referrer Blocking

```bash
# Blocked IPs
vector waf blocked-ip list <site_id>
vector waf blocked-ip add <site_id> <ip>
vector waf blocked-ip remove <site_id> <ip>

# Blocked referrers
vector waf blocked-referrer list <site_id>
vector waf blocked-referrer add <site_id> <hostname>
vector waf blocked-referrer remove <site_id> <hostname>

# Allowed referrers
vector waf allowed-referrer list <site_id>
vector waf allowed-referrer add <site_id> <hostname>
vector waf allowed-referrer remove <site_id> <hostname>
```

### Account

```bash
vector account show
```

### Account - SSH Keys

```bash
vector account ssh-key list
vector account ssh-key show <key_id>
vector account ssh-key create --name "My Key" --public-key "ssh-rsa ..."
vector account ssh-key delete <key_id>
```

### Account - API Keys

```bash
vector account api-key list
vector account api-key create --name "CI Token" [--abilities read,write] [--expires-at 2025-12-31]
vector account api-key delete <token_id>
```

### Account - Secrets

```bash
vector account secret list
vector account secret show <secret_id>
vector account secret create --key MY_SECRET --value "secret-value"
vector account secret update <secret_id> [--key <key>] [--value <value>]
vector account secret delete <secret_id>
```

### Webhooks

```bash
vector webhook list
vector webhook show <webhook_id>
vector webhook create --name "My Webhook" --url "https://example.com/hook" --events site.created,deployment.completed
vector webhook update <webhook_id> [--name <name>] [--url <url>] [--enabled true]
vector webhook delete <webhook_id>
```

### Events & PHP Versions

```bash
vector event list [--from 2024-01-01] [--to 2024-12-31] [--event site.created]
vector php-versions
```

## Output Format

The CLI automatically detects context:

- **Interactive (TTY)**: Human-readable table format
- **Piped/scripted**: JSON format

Override with flags:

```bash
vector site list --json          # Force JSON
vector site list --no-json       # Force table
vector site list | jq '.data'    # Auto JSON when piped
```

## Configuration

Configuration is stored in `~/.config/vector/` (XDG-compliant):

- `credentials.json` - API token (0600 permissions)
- `config.json` - Optional settings

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VECTOR_API_KEY` | API token (overrides stored credentials) |
| `VECTOR_API_URL` | API base URL (default: `https://api.builtfast.com`) |
| `VECTOR_CONFIG_DIR` | Config directory (default: `~/.config/vector`) |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error (401, 403) |
| 3 | Validation error (422) |
| 4 | Not found (404) |
| 5 | Network/server error (5xx) |

## MCP Integration

Configure [Claude Desktop](https://claude.ai/download) to use Vector CLI as an MCP server:

```bash
vector mcp setup
```
