---
title: Webhook Retry Behavior
description: Understanding Vector Pro's automatic retry behavior for failed webhook
  deliveries.
category: Webhooks
order: 3
---

If your endpoint doesn't respond with a 2xx status code, Vector automatically retries with exponential backoff.

## Retry Schedule

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | ~42 seconds |
| 3 | ~2.5 minutes |
| 4 | ~9 minutes |
| 5 | ~30 minutes |

After 5 failed attempts, Vector stops retrying.

## Success Criteria

A delivery is considered successful when:

- HTTP status code 200-299
- Response received within 30 seconds

## Common Failure Causes

### Timeout

Your endpoint takes more than 30 seconds to respond.

**Solution:** Return 2xx immediately, then process the event asynchronously via a job queue.

### Error Status Code

Your endpoint returns 4xx or 5xx.

**Solution:** Fix the error condition. Check delivery logs for details.

### Network Errors

Connection refused, DNS failures, TLS errors.

**Solution:** Verify your endpoint is accessible and HTTPS is properly configured.

## Handling Failures

### View Delivery Logs

Inspect delivery attempts for the past 90 days:

```bash
curl "https://api.builtfast.dev/api/v1/vector/webhooks/{id}/logs" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": [
    {
      "id": "01JFGXK2YVWM3N4P5Q6R7S8T9U",
      "event": "vector.deployment.completed",
      "status_code": 200,
      "response_time_ms": 127,
      "attempt": 1,
      "delivered_at": "2025-01-20T14:30:00+00:00"
    },
    {
      "id": "01JFGXK2YVWM3N4P5Q6R7S8T9V",
      "event": "vector.site.created",
      "status_code": 500,
      "response_time_ms": 2345,
      "attempt": 1,
      "delivered_at": "2025-01-20T14:25:00+00:00"
    }
  ]
}
```

Logs include request/response details for debugging.

## Webhook Management

### Disable Webhook

Temporarily stop deliveries without deleting:

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/webhooks/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Re-enable Webhook

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/webhooks/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Delete Webhook

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/webhooks/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Idempotency

Use the `X-Vector-Delivery` header for deduplication:

```php
$deliveryId = $_SERVER['HTTP_X_VECTOR_DELIVERY'];

// Check if already processed
if (Cache::has("webhook_processed:{$deliveryId}")) {
    return response('OK', 200);
}

// Process event
processEvent($event);

// Mark as processed (TTL: 7 days)
Cache::put("webhook_processed:{$deliveryId}", true, 604800);
```

This prevents double-processing if Vector retries a delivery that actually succeeded but had a timeout.

## Best Practices

1. **Respond immediately** - Return 200 first, process later
2. **Use job queues** - Laravel jobs, BullMQ, SQS
3. **Implement idempotency** - Store processed delivery IDs
4. **Monitor failure rates** - Alert when webhooks fail repeatedly
5. **Check logs regularly** - Identify patterns in failures

## Missing Events

Webhooks are best-effort. For critical data:

1. Use webhooks for real-time notifications
2. Implement periodic sync as a backup
3. Poll the API for any missed events

## Next Steps

- [Webhook Verification](/docs/vector-pro/webhooks/webhook-verification/) - Secure your endpoints
- [Webhook Events](/docs/vector-pro/webhooks/webhook-events/) - Event type reference
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Track all activity
