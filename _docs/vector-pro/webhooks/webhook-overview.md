---
title: Webhook Overview
description: Vector Pro webhooks notify your application when events occur, enabling
  real-time integrations without polling.
category: Webhooks
order: 2
---

Vector Pro webhooks notify your application when events occur in your infrastructure. Use webhooks to automate workflows, sync data, and build real-time integrations without polling.

## How Webhooks Work

When significant events occur (site created, deployment completed, etc.), Vector sends an HTTP POST request to your configured endpoint with event details.

## Common Use Cases

- Notify customers when deployments complete
- Sync infrastructure state with your database
- Trigger CI/CD pipelines on site creation
- Build real-time status dashboards
- Automate post-deployment tasks

## Webhook Types

### HTTP Webhooks

Vector POSTs JSON payloads to your HTTPS endpoint. Each request includes an HMAC-SHA256 signature for verification.

**Requirements:**

- HTTPS endpoint (HTTP not supported)
- Responds with 2xx status code within 30 seconds
- Verifies signature on every request

### Slack Webhooks

Native Slack integration with Block Kit formatting. Use a Slack incoming webhook URL and Vector automatically formats messages with appropriate context and styling.

## Creating a Webhook

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/webhooks" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "http",
    "url": "https://your-app.com/webhooks/vector",
    "events": [
      "vector.site.created",
      "vector.deployment.completed",
      "vector.deployment.failed"
    ],
    "enabled": true
  }'
```

### Response

```json
{
  "data": {
    "id": "01JFGXK2YVWM3N4P5Q6R7S8T9U",
    "type": "http",
    "url": "https://your-app.com/webhooks/vector",
    "secret": "whsec_8f7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c",
    "events": ["vector.site.created", "vector.deployment.completed"],
    "enabled": true,
    "created_at": "2025-01-20T14:30:00+00:00"
  }
}
```

> **Important:** The `secret` is only returned once during creation. Store it securely in your environment configuration.

## Payload Structure

All webhook payloads follow this structure:

```json
{
  "event": "vector.site.created",
  "occurred_at": "2025-01-20T14:30:00+00:00",
  "data": {
    "id": "01JFGXK2YVWM3N4P5Q6R7S8T9U",
    "type": "vector_site",
    "domain": "example.com",
    "status": "active",
    "created_at": "2025-01-20T14:30:00+00:00"
  }
}
```

The `data` object contains the relevant resource with all current attributes.

## HTTP Headers

Vector includes these headers with every delivery:

```http
Content-Type: application/json
X-Vector-Event: vector.deployment.completed
X-Vector-Delivery: 01JFGXK2YVWM3N4P5Q6R7S8T9U
X-Vector-Signature: t=1705762200,v1=a3f8c2d1e4b5...
```

- `X-Vector-Event` - Event type
- `X-Vector-Delivery` - Unique delivery ID for deduplication
- `X-Vector-Signature` - HMAC signature for verification

## Best Practices

1. **Respond quickly** - Return 2xx immediately, process events asynchronously
2. **Handle duplicates** - Use `X-Vector-Delivery` for idempotency
3. **Verify signatures** - Never skip signature verification
4. **Protect your secret** - Store in environment variables
5. **Monitor failures** - Alert on high failure rates
6. **Test locally** - Use ngrok to test webhook handling

## Next Steps

- [Webhook Events](/docs/vector-pro/webhooks/webhook-events/) - Complete event type reference
- [Webhook Verification](/docs/vector-pro/webhooks/webhook-verification/) - Secure your endpoints
- [Webhook Retry Behavior](/docs/vector-pro/webhooks/webhook-retries/) - Understand retry logic
