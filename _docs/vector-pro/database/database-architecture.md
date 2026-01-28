---
title: Database Architecture
description: Independent MySQL databases for each environment provide isolation and
  control over data movement.
category: Database
order: 1
---

Vector Pro provides independent MySQL databases for each environment—development, staging, and production. This architecture provides safety, testing flexibility, and control.

## Independent Databases

Every environment has its own Aurora MySQL database:

- **Development**: Persistent database for content management and testing
- **Staging**: Isolated database for pre-production testing
- **Production**: Isolated database for live data

> **Important:** Databases are **never** automatically copied during deployments. You must explicitly move data between environments.

## Why Independent Databases

### Safety

Staging changes cannot corrupt production data. Testing schema changes, importing content, or running maintenance scripts in staging has no effect on production.

### Testing Flexibility

Use different datasets in each environment:

- Production: Real customer data
- Staging: Anonymized production copy for testing
- Development: Minimal test data for fast iteration

### Control

You decide when and how data moves between environments. No accidental overwrites or synchronization surprises.

## Database Credentials

### Development Database

Credentials are returned in the site creation response and available via:

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

```json
{
  "data": {
    "db_host": "mysql.example.com",
    "db_name": "site_12345_dev",
    "db_username": "site_12345",
    "db_password": "generated_password"
  }
}
```

### Environment Databases

Each environment has separate credentials. Retrieve them via the environment endpoint:

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Access Methods

**Development:**

- WP-CLI on the container
- Direct MySQL connection from allowed IPs
- PHP code in development environment
- SFTP tools like TablePlus, Sequel Pro

**Production:**

- WP-CLI via SSH (limited)
- API-based database operations
- Secrets for connection strings

## Working With Independent Databases

Since deployments don't copy databases, use these approaches:

### WordPress Import/Export

1. Use **Tools → Export** in development WP Admin
2. Download XML file
3. Use **Tools → Import** in destination environment

### WP-CLI

```bash
# SSH into development
ssh development.site.com

# Export database
wp db export database.sql

# Download, then upload to destination and import
wp db import database.sql
```

### Blueprint Commands

```bash
# Create full site backup including database
wp vector blueprint export backup.tar.gz

# Restore database and files
wp vector blueprint import backup.tar.gz --target-url=https://newsite.com
```

## Next Steps

- [Database Import/Export](/docs/vector-pro/database/database-import-export/) - Move data between environments
- [Database Passwords](/docs/vector-pro/database/database-passwords/) - Reset database credentials
- [WP-CLI Database Commands](/docs/vector-pro/wp-cli/database-commands/) - Database management via CLI
