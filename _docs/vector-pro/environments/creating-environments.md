---
title: Creating Environments
description: API reference for creating staging, production, and custom environments.
category: Environments
order: 1
---

Create deployment targets for your site—staging, production, or custom environments.

## Create Environment

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "production",
    "php_version": "8.3",
    "is_production": true,
    "custom_domain": "www.example.com"
  }'
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Environment identifier (staging, production, etc.) |
| `php_version` | string | Yes | PHP version: `8.1`, `8.2`, or `8.3` |
| `is_production` | boolean | No | Enable CDN, WAF, SSL (only one per site) |
| `custom_domain` | string | No | Custom domain for this environment |

## Response

```json
{
  "data": {
    "id": 67890,
    "site_id": 12345,
    "name": "production",
    "php_version": "8.3",
    "is_production": true,
    "custom_domain": "www.example.com",
    "status": "pending",
    "provisioning_step": "creating_infrastructure",
    "platform_domain": null,
    "db_username": null,
    "db_password": null,
    "db_host": null,
    "db_name": null,
    "created_at": "2026-01-24T10:30:00.000000Z"
  },
  "message": "Environment created successfully",
  "http_status": 201
}
```

## Provisioning Steps

Monitor the `provisioning_step` field for real-time status:

| Step | Description |
|------|-------------|
| `creating_infrastructure` | Setting up Lambda and infrastructure |
| `configuring_database` | Creating Aurora database |
| `deploying_application` | Initial code deployment |
| `configuring_cdn` | Setting up Bunny.net CDN (production only) |
| `finalizing` | Final configuration |

## Polling for Completion

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

When `status` is `active`, the environment is ready:

```json
{
  "data": {
    "id": 67890,
    "status": "active",
    "platform_domain": "different-words.vectorpages.com",
    "db_username": "env_67890",
    "db_password": "generated-password",
    "db_host": "db.vector.app",
    "db_name": "env_67890"
  }
}
```

## Production vs Non-Production

### Production Environment

```json
{
  "name": "production",
  "php_version": "8.3",
  "is_production": true,
  "custom_domain": "www.example.com"
}
```

Gets:

- Bunny.net CDN with global edge caching
- WAF with DDoS protection
- Automatic SSL certificate provisioning
- Cache management API

### Staging Environment

```json
{
  "name": "staging",
  "php_version": "8.3",
  "is_production": false
}
```

Gets:

- Direct origin access (no CDN)
- Platform subdomain with SSL
- Suitable for testing before production

## Only One Production

Setting `is_production: true` on an environment automatically sets `is_production: false` on any other environment for the same site.

## List Environments

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites/12345/environments" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Returns all environments for the site.

## Next Steps

- [Managing Environments](/docs/vector-pro/environments/managing-environments/) - Update and delete environments
- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Deploy code to environments
- [Custom Domains](/docs/vector-pro/domains/custom-domains/) - Configure custom domains
