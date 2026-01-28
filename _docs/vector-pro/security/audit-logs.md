---
title: Audit Logs
description: Monitor all account activity with 90-day retention event logs.
category: Security
order: 2
---

Vector Pro maintains event logs with 90-day retention for auditing all account activity.

## Query Event Logs

```bash
curl "https://api.builtfast.dev/api/v1/vector/events" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": [
    {
      "id": "evt_abc123",
      "type": "vector.site.created",
      "actor": {
        "type": "api_key",
        "id": "key_xyz789",
        "name": "CI/CD Key"
      },
      "resource": {
        "type": "site",
        "id": 12345
      },
      "metadata": {
        "partner_customer_id": "cust_abc123"
      },
      "occurred_at": "2026-01-24T10:30:00Z"
    }
  ],
  "links": {
    "next": "https://api.builtfast.dev/api/v1/vector/events?page=2"
  }
}
```

## Filtering Events

### By Event Type

```bash
curl "https://api.builtfast.dev/api/v1/vector/events?type=vector.site.created" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### By Resource

```bash
curl "https://api.builtfast.dev/api/v1/vector/events?resource_type=site&resource_id=12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### By Date Range

```bash
curl "https://api.builtfast.dev/api/v1/vector/events?from=2026-01-01&to=2026-01-24" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Security-Relevant Events

Monitor these events for security auditing:

### Authentication & Access

| Event | Description |
|-------|-------------|
| `vector.api-key.created` | New API key created |
| `vector.api-key.deleted` | API key deleted |
| `vector.ssh-key.created` | SSH key added to account |
| `vector.ssh-key.deleted` | SSH key removed |
| `vector.dev-site.ssh-key-added` | SSH key attached to site |
| `vector.dev-site.ssh-key-removed` | SSH key removed from site |

### Credential Changes

| Event | Description |
|-------|-------------|
| `vector.dev-site.sftp-password-reset` | SFTP password changed |
| `vector.dev-site.database-password-reset` | Database password changed |
| `vector.environment.database-password-reset` | Environment DB password changed |

### Configuration Changes

| Event | Description |
|-------|-------------|
| `vector.webhook.created` | Webhook created |
| `vector.webhook.updated` | Webhook configuration changed |
| `vector.webhook.deleted` | Webhook removed |

### Site Lifecycle

| Event | Description |
|-------|-------------|
| `vector.site.created` | New site created |
| `vector.site.suspended` | Site suspended |
| `vector.site.deleted` | Site deleted |
| `vector.environment.created` | Environment created |
| `vector.environment.deleted` | Environment deleted |

## Actor Information

Each event includes actor details:

```json
{
  "actor": {
    "type": "api_key",
    "id": "key_xyz789",
    "name": "CI/CD Key"
  }
}
```

Actor types:

- `api_key` - Authenticated via API key
- `user` - Partner dashboard user
- `system` - Automatic platform action

## Retention

Events are retained for **90 days**. For longer retention, export events to your own logging system via webhooks.

## Security Best Practices

1. **Monitor key events** - Set up webhooks for critical security events
2. **Review regularly** - Audit access patterns monthly
3. **Investigate anomalies** - Unusual API key usage or access patterns
4. **Export for compliance** - Store events long-term for compliance requirements

## Next Steps

- [Webhook Overview](/docs/vector-pro/webhooks/webhook-overview/) - Real-time event notifications
- [API Keys](/docs/vector-pro/security/api-keys/) - Manage API access
- [SSH Keys](/docs/vector-pro/security/ssh-keys/) - Manage SSH access
