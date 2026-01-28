---
title: Deployment Basics
description: Deploy code from development to staging and production environments.
category: Deployments
order: 2
---

Deployments package your development code and assets, then push them to a target environment. Each deployment creates an immutable, versioned snapshot that can be rolled back.

## What Gets Deployed

**Included:**

- WordPress core files
- Themes and plugins (PHP code)
- Static assets (CSS, JavaScript, images)
- Uploaded media files (synced to S3)

**NOT included:**

- Database content (each environment has its own)
- Environment-specific secrets
- Credentials

> **Important:** Database content is never deployed between environments. Plan your content migration strategy accordingly.

## Create Deployment

Deploy the current development state to an environment:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/deployments" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Response (202 Accepted)

```json
{
  "data": {
    "id": "01JFGXK7890ABCDEF1234567",
    "environment_id": "01JFGXK1234567890ABCDEF",
    "status": "pending",
    "target_deployment_id": null,
    "stdout": null,
    "stderr": null,
    "created_at": "2026-01-24T10:30:00Z",
    "updated_at": "2026-01-24T10:30:00Z"
  },
  "message": "Deployment created successfully",
  "http_status": 202
}
```

## Deployment Lifecycle

Deployments progress through these states:

| Status | Description |
|--------|-------------|
| `pending` | Deployment queued, waiting to start |
| `deploying` | Deployment in progress |
| `deployed` | Successfully completed |
| `failed` | Deployment failed (check `stderr` for diagnostics) |

## Monitor Deployment Status

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/deployments/01JFGXK7890ABCDEF1234567" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Success Response

```json
{
  "data": {
    "id": "01JFGXK7890ABCDEF1234567",
    "status": "deployed",
    "stdout": "Deployment completed successfully\nAssets synced to CDN\n",
    "stderr": null,
    "created_at": "2026-01-24T10:30:00Z",
    "updated_at": "2026-01-24T10:32:15Z"
  }
}
```

### Failed Deployment

If `status` is `failed`, check `stderr`:

```json
{
  "data": {
    "status": "failed",
    "stderr": "Error: Plugin 'broken-plugin' has syntax errors\n"
  }
}
```

## List Deployments

Retrieve deployment history for an environment:

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/deployments" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Returns deployments ordered by creation date (newest first).

## Using Webhooks

Register for deployment events instead of polling:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/webhooks" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/vector",
    "events": [
      "vector.deployment.started",
      "vector.deployment.completed",
      "vector.deployment.failed"
    ]
  }'
```

## Deploy to Staging First

Best practice workflow:

1. Deploy development → staging
2. Verify functionality on staging
3. Deploy development → production

> **Warning:** Both staging and production deploy from development's **current state**. If you modify development between deployments, they may receive different code.

## Next Steps

- [Rollbacks](/docs/vector-pro/deployments/rollbacks/) - Revert to previous deployments
- [CI/CD Integration](/docs/vector-pro/deployments/cicd-integration/) - Automate deployments
- [Webhook Events](/docs/vector-pro/webhooks/webhook-events/) - Monitor deployments in real-time
