---
title: Authentication
description: All Vector Pro API requests require Bearer token authentication. Learn
  how to authenticate and manage your API keys.
category: Getting Started
order: 2
---

All Vector Pro API requests require authentication using a Bearer token in the `Authorization` header.

## Prerequisites

Before you begin, you need:

- **Vector Pro partner account** - Contact BuiltFast to become a partner
- **API key** - Generate from your partner dashboard at [builtfast.com](https://builtfast.com)

## Making Authenticated Requests

Include your API key as a Bearer token in every request:

**Base URL:** `https://api.builtfast.com`

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.builtfast.com/api/v1/vector/sites
```

## Managing API Keys

You can create multiple API keys for different purposes—CI/CD pipelines, dashboard integrations, monitoring tools.

### List API Keys

```http
GET /api/v1/vector/api-keys
```

### Create API Key

```http
POST /api/v1/vector/api-keys
```

```json
{
  "name": "CI/CD Key"
}
```

> **Important:** The key value is only returned on creation. Store it securely—you won't be able to retrieve it later.

### Delete API Key

```http
DELETE /api/v1/vector/api-keys/{id}
```

## Security Best Practices

1. **Use environment variables** - Never hardcode API keys in your application
2. **Separate keys by purpose** - Use different keys for CI/CD, dashboard, and monitoring
3. **Rotate regularly** - Periodically rotate API keys
4. **Limit access** - Only share keys with team members who need them
5. **Monitor activity** - Review event logs for unusual API activity

## Environment Configuration Examples

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

### GitHub Actions

```yaml
env:
  VECTOR_API_TOKEN: ${{ secrets.VECTOR_API_TOKEN }}
```

## Next Steps

- [API Response Format](/docs/vector-pro/getting-started/api-response-format/) - Understand API response structure
- [Create Your First Site](/docs/vector-pro/getting-started/create-first-site/) - Build your first WordPress site
- [API Keys Management](/docs/vector-pro/security/api-keys/) - Advanced API key management
