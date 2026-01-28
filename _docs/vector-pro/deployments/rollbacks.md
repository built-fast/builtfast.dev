---
title: Rollbacks
description: Roll back to a previous deployment when something goes wrong.
category: Deployments
order: 3
---

Rollback creates a new deployment that restores a previous state. Deployment history is preserved—rollbacks are just new deployments targeting old snapshots.

## Rollback to Last Successful Deployment

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/rollback" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

This rolls back to the most recent successful deployment.

## Rollback to Specific Deployment

Target a specific deployment by ID:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/rollback" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "target_deployment_id": "01JFGXK7890ABCDEF1234567"
  }'
```

## Response

```json
{
  "data": {
    "id": "01JFGXK9999NEWROLLBACK99",
    "environment_id": "01JFGXK1234567890ABCDEF",
    "status": "pending",
    "target_deployment_id": "01JFGXK7890ABCDEF1234567",
    "stdout": null,
    "stderr": null,
    "created_at": "2026-01-24T11:00:00Z",
    "updated_at": "2026-01-24T11:00:00Z"
  },
  "message": "Rollback initiated successfully",
  "http_status": 202
}
```

Note the `target_deployment_id` field indicating which deployment is being restored.

## Monitor Rollback Progress

Rollbacks are deployments. Use the same status endpoint:

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/deployments/01JFGXK9999NEWROLLBACK99" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Finding Deployments to Roll Back To

List deployment history to find the target:

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/deployments" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Look for deployments with `status: "deployed"` that represent known-good states.

## What Rollback Restores

- WordPress core files
- Themes and plugins
- Custom code
- Static assets

## What Rollback Does NOT Restore

- **Database content** - The database is NOT rolled back
- **Uploaded media** - Media files remain unchanged
- **Environment secrets** - Secrets are not affected

> **Important:** If your deployment issue involves database schema changes, you'll need to handle database rollback separately.

## Rollback Strategies

### Quick Recovery

For urgent production issues, roll back first, investigate later:

```bash
# Immediate rollback to last good state
curl -X POST ".../rollback" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Targeted Rollback

When you know exactly which deployment was stable:

```bash
# Roll back to specific version
curl -X POST ".../rollback" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_deployment_id": "01JFGXK_KNOWN_GOOD_ID"}'
```

### Database Migrations

If the issue involves database changes:

1. Roll back code via API
2. SSH into environment
3. Revert database migrations manually
4. Verify site functionality

## Next Steps

- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Understanding the deployment process
- [CI/CD Integration](/docs/vector-pro/deployments/cicd-integration/) - Automate deployments with rollback safety
- [Database Management](/docs/vector-pro/database/database-architecture/) - Handling database rollbacks
