---
title: Understanding Environments
description: Environments are deployment targets for your site—staging, production,
  or custom environments with independent databases.
category: Environments
order: 3
---

**Environments** are deployment targets for your site. While every site includes a development container, environments are where you deploy for staging and production.

## Key Characteristics

- Each environment has an **independent MySQL database**
- Only **one** environment per site can be `is_production: true`
- Production environments receive **CDN, WAF, and SSL** certificates
- Non-production environments run without CDN (direct origin access)
- Common patterns: staging, production, feature branches

## Environment Lifecycle States

| State | Description |
|-------|-------------|
| `pending` | Environment is being provisioned |
| `active` | Environment is operational |
| `suspended` | Environment is suspended |
| `terminating` | Deletion in progress |
| `terminated` | Environment has been deleted |

## Provisioning Steps

The `provisioning_step` field provides real-time status during environment creation:

1. `creating_infrastructure`
2. `configuring_database`
3. `deploying_application`
4. `configuring_cdn`
5. `finalizing`

## Production vs Non-Production

| Feature | Production (`is_production: true`) | Non-Production |
|---------|-----------------------------------|----------------|
| CDN | Yes (Bunny.net) | No |
| WAF | Yes (DDoS, rate limiting) | No |
| Custom domains | Yes with auto-SSL | Yes with auto-SSL |
| Cache management | Full CDN controls | N/A |
| Performance | Edge-cached globally | Direct to origin |

## Independent Databases

Each environment maintains its own database. This means:

- **Safety** - Staging changes cannot corrupt production data
- **Testing** - Use different datasets in each environment
- **Control** - You decide when and how data moves

> **Important:** When you deploy code from development to production, the database is NOT copied. Content must be migrated separately.

## Common Environment Patterns

### Simple: Development + Production

```
Site
├── Development (build here)
└── Production (is_production: true)
```

### Standard: Development + Staging + Production

```
Site
├── Development (build here)
├── Staging (test here)
└── Production (is_production: true)
```

### Advanced: Feature Branches

```
Site
├── Development
├── feature-checkout-redesign
├── feature-api-v2
├── Staging
└── Production (is_production: true)
```

## Only One Production Environment

A site can have only one production environment. Setting `is_production: true` on an environment automatically sets `is_production: false` on any other environment for that site.

This ensures:

- Clear CDN and WAF configuration
- Single source of truth for the live site
- Predictable domain routing

## Next Steps

- [Creating Environments](/docs/vector-pro/environments/creating-environments/) - API reference for environment creation
- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Deploy code to environments
- [Database Architecture](/docs/vector-pro/database/database-architecture/) - Moving data between environments
