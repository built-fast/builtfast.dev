---
title: Webhook Events
description: Complete reference of all Vector Pro webhook event types.
category: Webhooks
order: 1
---

Subscribe to specific events or use wildcards (e.g., `vector.site.*` for all site events).

## Site Events

| Event | Description |
|-------|-------------|
| `vector.site.pending` | Site creation initiated |
| `vector.site.created` | Site provisioning completed |
| `vector.site.updated` | Site configuration changed |
| `vector.site.deleted` | Site permanently deleted |
| `vector.site.suspended` | Site suspended (service stopped) |
| `vector.site.unsuspended` | Site reactivated |

## Dev Site Events

| Event | Description |
|-------|-------------|
| `vector.dev-site.created` | Dev site provisioned |
| `vector.dev-site.cloned` | Dev site cloned from production |
| `vector.dev-site.suspended` | Dev site suspended |
| `vector.dev-site.unsuspended` | Dev site reactivated |
| `vector.dev-site.terminated` | Dev site permanently removed |
| `vector.dev-site.sftp-password-reset` | SFTP password changed |
| `vector.dev-site.database-password-reset` | Database password changed |
| `vector.dev-site.ssh-key-added` | SSH key added |
| `vector.dev-site.ssh-key-removed` | SSH key removed |

## Environment Events

| Event | Description |
|-------|-------------|
| `vector.environment.created` | Environment created |
| `vector.environment.updated` | Environment configuration changed |
| `vector.environment.deleted` | Environment removed |
| `vector.environment.suspended` | Environment suspended |
| `vector.environment.unsuspended` | Environment reactivated |
| `vector.environment.database-password-reset` | Database credentials rotated |

## Deployment Events

| Event | Description |
|-------|-------------|
| `vector.deployment.started` | Deployment initiated |
| `vector.deployment.completed` | Deployment succeeded |
| `vector.deployment.failed` | Deployment failed |

## CDN Events

| Event | Description |
|-------|-------------|
| `vector.cdn.setup-started` | CDN provisioning initiated |
| `vector.cdn.setup-completed` | CDN active |
| `vector.cdn.setup-failed` | CDN setup failed |

## DNS Events

| Event | Description |
|-------|-------------|
| `vector.dns.record-created` | DNS record added |
| `vector.dns.record-deleted` | DNS record removed |

## SSH Key Events

| Event | Description |
|-------|-------------|
| `vector.ssh-key.created` | SSH key added to account |
| `vector.ssh-key.deleted` | SSH key removed |

## Webhook Events

| Event | Description |
|-------|-------------|
| `vector.webhook.created` | Webhook created |
| `vector.webhook.updated` | Webhook configuration changed |
| `vector.webhook.deleted` | Webhook removed |

## Wildcard Subscriptions

Use wildcards to subscribe to all events of a category:

- `vector.site.*` - All site events
- `vector.deployment.*` - All deployment events
- `vector.environment.*` - All environment events

## Example Payloads

### Site Created

```json
{
  "event": "vector.site.created",
  "occurred_at": "2026-01-24T10:30:00+00:00",
  "data": {
    "id": 12345,
    "partner_customer_id": "cust_abc123",
    "status": "active",
    "dev_domain": "happy-panda.vectorpages.com"
  }
}
```

### Deployment Completed

```json
{
  "event": "vector.deployment.completed",
  "occurred_at": "2026-01-24T10:35:00+00:00",
  "data": {
    "id": "01JFGXK7890ABCDEF",
    "environment_id": 67890,
    "site_id": 12345,
    "status": "deployed"
  }
}
```

### Deployment Failed

```json
{
  "event": "vector.deployment.failed",
  "occurred_at": "2026-01-24T10:35:00+00:00",
  "data": {
    "id": "01JFGXK7890ABCDEF",
    "environment_id": 67890,
    "site_id": 12345,
    "status": "failed",
    "stderr": "Error: Plugin syntax error..."
  }
}
```

## Next Steps

- [Webhook Verification](/docs/vector-pro/webhooks/webhook-verification/) - Secure your endpoints
- [Webhook Retry Behavior](/docs/vector-pro/webhooks/webhook-retries/) - Understand retry logic
- [Webhook Overview](/docs/vector-pro/webhooks/webhook-overview/) - Getting started with webhooks
