---
title: Getting Started
description: Get started with the Vector Pro serverless WordPress hosting API.
category: Introduction
order: 1
---

Vector Pro is a serverless WordPress hosting API that enables hosting companies, agencies, and WordPress product companies to offer scalable, white-label WordPress hosting without managing infrastructure.

This guide covers the core concepts and walks you through creating your first site.

## How Vector Pro Works

Vector Pro uses a two-environment architecture:

**Development environments** run on AWS ECS containers with full WordPress functionality—WP Admin access, plugin installation, SFTP file management, and database writes. Build your sites here just like traditional WordPress hosting.

**Production environments** run on AWS Lambda with a read-only filesystem. This constraint enables automatic scaling without the database write contention that limits traditional hosting. Deploy code and assets from development to production when ready.

Each environment has its own independent Aurora MySQL database. Changes in development don't affect production until you deploy.

## Prerequisites

- **Vector Pro partner account** — Contact BuiltFast to become a partner
- **API key** — Generate from your partner dashboard at [builtfast.com](https://builtfast.com)

## Quick Start

### 1. Authenticate

All API requests require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.builtfast.com/api/v1/vector/sites
```

### 2. Create a Site

```bash
curl -X POST https://api.builtfast.com/api/v1/vector/sites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"partner_customer_id": "customer-123", "dev_php_version": "8.3"}'
```

The site starts with `status: "pending"` while provisioning. Poll until `status: "active"` to get SFTP and database credentials.

### 3. Build in Development

Once active, you have:

- **WordPress Admin** at `https://your-site.vector.app/wp-admin`
- **SFTP access** for file uploads
- **Database access** for direct queries

Configure themes, install plugins, and create content in the development environment.

### 4. Deploy to Production

Create a production environment and deploy:

```bash
# Create production environment
curl -X POST https://api.builtfast.com/api/v1/vector/sites/456/environments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "production", "php_version": "8.3", "is_production": true}'

# Deploy from development
curl -X POST https://api.builtfast.com/api/v1/vector/sites/456/environments/789/deployments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source": "development"}'
```

## Integration Options

- **REST API** — Direct HTTP integration for maximum control
- **CLI** — Terminal-based management via `vector` command
- **PHP SDK** — Native PHP client for Laravel and WordPress integrations
- **Node SDK** — JavaScript/TypeScript client for Node.js applications

## Next Steps

- [What is Vector Pro?](/docs/vector-pro/overview/what-is-vector-pro/) — Platform overview and architecture
- [Authentication](/docs/vector-pro/getting-started/authentication/) — API key management
- [Create Your First Site](/docs/vector-pro/getting-started/create-first-site/) — Detailed walkthrough
- [Development vs Production](/docs/vector-pro/architecture/dev-vs-production/) — Understand the two-environment model
