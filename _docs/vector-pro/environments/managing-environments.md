---
title: Managing Environments
description: API reference for updating, suspending, and deleting Vector Pro environments.
category: Environments
order: 2
---

Manage existing environments through update, suspend, and delete operations.

## Update Environment

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "production-v2",
    "is_production": true,
    "custom_domain": "www.newdomain.com",
    "tags": ["live", "primary"]
  }'
```

### Updatable Fields

| Field | Description |
|-------|-------------|
| `name` | Environment identifier |
| `is_production` | CDN/WAF settings |
| `custom_domain` | Custom domain |
| `tags` | Categorization tags |

### Production Flag Warning

> **Warning:** Setting `is_production: true` on an environment will automatically set `is_production: false` on any other environment for this site.

## Get Environment Details

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Returns complete environment information including:

- Status and provisioning step
- Platform domain
- Database credentials
- Custom domain and SSL status

## Suspend Environment

Temporarily disable an environment:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/suspend" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Suspend Behavior

- Lambda functions disabled
- Site returns maintenance page
- Database remains intact
- Can be unsuspended at any time

## Unsuspend Environment

Reactivate a suspended environment:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/unsuspend" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

The environment restarts and begins serving requests again.

## Delete Environment

Permanently remove an environment:

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### What Gets Deleted

- Lambda functions
- Environment database
- CDN configuration
- SSL certificates
- All deployment history

> **Warning:** Deletion cannot be reversed. All data is permanently removed.

## Reset Environment Database Password

Generate a new MySQL password for the environment:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/database/reset-password" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": {
    "db_password": "new-generated-password"
  },
  "message": "Database password reset successfully",
  "http_status": 200
}
```

## Common Patterns

### Promoting Staging to Production

Instead of "promoting," create a production environment and deploy:

```bash
# Create production environment
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production",
    "php_version": "8.3",
    "is_production": true
  }'

# Deploy from development
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/NEW_ID/deployments" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Rotating Environments

For blue-green deployments, create a new production environment and switch the production flag:

```bash
# Update old production
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/OLD_ID" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_production": false, "name": "production-old"}'

# Update new environment to production
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/NEW_ID" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_production": true}'
```

## Next Steps

- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Deploy code to environments
- [Rollbacks](/docs/vector-pro/deployments/rollbacks/) - Revert to previous deployments
- [Database Architecture](/docs/vector-pro/database/database-architecture/) - Manage environment databases
