---
title: API Keys
description: Manage API keys for accessing the Vector Pro API.
category: Security
order: 1
---

API keys authenticate requests to the Vector Pro API. Create multiple keys for different purposes—CI/CD, dashboard integration, monitoring.

## List API Keys

```bash
curl "https://api.builtfast.dev/api/v1/vector/api-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": [
    {
      "id": "key_abc123",
      "name": "CI/CD Key",
      "last_used_at": "2026-01-24T10:30:00Z",
      "created_at": "2026-01-15T08:00:00Z"
    },
    {
      "id": "key_def456",
      "name": "Dashboard Integration",
      "last_used_at": "2026-01-24T09:15:00Z",
      "created_at": "2026-01-10T14:30:00Z"
    }
  ]
}
```

## Create API Key

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/api-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CI/CD Key"
  }'
```

### Response

```json
{
  "data": {
    "id": "key_abc123",
    "name": "CI/CD Key",
    "token": "vp_live_abc123def456...",
    "created_at": "2026-01-24T10:30:00Z"
  },
  "message": "API key created successfully",
  "http_status": 201
}
```

> **Important:** The `token` value is only returned on creation. Store it securely—you won't be able to retrieve it later.

## Delete API Key

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/api-keys/key_abc123" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

The key is immediately invalidated. Any applications using this key will receive authentication errors.

## Using API Keys

Include the key as a Bearer token:

```bash
curl -H "Authorization: Bearer vp_live_abc123def456..." \
  https://api.builtfast.com/api/v1/vector/sites
```

## Recommended Key Strategy

Create separate keys for different purposes:

| Key Name | Purpose | Permissions |
|----------|---------|-------------|
| CI/CD Key | Automated deployments | Deploy, read |
| Dashboard Integration | Customer portal | Full access |
| Monitoring Key | Health checks | Read-only |
| Development Key | Local development | Full access |

## Security Best Practices

1. **Store in environment variables** - Never commit keys to version control
2. **Use descriptive names** - Know what each key is used for
3. **Rotate periodically** - Replace keys on a regular schedule
4. **Separate by purpose** - Different keys for different integrations
5. **Monitor last_used_at** - Identify unused keys for cleanup
6. **Revoke immediately** - Delete keys when no longer needed or if compromised

## Environment Configuration

### GitHub Actions

```yaml
env:
  VECTOR_API_TOKEN: ${{ secrets.VECTOR_API_TOKEN }}
```

### Laravel

```php
// config/services.php
'vector' => [
    'api_key' => env('VECTOR_API_KEY'),
],
```

### Node.js

```javascript
const apiKey = process.env.VECTOR_API_KEY;
```

## Next Steps

- [Authentication](/docs/vector-pro/getting-started/authentication/) - Using API keys in requests
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Monitor API key usage
- [CI/CD Integration](/docs/vector-pro/deployments/cicd-integration/) - Automate with API keys
