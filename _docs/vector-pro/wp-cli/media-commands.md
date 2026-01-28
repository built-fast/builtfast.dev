---
title: WP-CLI Media Commands
description: Audit and manage the WordPress media library with extended WP-CLI commands.
category: WP-CLI
order: 4
---

Vector development containers include extended WP-CLI commands for media library auditing and maintenance.

## Media Summary

Get an overview of the media library:

```bash
wp vector media
```

Shows:

- Total attachments
- Total file size
- File type breakdown
- Average file size

## Find Orphaned Files

List files in `wp-content/uploads` that aren't registered in the media library:

```bash
wp vector media orphaned
```

These files:

- Exist on disk but have no database attachment
- May be leftovers from deleted posts
- May be directly uploaded via FTP
- Can safely be reviewed and removed

## Find Missing Files

List attachments in the database with missing files:

```bash
wp vector media missing
```

These attachments:

- Exist in database but file is missing from disk
- May indicate failed uploads or accidental deletion
- May need to be removed or re-uploaded

## Find Duplicate Files

Identify duplicate media files:

```bash
wp vector media duplicates
```

Shows files with:

- Identical file hashes
- Same filename in different locations
- Potential disk space savings

## Uploads Disk Usage

Check uploads directory size:

```bash
wp vector uploads-size
```

### JSON Format

```bash
wp vector uploads-size --format=json
```

Output includes:

- Total size
- Size by year/month directories
- Size by file type

## Media Maintenance Workflow

### Pre-Migration Cleanup

Before exporting a site:

```bash
# Check for issues
wp vector media orphaned
wp vector media missing
wp vector media duplicates

# Review and clean up if needed
```

### Post-Migration Verification

After importing a site:

```bash
# Verify all attachments have files
wp vector media missing

# Regenerate thumbnails if needed
wp media regenerate --yes
```

### Disk Space Recovery

When running low on space:

```bash
# Check usage
wp vector uploads-size

# Find orphaned files
wp vector media orphaned

# Find duplicates
wp vector media duplicates

# Remove orphaned files (manual review recommended)
```

## Domain Change

When changing site URLs, update media paths:

```bash
wp change-domain old.example.com new.example.com
```

This command:

- Updates `siteurl` and `home` options
- Performs search-replace in content
- Updates attachment URLs
- Handles serialized data correctly

### Preview First

```bash
wp change-domain old.example.com new.example.com --dry-run
```

## Best Practices

1. **Regular audits** - Run media diagnostics monthly
2. **Clean before export** - Remove orphaned files before migration
3. **Verify after import** - Check for missing files after migration
4. **Monitor disk usage** - Track uploads size over time
5. **Use dry-run** - Always preview destructive operations

## Next Steps

- [Blueprints](/docs/vector-pro/wp-cli/blueprints/) - Export sites with media
- [Diagnostics Commands](/docs/vector-pro/wp-cli/diagnostics-commands/) - Health and security checks
- [Database Commands](/docs/vector-pro/wp-cli/database-commands/) - Database maintenance
