---
title: Vector CLI
permalink: /vector-pro/cli/
period: 2025-Present
date: 2026-01-17
featured: true
github: https://github.com/built-fast/vector-cli
license: MIT
tags:
  - Rust
  - CLI
  - DevOps
  - Infrastructure
excerpt: |
  Command-line interface for the Vector Pro hosting platform API. Manage sites,
  environments, and deployments directly from your terminal.
---

Command-line interface for the [Vector Pro](https://builtfast.com) hosting platform API.

## Installation

### From source

```bash
cargo install --path .
```

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

## Usage

### Authentication

```bash
# Login with API token (interactive prompt)
vector auth login

# Login with token from environment or argument
vector auth login --token YOUR_TOKEN
VECTOR_API_KEY=YOUR_TOKEN vector auth login

# Check auth status
vector auth status

# Logout
vector auth logout
```

### Sites

```bash
vector site list
vector site show <ID>
vector site create --domain example.com
vector site update <ID> --php-version 8.3
vector site delete <ID> [--force]
vector site suspend <ID>
vector site unsuspend <ID>
vector site reset-sftp-password <ID>
vector site reset-db-password <ID>
vector site purge-cache <ID> [--path /specific/path]
vector site logs <ID> [--type error] [--lines 100]
```

### Environments

```bash
vector env list <SITE_ID>
vector env show <SITE_ID> <ENV_ID>
vector env create <SITE_ID> --name staging
vector env create <SITE_ID> --name production --is-production
vector env update <SITE_ID> <ENV_ID> --php-version 8.3
vector env delete <SITE_ID> <ENV_ID>
vector env suspend <SITE_ID> <ENV_ID>
vector env unsuspend <SITE_ID> <ENV_ID>
```

### Deployments

```bash
vector deploy list <SITE_ID> <ENV_ID>
vector deploy show <SITE_ID> <ENV_ID> <DEPLOY_ID>
vector deploy create <SITE_ID> <ENV_ID>
vector deploy rollback <SITE_ID> <ENV_ID> <DEPLOY_ID>
```

### SSL

```bash
vector ssl status <SITE_ID> <ENV_ID>
vector ssl nudge <SITE_ID> <ENV_ID>
```

## Output Format

- **Interactive (TTY)**: Table format
- **Piped/scripted**: JSON format

Override with `--json` or `--no-json` flags:

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

## Development

```bash
make build      # Debug build
make release    # Optimized release build
make test       # Run tests
make check      # Cargo check
make fmt        # Format code
make clippy     # Run lints
make clean      # Remove build artifacts
```

## License

MIT
