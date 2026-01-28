---
title: Site Logs
description: Query production logs for debugging and monitoring via Axiom integration.
category: Performance
order: 2
---

Production logs are available via Axiom integration for debugging and monitoring.

## Query Logs

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/logs?environment=production&limit=100" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `environment` | string | Filter by environment name |
| `deployment_id` | string | Filter by specific deployment |
| `start_time` | ISO 8601 | Start of time range |
| `end_time` | ISO 8601 | End of time range |
| `limit` | integer | Maximum records to return |
| `level` | string | Filter by log level (error, warning, info) |

## Response

```json
{
  "data": [
    {
      "timestamp": "2026-01-24T10:30:15Z",
      "level": "error",
      "message": "PHP Fatal error: Uncaught Exception...",
      "request_id": "abc123",
      "environment": "production",
      "deployment_id": "01JFGXK789"
    },
    {
      "timestamp": "2026-01-24T10:30:10Z",
      "level": "info",
      "message": "Request completed",
      "request_id": "def456",
      "duration_ms": 245
    }
  ]
}
```

## Time Range Queries

### Last Hour

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/logs?start_time=2026-01-24T09:30:00Z&end_time=2026-01-24T10:30:00Z" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Specific Deployment

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/logs?deployment_id=01JFGXK789" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Errors Only

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/logs?level=error" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Log Levels

| Level | Description |
|-------|-------------|
| `error` | PHP errors, exceptions, fatal errors |
| `warning` | PHP warnings, deprecation notices |
| `info` | Request completions, general information |
| `debug` | Detailed debugging (when enabled) |

## Common Debugging Scenarios

### Post-Deployment Issues

```bash
# Get logs from the last deployment
DEPLOY_ID=$(curl -s ".../deployments" | jq -r '.[0].id')
curl ".../logs?deployment_id=$DEPLOY_ID&level=error"
```

### Slow Requests

```bash
# Look for slow requests in recent logs
curl ".../logs?limit=500" | jq '.data[] | select(.duration_ms > 1000)'
```

### PHP Errors

```bash
# Filter for PHP errors
curl ".../logs?level=error" | jq '.data[] | select(.message | contains("PHP"))'
```

## Via CLI

```bash
vector site:logs <site-id>
vector site:logs <site-id> --environment=production
vector site:logs <site-id> --level=error
vector site:logs <site-id> --since="1 hour ago"
```

## Log Retention

- Production logs retained for 30 days
- Development logs retained for 7 days
- Export logs for longer retention if needed

## Best Practices

1. **Check logs after deploys** - Catch issues early
2. **Set up monitoring** - Alert on error rate spikes
3. **Use deployment filtering** - Isolate issues to specific deploys
4. **Correlate with webhooks** - Match deployment events to log entries
5. **Export critical logs** - Store important logs externally

## Next Steps

- [CDN and Caching](/docs/vector-pro/performance/cdn-caching/) - Performance optimization
- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Monitor deployments
- [WP-CLI Diagnostics](/docs/vector-pro/wp-cli/diagnostics-commands/) - Additional debugging tools
