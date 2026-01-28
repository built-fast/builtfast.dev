---
title: Command Line Interface
description: The Vector CLI provides terminal-based site management for quick operations
  and CI/CD integration.
category: Tools
order: 1
---

The Vector CLI provides terminal-based management for sites, environments, and deployments.

## Installation

### Homebrew (macOS)

```bash
brew install builtfast/tap/vector-cli
```

### Direct Download

Download PHAR or native binary from [GitHub releases](https://github.com/builtfast/vector-cli/releases).

## Authentication

### Interactive Login

```bash
vector auth:login
```

### Direct Token

```bash
vector auth:login --token=your-token
```

### Environment Variable

```bash
export VECTOR_API_KEY=your-token
```

### Check Status

```bash
vector auth:status
```

### Logout

```bash
vector auth:logout
```

## Site Management

### List Sites

```bash
vector site:list
```

### Show Site Details

```bash
vector site:show <site-id>
```

### Create Site

```bash
vector site:create --customer-id=cust_123 --php-version=8.3
```

### Update Site

```bash
vector site:update <site-id> --php-version=8.4
```

### Delete Site

```bash
vector site:delete <site-id>
```

### Suspend/Unsuspend

```bash
vector site:suspend <site-id>
vector site:unsuspend <site-id>
```

### Purge Cache

```bash
vector site:purge-cache <site-id>
```

### View Logs

```bash
vector site:logs <site-id>
```

## Environment Management

### List Environments

```bash
vector env:list --site=<site-id>
```

### Create Environment

```bash
vector env:create --site=<site-id> --name=staging --php-version=8.3
```

### Create Production Environment

```bash
vector env:create --site=<site-id> --name=production --php-version=8.3 --production
```

### Delete Environment

```bash
vector env:delete --site=<site-id> --env=<env-id>
```

## Deployments

### List Deployments

```bash
vector deploy:list --site=<site-id> --env=<env-id>
```

### Create Deployment

```bash
vector deploy:create --site=<site-id> --env=<env-id>
```

### Rollback

```bash
vector deploy:rollback <deployment-id>
```

### Watch Deployment

```bash
vector deploy:create --site=<site-id> --env=<env-id> --wait
```

The `--wait` flag polls until deployment completes or fails.

## Output Formats

### Table Format (Default)

```bash
vector site:list
```

```
┌────────┬─────────────────┬──────────┬─────────────────────────┐
│ ID     │ Customer        │ Status   │ Dev Domain              │
├────────┼─────────────────┼──────────┼─────────────────────────┤
│ 12345  │ cust_abc123     │ active   │ happy-panda.vector.app  │
│ 12346  │ cust_def456     │ active   │ quick-fox.vector.app    │
└────────┴─────────────────┴──────────┴─────────────────────────┘
```

### JSON Format

```bash
vector site:list --json
```

Automatic when output is piped:

```bash
vector site:list | jq '.[] | .id'
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Install Vector CLI
        run: |
          curl -sL https://github.com/builtfast/vector-cli/releases/latest/download/vector-linux-amd64 -o vector
          chmod +x vector
          sudo mv vector /usr/local/bin/

      - name: Deploy
        env:
          VECTOR_API_KEY: ${{ secrets.VECTOR_API_KEY }}
        run: |
          vector deploy:create \
            --site=${{ secrets.SITE_ID }} \
            --env=${{ secrets.PROD_ENV_ID }} \
            --wait
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Resource not found |
| 4 | Validation error |

## Next Steps

- [MCP Integration](/docs/vector-pro/tools/mcp-integration/) - Natural language management
- [PHP SDK](/docs/vector-pro/tools/php-sdk/) - Programmatic access in PHP
- [CI/CD Integration](/docs/vector-pro/deployments/cicd-integration/) - Automated deployments
