---
title: Create Your First Site
description: Walk through creating your first WordPress site on Vector Pro—from site
  creation to production deployment.
category: Getting Started
order: 3
---

Create a WordPress site on Vector Pro in five steps.

## Step 1: Create a Site

```bash
curl -X POST https://api.builtfast.com/api/v1/vector/sites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_customer_id": "customer-123",
    "dev_php_version": "8.3"
  }'
```

**Response:**

```json
{
  "data": {
    "id": 456,
    "partner_id": 12,
    "partner_customer_id": "customer-123",
    "status": "pending",
    "dev_php_version": "8.3",
    "dev_domain": null,
    "sftp_username": null,
    "created_at": "2026-01-24T10:30:00.000000Z"
  },
  "message": "Site created successfully",
  "http_status": 201
}
```

The site starts with `status: "pending"` while provisioning happens asynchronously.

## Step 2: Poll for Readiness

Check the site status until it becomes `active`:

```bash
curl https://api.builtfast.com/api/v1/vector/sites/456 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response when active:**

```json
{
  "data": {
    "id": 456,
    "status": "active",
    "dev_domain": "dev-customer-123.vector.app",
    "sftp_username": "vector_456",
    "sftp_password": "generated-password",
    "sftp_host": "sftp.vector.app",
    "sftp_port": 22,
    "db_username": "vector_456",
    "db_password": "generated-db-password",
    "db_host": "db.vector.app",
    "db_name": "vector_456",
    "db_port": 3306
  },
  "message": "Site retrieved successfully",
  "http_status": 200
}
```

> **Tip:** Use webhooks instead of polling for production integrations. See [Webhook Overview](/docs/vector-pro/webhooks/webhook-overview/).

## Step 3: Access Development Environment

Once active, your development environment is ready:

- **WordPress Admin:** `https://dev-customer-123.vector.app/wp-admin`
- **SFTP Access:** Use `sftp_username`, `sftp_password`, and `sftp_host` to deploy files
- **Database Access:** Use `db_username`, `db_password`, `db_host`, and `db_name` for direct database access

## Step 4: Create Production Environment

Create a production environment with a custom domain:

```bash
curl -X POST https://api.builtfast.com/api/v1/vector/sites/456/environments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production",
    "php_version": "8.3",
    "is_production": true,
    "domains": ["example.com", "www.example.com"]
  }'
```

**Response:**

```json
{
  "data": {
    "id": 789,
    "site_id": 456,
    "name": "production",
    "php_version": "8.3",
    "is_production": true,
    "status": "pending",
    "domains": ["example.com", "www.example.com"]
  },
  "message": "Environment created successfully",
  "http_status": 201
}
```

Poll `GET /api/v1/vector/sites/456/environments/789` until `status: "active"`.

## Step 5: Deploy to Production

Deploy from development to production:

```bash
curl -X POST https://api.builtfast.com/api/v1/vector/sites/456/environments/789/deployments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "development"
  }'
```

**Response:**

```json
{
  "data": {
    "id": 101,
    "environment_id": 789,
    "status": "pending",
    "source": "development",
    "created_at": "2026-01-24T11:00:00.000000Z"
  },
  "message": "Deployment created successfully",
  "http_status": 201
}
```

Poll `GET /api/v1/vector/sites/456/environments/789/deployments/101` until `status: "completed"`.

## What's Next

Your site is live. From here you can:

- [Configure custom domains](/docs/vector-pro/domains/custom-domains/) with automatic SSL
- [Set up webhooks](/docs/vector-pro/webhooks/webhook-overview/) to replace polling
- [Use the SDKs](/docs/vector-pro/tools/php-sdk/) for easier API integration
- [Configure secrets](/docs/vector-pro/security/environment-secrets/) for environment-specific configuration
