---
title: Understanding Sites
description: A site is the top-level container in Vector Pro, containing a development
  environment and optional deployment targets.
category: Sites
order: 4
---

A **site** is the top-level container in Vector Pro. Every site contains:

- **Development container** - Always present, provides SFTP/SSH/MySQL access
- **Zero or more deployed environments** - Staging, production, or custom environments
- **Partner customer ID** - Your internal tracking identifier
- **Tags** - Categorization and filtering metadata

Think of a site as a complete WordPress project workspace with built-in development infrastructure and optional deployment targets.

## Site Lifecycle States

| State | Description |
|-------|-------------|
| `pending` | Site is being provisioned |
| `active` | Site is operational and accessible |
| `suspended` | Development container is suspended (environments continue running) |
| `terminating` | Deletion in progress |
| `terminated` | Site has been deleted |

## Development Container

Every site automatically includes a fully-configured development environment:

**Access Credentials:**

- **Subdomain** - `word-pair.partner.com` (automatically generated)
- **SFTP** - Host, username, password for file management
- **MySQL** - Database host, name, username, password
- **SSH** - Key-based access with account or site-level keys
- **WordPress Admin** - Pre-installed WordPress with admin credentials

The development container is your persistent workspace for building and testing before deploying to environments.

## Site vs Environment

It's important to understand the distinction:

- **Site** = the container, including the development environment
- **Environment** = a deployment target (staging, production) within a site

A site always has a development container. Environments are optional and created separately.

## Relationship Diagram

```
Site (container)
├── Development Container (always present)
│   ├── WordPress installation
│   ├── SFTP access
│   ├── MySQL database
│   └── SSH access
├── Staging Environment (optional)
│   └── Independent database
└── Production Environment (optional)
    ├── Independent database
    ├── CDN
    ├── WAF
    └── Custom domain
```

## What Happens When You Create a Site

1. Vector Pro provisions an ECS container
2. Aurora MySQL database is created
3. WordPress is installed
4. SFTP/SSH credentials are generated
5. Platform subdomain is assigned
6. Site status changes from `pending` to `active`

This typically completes within 60-90 seconds. Use webhooks for production integrations.

## Next Steps

- [Creating Sites](/docs/vector-pro/sites/creating-sites/) - API reference for site creation
- [Understanding Environments](/docs/vector-pro/environments/understanding-environments/) - Learn about deployment targets
- [Development vs Production](/docs/vector-pro/architecture/dev-vs-production/) - Architectural differences
