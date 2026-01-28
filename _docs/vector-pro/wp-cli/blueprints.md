---
title: WP-CLI Blueprints
description: Export and import WordPress sites as portable archives using WP-CLI blueprint
  commands.
category: WP-CLI
order: 1
---

Every Vector development container includes extended WP-CLI commands for site blueprints—portable archives that capture files and database for migration.

## Accessing WP-CLI

SSH into the development container:

```bash
ssh vector_12345@sftp.vector.app
```

Then run `wp` commands directly.

## Export Blueprint

### Basic Export

```bash
wp vector blueprint export backup.tar.gz
```

Creates a compressed archive with WordPress files and database.

### Include Uploads

```bash
wp vector blueprint export backup.tar.gz --include-uploads
```

### Limit Upload Size

```bash
wp vector blueprint export backup.tar.gz --include-uploads --max-upload-size=100M
```

Excludes files larger than the specified size.

### Include Specific Plugins

```bash
wp vector blueprint export backup.tar.gz --include-plugins=my-plugin
```

Only includes the specified plugins. Multiple plugins can be comma-separated.

### Include Specific Themes

```bash
wp vector blueprint export backup.tar.gz --include-themes=my-theme
```

### Exclude Database Tables

```bash
wp vector blueprint export backup.tar.gz --exclude-tables=wp_sessions,wp_transients
```

Useful for excluding session data, transients, or other temporary tables.

## Import Blueprint

### Basic Import

```bash
wp vector blueprint import backup.tar.gz
```

### Import with New URL

```bash
wp vector blueprint import backup.tar.gz --target-url=https://newsite.com
```

Performs search-replace for the new domain automatically.

### Preview Import (Dry Run)

```bash
wp vector blueprint import backup.tar.gz --dry-run
```

Shows what would be imported without making changes.

### Skip Database Import

```bash
wp vector blueprint import backup.tar.gz --skip-database
```

Imports files only, preserving the existing database.

### Skip File Import

```bash
wp vector blueprint import backup.tar.gz --skip-files
```

Imports database only, preserving existing files.

## Validate Blueprint

Check blueprint integrity before importing:

```bash
wp vector blueprint validate backup.tar.gz
```

Verifies:

- Archive integrity
- Required WordPress files present
- Database dump valid
- No corrupted data

## Migration Workflow

### Migrating to Vector Pro

1. Export from source server:

```bash
wp vector blueprint export site.tar.gz --include-uploads
```

2. Transfer to Vector container (via SFTP or scp)

3. Import with new domain:

```bash
wp vector blueprint import site.tar.gz --target-url=https://new.domain.com
```

### Cloning Between Environments

1. Export from development:

```bash
wp vector blueprint export dev-backup.tar.gz
```

2. SSH into staging container and import:

```bash
wp vector blueprint import dev-backup.tar.gz
```

### Creating Template Sites

1. Configure a base WordPress installation with themes, plugins, settings

2. Export as template:

```bash
wp vector blueprint export template.tar.gz --exclude-tables=wp_posts,wp_postmeta
```

3. Use for new client sites

## Blueprint Contents

A blueprint archive contains:

```
backup.tar.gz
├── database.sql          # MySQL dump
├── wp-content/
│   ├── plugins/          # All or specified plugins
│   ├── themes/           # All or specified themes
│   ├── uploads/          # Media files (if --include-uploads)
│   └── mu-plugins/       # Must-use plugins
└── manifest.json         # Blueprint metadata
```

## Next Steps

- [Database Commands](/docs/vector-pro/wp-cli/database-commands/) - Database cleanup and diagnostics
- [Database Import/Export](/docs/vector-pro/database/database-import-export/) - API-based database operations
- [Cloning Sites](/docs/vector-pro/sites/cloning-sites/) - API-based site cloning
