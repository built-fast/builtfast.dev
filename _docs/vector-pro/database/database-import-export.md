---
title: Database Import/Export
description: Import and export databases through the API using presigned S3 URLs.
category: Database
order: 2
---

Import and export MySQL databases through the API. Large files use presigned S3 URLs for efficient transfer.

## Database Export

Export the development database to a downloadable SQL file.

### Start Export

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/database/export" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Response (202 Accepted):**

```json
{
  "data": {
    "export_id": "exp_xyz789",
    "status": "pending"
  }
}
```

### Check Export Status

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/database/export/exp_xyz789" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Response (completed):**

```json
{
  "data": {
    "export_id": "exp_xyz789",
    "status": "completed",
    "download_url": "https://s3.amazonaws.com/...",
    "expires_at": "2026-01-24T13:00:00Z"
  }
}
```

### Download Export

```bash
curl -o database.sql "https://s3.amazonaws.com/..."
```

> **Note:** Download URLs expire after 1 hour. Request a new export if the URL expires.

## Database Import

Import a SQL file into the development database.

### Create Import Session

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/database/import" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Response:**

```json
{
  "data": {
    "import_id": "imp_abc123",
    "upload_url": "https://s3.amazonaws.com/...",
    "expires_at": "2026-01-24T12:00:00Z"
  }
}
```

### Upload SQL File

```bash
curl -X PUT "https://s3.amazonaws.com/..." \
  -H "Content-Type: application/sql" \
  --data-binary "@database.sql"
```

### Run Import

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/database/import/imp_abc123/run" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Check Import Status

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/database/import/imp_abc123" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Response:**

```json
{
  "data": {
    "import_id": "imp_abc123",
    "status": "completed",
    "started_at": "2026-01-24T11:45:00Z",
    "completed_at": "2026-01-24T11:46:30Z"
  }
}
```

### Import Status Values

| Status | Description |
|--------|-------------|
| `pending` | Upload complete, waiting to run |
| `processing` | Import in progress |
| `completed` | Import successful |
| `failed` | Import failed (check error message) |

## Direct Import (Small Files)

For SQL files under 10MB, use direct upload:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/database/import-direct" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@database.sql"
```

Simpler but limited to 10MB files.

## Environment Database Export

Export from a specific environment:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/database/export" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Migration Workflow

### Development to Staging

1. Export development database
2. Download SQL file
3. Create import session for staging
4. Upload and run import

### Production to Development (for debugging)

1. Export production database
2. Download SQL file
3. Import to development
4. Debug with production data

> **Warning:** Be careful with production data. Consider anonymizing sensitive information before importing to development.

## Best Practices

1. **Always poll status** - Import/export are async operations
2. **Check for errors** - Failed imports include error messages
3. **Use direct import for small files** - Simpler API, faster
4. **Download promptly** - Export URLs expire after 1 hour
5. **Backup before import** - Export existing data before overwriting

## Next Steps

- [Database Architecture](/docs/vector-pro/database/database-architecture/) - Understanding environment databases
- [Database Passwords](/docs/vector-pro/database/database-passwords/) - Reset credentials
- [WP-CLI Blueprints](/docs/vector-pro/wp-cli/blueprints/) - Alternative migration method
