---
title: Environment Secrets
description: Store sensitive configuration as environment variables that get injected
  during deployment.
category: Security
order: 3
---

Store sensitive configuration as environment variables that get injected during deployment. Secrets are scoped at two levels: global (all sites) and environment-specific.

## Two Levels of Secrets

**Global Secrets** - Available to ALL sites in your account.

**Environment Secrets** - Scoped to a specific environment. Override global secrets with matching keys.

## Common Use Cases

- API keys (Stripe, Mailgun, SendGrid)
- Third-party service credentials
- Environment-specific configuration
- Feature flags

## Global Secrets API

### List Global Secrets

```bash
curl "https://api.builtfast.dev/api/v1/vector/global-secrets" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

> **Note:** Secret values are never returned by the API—only key names.

### Create Global Secret

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/global-secrets" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "STRIPE_SECRET_KEY",
    "value": "sk_live_..."
  }'
```

### Update Global Secret

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/global-secrets/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "new_value"
  }'
```

### Delete Global Secret

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/global-secrets/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Environment Secrets API

### List Environment Secrets

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/secrets" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Create Environment Secret

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/secrets" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "STRIPE_SECRET_KEY",
    "value": "sk_test_..."
  }'
```

Environment secrets override global secrets with the same key.

### Update Environment Secret

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/secrets/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "new_value"
  }'
```

### Delete Environment Secret

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/secrets/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Reserved Keys

The following keys are reserved and cannot be used:

- WordPress constants: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_CHARSET`, `DB_COLLATE`
- Ymir configuration: `YMIR_*`
- AWS Lambda environment: `AWS_*`

The API will reject reserved keys with a validation error.

## How Secrets Are Injected

On deployment:

1. Global secrets loaded
2. Environment secrets override matching keys
3. All secrets available as environment variables in Lambda
4. Access via `getenv('KEY')` in PHP

### Accessing Secrets in WordPress

```php
// wp-config.php or plugin code
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY'));
```

Or access directly:

```php
$stripe = new \Stripe\StripeClient(getenv('STRIPE_SECRET_KEY'));
```

## Environment-Specific Configuration

Use secrets to configure different behavior per environment:

| Secret | Staging | Production |
|--------|---------|------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `DEBUG_MODE` | `true` | `false` |
| `API_ENDPOINT` | `staging.api.com` | `api.com` |

## Next Steps

- [SSH Keys](/docs/vector-pro/security/ssh-keys/) - Manage SSH access
- [API Keys](/docs/vector-pro/security/api-keys/) - Manage API authentication
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Monitor secret changes
