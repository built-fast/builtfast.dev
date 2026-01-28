---
title: WP-CLI Database Commands
description: Database cleanup and diagnostics commands for maintaining WordPress database
  health.
category: WP-CLI
order: 2
---

Vector development containers include extended WP-CLI commands for database cleanup and diagnostics.

## Database Cleanup

Clean common sources of database bloat:

### Delete All Revisions

```bash
wp vector cleanup revisions
```

### Keep Recent Revisions

```bash
wp vector cleanup revisions --keep=5
```

Keeps the 5 most recent revisions per post.

### Delete Expired Transients

```bash
wp vector cleanup transients
```

Removes transients that have passed their expiration time.

### Empty Trash

```bash
wp vector cleanup trash
```

Permanently deletes all items in trash (posts, pages, comments).

### Delete Orphaned Postmeta

```bash
wp vector cleanup orphans
```

Removes postmeta entries where the parent post no longer exists.

### Run All Cleanup Tasks

```bash
wp vector cleanup all
```

Runs all cleanup operations in sequence.

### Preview Cleanup (Dry Run)

```bash
wp vector cleanup all --dry-run
```

Shows what would be deleted without making changes.

## Database Diagnostics

### Database Summary

```bash
wp vector db
```

Shows overall database statistics:

- Total size
- Table count
- Record counts

### Tables with Sizes

```bash
wp vector db tables
```

Lists all tables sorted by size, useful for identifying bloated tables.

### Revision Statistics

```bash
wp vector db revisions
```

Shows revision counts per post, helping identify posts with excessive revisions.

### Transient Statistics

```bash
wp vector db transients
```

Shows:

- Total transients
- Expired transients
- Transient data size

### Orphaned Data

```bash
wp vector db orphans
```

Identifies:

- Orphaned postmeta
- Orphaned termmeta
- Orphaned commentmeta

## Options Inspection

Analyze `wp_options` for performance issues:

### Autoloaded Options

```bash
wp vector options autoload
```

Lists autoloaded options sorted by size. Large autoloaded data slows every page load.

### Show More Options

```bash
wp vector options autoload --limit=50
```

### Search Options

```bash
wp vector options search transient
```

Find options matching a pattern.

### Total Options Size

```bash
wp vector options size
```

Shows combined size of all options.

## Performance Troubleshooting Workflow

When diagnosing slow sites:

```bash
# 1. Find large tables
wp vector db tables

# 2. Check revision count
wp vector db revisions

# 3. Find bloated autoloaded options
wp vector options autoload

# 4. Check stuck cron jobs
wp vector cron --overdue

# 5. Run cleanup if needed
wp vector cleanup all --dry-run
wp vector cleanup all
```

## Cron Inspection

### List All Scheduled Events

```bash
wp vector cron
```

### Overdue Events Only

```bash
wp vector cron --overdue
```

Shows events that should have run but haven't.

### Filter by Hook

```bash
wp vector cron --hook=woocommerce
```

### Cron System Status

```bash
wp vector cron status
```

## Database Best Practices

1. **Run cleanup regularly** - Schedule monthly cleanup for active sites
2. **Limit revisions** - Consider adding `define('WP_POST_REVISIONS', 5);` to wp-config.php
3. **Monitor autoload size** - Keep autoloaded options under 1MB
4. **Clear expired transients** - Run cleanup before and after plugin updates
5. **Check before major updates** - Run diagnostics before WordPress core updates

## Next Steps

- [Database Architecture](/docs/vector-pro/database/database-architecture/) - Understanding environment databases
- [Media Commands](/docs/vector-pro/wp-cli/media-commands/) - Media library maintenance
- [Diagnostics Commands](/docs/vector-pro/wp-cli/diagnostics-commands/) - Health and security checks
