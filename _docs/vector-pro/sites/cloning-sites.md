---
title: Cloning Sites
description: Clone a site's development container to create a new independent site
  with copied files and database.
category: Sites
order: 1
---

Clone a site's development container to create a new independent site.

## Clone Site

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/clone" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "partner_customer_id": "cust_new_client",
    "name": "Cloned Project",
    "tags": ["template-clone"]
  }'
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `partner_customer_id` | string | Yes | Customer ID for the new site |
| `name` | string | No | Friendly name for the new site |
| `tags` | array | No | Tags for the new site |

## Response

```json
{
  "data": {
    "id": 67890,
    "partner_id": 1,
    "partner_customer_id": "cust_new_client",
    "name": "Cloned Project",
    "status": "pending",
    "dev_php_version": "8.3",
    "tags": ["template-clone"],
    "created_at": "2026-01-24T11:00:00.000000Z"
  },
  "message": "Site cloned successfully",
  "http_status": 201
}
```

## What Gets Cloned

| Copied | Not Copied |
|--------|------------|
| Development container files | Environments |
| Development database | Environment databases |
| WordPress installation | Custom domains |
| Themes and plugins | SSL certificates |
| Uploaded media | SSH key associations |
| WordPress content | CDN configuration |

## What's New

The cloned site receives:

- New site ID
- New SFTP/MySQL credentials
- New development subdomain
- Independent from the original

## Cloning Behavior

- **Independent site** - Changes to the clone don't affect the original (and vice versa)
- **New credentials** - All access credentials are regenerated
- **No environments** - Environments must be created separately on the clone
- **Same PHP version** - Inherits the source site's PHP version

## Use Cases

### Template Sites

Create a base WordPress installation with your preferred theme, plugins, and configuration. Clone it for each new client:

```bash
# Clone template for new client
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/TEMPLATE_ID/clone" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_customer_id": "client_acme_corp",
    "name": "Acme Corp Website"
  }'
```

### Client Handoffs

Clone a site before handing off to a client, keeping a backup of the original state.

### Testing Major Changes

Clone a production-like site to test significant updates before deploying.

## After Cloning

The new site needs:

1. **Environments created** - Set up staging/production
2. **Domains configured** - Assign custom domains
3. **Secrets set** - Configure environment-specific secrets
4. **SSH keys attached** - Grant access to team members

## Next Steps

- [Creating Environments](/docs/vector-pro/environments/creating-environments/) - Set up deployment targets
- [Custom Domains](/docs/vector-pro/domains/custom-domains/) - Configure domains for production
- [Environment Secrets](/docs/vector-pro/security/environment-secrets/) - Set up configuration
