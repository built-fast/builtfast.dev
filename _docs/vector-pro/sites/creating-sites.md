---
title: Creating Sites
description: API reference for creating new Vector Pro sites with development containers.
category: Sites
order: 2
---

Create a new site with a fully-configured development environment.

## Create Site

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "partner_customer_id": "cust_abc123",
    "dev_php_version": "8.3",
    "name": "Client Project Alpha",
    "tags": ["client-a", "production"]
  }'
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `partner_customer_id` | string | Yes | Your internal customer identifier |
| `dev_php_version` | string | Yes | PHP version: `8.1`, `8.2`, or `8.3` |
| `name` | string | No | Friendly name for the site |
| `tags` | array | No | Tags for categorization and filtering |

## Response

```json
{
  "data": {
    "id": 12345,
    "partner_id": 1,
    "partner_customer_id": "cust_abc123",
    "name": "Client Project Alpha",
    "status": "pending",
    "dev_php_version": "8.3",
    "dev_domain": null,
    "sftp_username": null,
    "sftp_password": null,
    "sftp_host": null,
    "sftp_port": null,
    "db_username": null,
    "db_password": null,
    "db_host": null,
    "db_name": null,
    "db_port": null,
    "tags": ["client-a", "production"],
    "created_at": "2026-01-24T10:30:00.000000Z",
    "updated_at": "2026-01-24T10:30:00.000000Z"
  },
  "message": "Site created successfully",
  "http_status": 201
}
```

The site starts with `status: "pending"`. Credentials are populated once provisioning completes and status becomes `active`.

## Polling for Completion

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

When `status` is `active`, all credentials are available:

- `dev_domain` - Development subdomain
- `sftp_*` - SFTP connection details
- `db_*` - MySQL connection details

## Using Webhooks

For production integrations, use webhooks instead of polling:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/webhooks" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/vector",
    "events": ["vector.site.created"]
  }'
```

## List Sites

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites?page=1&per_page=25" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `page` | Pagination page number |
| `per_page` | Results per page (max 100) |
| `partner_customer_id` | Filter by your customer ID |
| `tags[]` | Filter by tags (multiple allowed) |

## Get Site Details

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

Returns complete site information including all access credentials and current state.

## Next Steps

- [Updating Sites](/docs/vector-pro/sites/updating-sites/) - Modify site configuration
- [Site Credentials](/docs/vector-pro/sites/site-credentials/) - Credential management and resets
- [Cloning Sites](/docs/vector-pro/sites/cloning-sites/) - Duplicate site configurations
