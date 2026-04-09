---
title: Bunny CLI
period: 2026-Present
date: 2026-04-09
github: https://github.com/built-fast/bunny-cli
license: MIT
tags:
  - bunny
  - cli
  - cdn
  - dns
  - go
languages:
  - name: Go
    icon: go
tagline: CLI for the bunny.net API
excerpt: |
  Command-line interface for the bunny.net API. Manage DNS zones, pull
  zones, storage, edge scripts, Shield security, and Stream video directly
  from your terminal.
---

A command-line interface for the [bunny.net](https://bunny.net) API. Built in
Go with interactive configuration, multiple output formats, built-in jq
filtering, and watch mode for polling resources.

## Installation

### Homebrew

```bash
brew install built-fast/devtools/bunny-cli
```

### Go install

```bash
go install github.com/built-fast/bunny-cli@latest
```

### From source

```bash
make build    # produces ./bin/bunny
```

## Quick Start

```bash
# Interactive setup — creates ~/.config/bunny/config.toml
bunny configure

# List pull zones
bunny pullzones list --limit 50

# Get a DNS zone
bunny dns get <zone_id>

# Create a DNS zone
bunny dns create --domain example.com

# Upload a file to storage
bunny storage cp local-file.txt my-zone/remote/path/

# Destructive operations require confirmation (or --yes)
bunny dns delete <zone_id> --yes
```

## Configuration

Three-tier configuration with flags taking highest priority:

1. **Command-line flags** (highest)
2. **Environment variables**
3. **Config file** `~/.config/bunny/config.toml` (lowest)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `BUNNY_API_KEY` | API key (overrides config file) |
| `BUNNY_API_URL` | API base URL (override for testing) |
| `BUNNY_STORAGE_URL` | Storage API base URL (override for testing) |
| `BUNNY_STREAM_URL` | Stream API base URL (override for testing) |

## API Reference

### DNS Zones

```bash
bunny dns list
bunny dns get <zone_id>
bunny dns create --domain <domain>
bunny dns update <zone_id>
bunny dns delete <zone_id>
bunny dns export <zone_id>
bunny dns import <zone_id> <file>
```

### DNS Records

```bash
bunny dns records list <zone_id>
bunny dns records add <zone_id> --type A --name www --value 1.2.3.4
bunny dns records update <zone_id> <record_id>
bunny dns records delete <zone_id> <record_id>
```

### DNSSEC

```bash
bunny dns dnssec enable <zone_id>
bunny dns dnssec disable <zone_id>
```

### Pull Zones

```bash
bunny pullzones list
bunny pullzones get <id>
bunny pullzones create --name <name> --origin-url <url>
bunny pullzones update <id> [--name <name>]
bunny pullzones delete <id>
bunny pullzones purge <id>
```

### Pull Zones - Edge Rules

```bash
bunny pullzones edge-rules list <pull_zone_id>
bunny pullzones edge-rules add <pull_zone_id>
bunny pullzones edge-rules enable <pull_zone_id> <edge_rule_id>
bunny pullzones edge-rules disable <pull_zone_id> <edge_rule_id>
bunny pullzones edge-rules delete <pull_zone_id> <edge_rule_id>
```

### Pull Zones - Hostnames

```bash
bunny pullzones hostnames list <pull_zone_id>
bunny pullzones hostnames add <pull_zone_id> --hostname <hostname>
bunny pullzones hostnames remove <pull_zone_id>
```

### Storage Zones

```bash
bunny storagezones list
bunny storagezones get <id>
bunny storagezones create --name <name> --region <region>
bunny storagezones update <id>
bunny storagezones delete <id>
bunny storagezones reset-password <id>
```

### Storage (File Operations)

```bash
bunny storage ls <zone>[/<path>]
bunny storage cp <src> <dst>
bunny storage rm <zone>/<path>
```

### Edge Scripts

```bash
bunny scripts list
bunny scripts get <id>
bunny scripts create --name <name>
bunny scripts update <id>
bunny scripts delete <id>
bunny scripts statistics <id>
bunny scripts rotate-key <id>
bunny scripts publish <script_id> [uuid]
```

### Edge Scripts - Code, Releases, Secrets, Variables

```bash
bunny scripts code get <id>
bunny scripts code set <id>

bunny scripts releases list <script_id>
bunny scripts releases active <script_id>

bunny scripts secrets list <script_id>
bunny scripts secrets add <script_id>
bunny scripts secrets update <script_id> <secret_id>
bunny scripts secrets delete <script_id> <secret_id>

bunny scripts variables list <script_id>
bunny scripts variables get <script_id> <variable_id>
bunny scripts variables add <script_id>
bunny scripts variables update <script_id> <variable_id>
bunny scripts variables delete <script_id> <variable_id>
```

### Shield - Zones

```bash
bunny shield zones list
bunny shield zones get <shield_zone_id>
bunny shield zones get-by-pullzone <pull_zone_id>
bunny shield zones create
bunny shield zones update <shield_zone_id>
```

### Shield - WAF

```bash
bunny shield waf rules list <shield_zone_id>
bunny shield waf profiles
bunny shield waf engine

bunny shield waf custom-rules list <shield_zone_id>
bunny shield waf custom-rules get <id>
bunny shield waf custom-rules create
bunny shield waf custom-rules update <id>
bunny shield waf custom-rules delete <id>

bunny shield waf triggered list <shield_zone_id>
bunny shield waf triggered update <shield_zone_id>
```

### Shield - Rate Limits

```bash
bunny shield rate-limits list <shield_zone_id>
bunny shield rate-limits get <id>
bunny shield rate-limits create
bunny shield rate-limits update <id>
bunny shield rate-limits delete <id>
```

### Shield - Access Lists

```bash
bunny shield access-lists list <shield_zone_id>
bunny shield access-lists get <shield_zone_id> <id>
bunny shield access-lists create <shield_zone_id>
bunny shield access-lists update <shield_zone_id> <id>
bunny shield access-lists delete <shield_zone_id> <id>
bunny shield access-lists config
bunny shield access-lists update <shield_zone_id> <config_id>
```

### Shield - Bot Detection & Upload Scanning

```bash
bunny shield bot-detection get <shield_zone_id>
bunny shield bot-detection update <shield_zone_id>

bunny shield upload-scanning get <shield_zone_id>
bunny shield upload-scanning update <shield_zone_id>
```

### Shield - Event Logs & Metrics

```bash
bunny shield event-logs <shield_zone_id> <date>

bunny shield metrics overview <shield_zone_id>
bunny shield metrics detailed <shield_zone_id>
bunny shield metrics rate-limits <shield_zone_id>
bunny shield metrics waf-rule <shield_zone_id> <rule_id>
bunny shield metrics bot-detection <shield_zone_id>
bunny shield metrics upload-scanning <shield_zone_id>
```

### Stream - Libraries

```bash
bunny stream libraries list
bunny stream libraries get <id>
bunny stream libraries create --name <name>
bunny stream libraries update <id>
bunny stream libraries delete <id>
bunny stream libraries reset-api-key <id>
bunny stream libraries languages
```

### Stream - Videos

```bash
bunny stream videos list <library_id>
bunny stream videos get <library_id> <video_id>
bunny stream videos create <library_id> --title <title>
bunny stream videos update <library_id> <video_id>
bunny stream videos delete <library_id> <video_id>
bunny stream videos upload <library_id> <file>
bunny stream videos fetch <library_id> --url <url>
bunny stream videos reencode <library_id> <video_id>
bunny stream videos transcribe <library_id> <video_id>
```

### Stream - Collections & Captions

```bash
bunny stream collections list <library_id>
bunny stream collections get <library_id> <collection_id>
bunny stream collections create <library_id>
bunny stream collections update <library_id> <collection_id>
bunny stream collections delete <library_id> <collection_id>

bunny stream captions add <library_id> <video_id>
bunny stream captions delete <library_id> <video_id>
```

### Stream - Statistics

```bash
bunny stream statistics <library_id>
bunny stream heatmap <library_id> <video_id>
```

### Account

```bash
bunny account api-keys list
bunny account audit-log <date>
```

### Billing

```bash
bunny billing details
bunny billing records
bunny billing summary
bunny billing invoice <billing-record-id>
```

### Global Resources

```bash
bunny statistics                     # Global CDN statistics
bunny regions                        # List CDN regions
bunny countries                      # List countries
```

## Output Format

```bash
# Table (default), JSON, or pretty JSON
bunny pullzones list --output table
bunny pullzones list --output json
bunny pullzones list --output json-pretty

# Select specific fields
bunny pullzones list --field id,Name,Enabled

# Built-in jq filtering (no external jq needed)
bunny pullzones list --jq '.[] | select(.Enabled == true) | .Name'
```

## Watch Mode

Poll a resource on an interval:

```bash
bunny pullzones get <id> --watch 10s
```

## Shell Completion

```bash
bunny completion bash
bunny completion zsh
bunny completion fish
bunny completion powershell
```

## Claude Code Skill

Install the bundled Claude Code skill to let Claude manage bunny.net resources directly:

```bash
bunny skill install
bunny skill uninstall
bunny skill path
```
