# Introduction

Vector Pro is a managed serverless WordPress hosting API. It enables you to provision, deploy, and manage WordPress sites on AWS Lambda infrastructure with enterprise-grade CDN, WAF, and DNS services.

For architecture concepts, lifecycle states, and integration guides, see the [Vector Pro Documentation](https://builtfast.dev/vector-pro/).

## Base URL

Our API uses Bearer token authentication. All API requests must include the
your API token in the
`Authorization` header, eg:

```
curl --header "Authorization: Bearer {YOUR_API_TOKEN}" \\
  https://api.builtfast.com/api/v1/vector/sites
```

<aside class="warning">
Keep your API token secure. Do not expose it in client-side code or public repositories.
</aside>

## Quick Start

Create a site and deploy to production:

```bash
# 1. Create a site, production and staging environments are created automatically
curl -X POST https://api.builtfast.com/api/v1/vector/sites \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
      "partner_customer_id": "customer-123",
      "dev_php_version": "8.3"
    }'

# 2. Upload current dir to your development site:
sftp foo-bar@ssh.myvectorsite.com <<EOF
  put -r . /wp-content
  bye
EOF

# 3. Deploy (once environment is active)
curl -X POST https://api.builtfast.com/api/v1/vector/sites/{site}/environments/{env}/deployments \
  -H "Authorization: Bearer $API_TOKEN"
```

For detailed walkthroughs, see [Getting Started](https://builtfast.dev/vector-pro/getting-started/).

## Response Format

### Success Response (Single Resource)

```json
{
    "data": {
        "id": "01HQ7KXYZ...",
        "type": "production",
        "status": "active"
    },
    "message": "Environment created successfully",
    "http_status": 201
}
```

### Success Response (Collection)

```json
{
    "data": [...],
    "links": {
        "first": "...?page=1",
        "last": "...?page=5",
        "prev": null,
        "next": "...?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 5,
        "per_page": 15,
        "to": 15,
        "total": 73
    },
    "message": "Success",
    "http_status": 200
}
```

## Error Handling

### Validation Error

```json
{
    "data": {},
    "errors": {
        "type": ["The type field is required."],
        "php_version": ["The selected php_version is invalid."]
    },
    "message": "Validation failed",
    "http_status": 422
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | Success |
| `201` | Resource created |
| `202` | Accepted (async operation started) |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found |
| `422` | Validation error |
| `429` | Rate limit exceeded |
| `500` | Server error |

## Asynchronous Operations

Site creation, environment creation, and deployments return `202 Accepted` and process asynchronously. Configure [webhooks](https://builtfast.dev/vector-pro/webhooks/) to receive real-time notifications instead of polling.

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Standard endpoints | 1000 requests/minute |
| Deployment creation | 100 requests/minute |
| Webhook creation | 10 requests/minute |

Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are included in every response.

## Pagination

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `page` | 1 | - | Page number |
| `per_page` | 15 | 100 | Items per page |

## SDKs & Tools

Official SDKs and CLI tools are available. See [Developer Tools](https://builtfast.dev/vector-pro/developer-tools/) for installation and usage.

```bash
# PHP SDK
composer require built-fast/vector-pro-sdk

# Node.js
npm install @built-fast/vector-pro-sdk

# CLI
brew install built-fast/devtools/vector-cli
```
