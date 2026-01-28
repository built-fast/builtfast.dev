---
title: WP-CLI Diagnostics Commands
description: Health checks, security audits, and environment diagnostics via WP-CLI.
category: WP-CLI
order: 3
---

Vector development containers include extended WP-CLI commands for diagnostics, health checks, and security auditing.

## Environment Info

Get system information:

```bash
wp vector env
```

Shows:

- PHP version
- WordPress version
- Database info
- Server details
- Memory limits

### JSON Format

```bash
wp vector env --format=json
```

Useful for automated monitoring and reporting.

## Health Check

Quick site health overview:

```bash
wp vector health
```

Checks:

- WordPress version (is it current?)
- Plugin update status
- Theme update status
- Database connectivity
- File permissions
- PHP compatibility

### JSON Format

```bash
wp vector health --format=json
```

## Security Audit

Run security checks:

```bash
wp vector security
```

Checks for:

- Default admin username
- Weak user passwords (common patterns)
- Debug mode enabled
- File editing enabled
- Outdated WordPress version
- Known vulnerable plugins
- Insecure file permissions

### JSON Format

```bash
wp vector security --format=json
```

## User Auditing

### List Administrators

```bash
wp vector users admins
```

Shows all users with administrator role.

### Find Inactive Users

```bash
wp vector users inactive
```

Lists users who haven't logged in recently.

### Capability Audit

```bash
wp vector users capabilities
```

Shows users with elevated capabilities for security review.

## User Impersonation

Generate one-time login URLs for support:

```bash
wp user impersonate admin
```

Creates a temporary login URL for the specified user.

### Custom TTL

```bash
wp user impersonate admin --ttl=60
```

Link expires after 60 seconds (default is 5 minutes).

> **Security:** Impersonation links are one-time use and expire after the TTL.

## Pre-Launch Checklist

Run these commands before launching a production site:

```bash
# Clean up database
wp vector cleanup all

# Check table sizes
wp vector db tables

# Review autoloaded options
wp vector options autoload --limit=20

# Security audit
wp vector security

# Health check
wp vector health

# Verify no debug mode
wp config get WP_DEBUG
```

## Troubleshooting Performance

When investigating slow sites:

```bash
# Environment info
wp vector env

# Database diagnostics
wp vector db tables
wp vector db revisions

# Options analysis
wp vector options autoload

# Cron status
wp vector cron --overdue
wp vector cron status

# Health check
wp vector health
```

## Common Issues and Solutions

### High Autoload Size

```bash
wp vector options autoload
```

If autoloaded options exceed 1MB:

- Identify large options
- Check for plugins storing excessive data
- Consider moving data to custom tables

### Excessive Revisions

```bash
wp vector db revisions
```

If posts have hundreds of revisions:

```bash
wp vector cleanup revisions --keep=5
```

### Stuck Cron Jobs

```bash
wp vector cron --overdue
```

If cron jobs are stuck:

- Check if WP Cron is disabled
- Verify server cron is configured
- Clear stuck scheduled tasks

## Next Steps

- [Database Commands](/docs/vector-pro/wp-cli/database-commands/) - Database maintenance
- [Media Commands](/docs/vector-pro/wp-cli/media-commands/) - Media library cleanup
- [Blueprints](/docs/vector-pro/wp-cli/blueprints/) - Site export and import
