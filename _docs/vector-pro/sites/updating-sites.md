---
title: Updating and Deleting Sites
description: API reference for updating, suspending, and deleting Vector Pro sites.
category: Sites
order: 5
---

Manage existing sites through update, suspend, and delete operations.

## Update Site

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "partner_customer_id": "cust_abc123_updated",
    "tags": ["client-a", "production", "high-priority"]
  }'
```

### Updatable Fields

| Field | Description |
|-------|-------------|
| `partner_customer_id` | Your internal customer identifier |
| `tags` | Categorization tags |

> **Note:** PHP version and other infrastructure settings cannot be changed after creation.

## Suspend Site

Temporarily disable the development container:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/suspend" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Suspend Behavior

- Development container stops
- SFTP and SSH access disabled
- **Deployed environments continue running**
- Site can be unsuspended at any time

Suspension is useful for:

- Non-paying customers
- Temporary project pauses
- Resource management

## Unsuspend Site

Reactivate a suspended site:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/unsuspend" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

The development container restarts and access is restored.

## Delete Site

Permanently remove a site and all associated resources:

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Deletion Requirements

> **Important:** You must delete all environments before deleting a site. The API will reject deletion requests if environments exist.

### Deletion Sequence

1. Delete all environments first
2. Then delete the site

```bash
# Delete environments
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Then delete site
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### What Gets Deleted

- Development container
- Development database
- All files and media
- SSH key associations
- Site-level secrets

> **Warning:** Deletion cannot be reversed. All data is permanently removed.

## Next Steps

- [Site Credentials](/docs/vector-pro/sites/site-credentials/) - Reset passwords
- [Managing Environments](/docs/vector-pro/environments/managing-environments/) - Delete environments before sites
- [Cloning Sites](/docs/vector-pro/sites/cloning-sites/) - Create a copy before deleting
