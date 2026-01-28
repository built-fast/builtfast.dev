---
title: API Response Format
description: All Vector Pro API responses follow a consistent JSON structure for single
  resources, collections, and errors.
category: Getting Started
order: 1
---

All Vector Pro API responses follow a consistent JSON structure.

## Single Resources

```json
{
  "data": {
    "id": 123,
    "status": "active"
  },
  "message": "Site retrieved successfully",
  "http_status": 200
}
```

## Paginated Collections

Collections include `links` and `meta` for pagination:

```json
{
  "data": [
    {"id": 1, "status": "active"},
    {"id": 2, "status": "pending"}
  ],
  "links": {
    "first": "https://api.builtfast.com/api/v1/vector/sites?page=1",
    "last": "https://api.builtfast.com/api/v1/vector/sites?page=5",
    "prev": null,
    "next": "https://api.builtfast.com/api/v1/vector/sites?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "to": 15,
    "total": 73,
    "per_page": 15,
    "last_page": 5
  },
  "message": "Sites retrieved successfully",
  "http_status": 200
}
```

### Pagination Parameters

Most list endpoints accept these query parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `page` | Page number | 1 |
| `per_page` | Results per page | 15 |

Maximum `per_page` is 100.

## Validation Errors

Validation errors return field-specific messages with HTTP status 422:

```json
{
  "data": {},
  "errors": {
    "dev_php_version": ["The dev php version field is required."],
    "partner_customer_id": ["The partner customer id must be a string."]
  },
  "message": "Validation failed",
  "http_status": 422
}
```

## Other Errors

Non-validation errors return descriptive messages:

### 401 Unauthorized

```json
{
  "data": {},
  "message": "Unauthenticated",
  "http_status": 401
}
```

### 404 Not Found

```json
{
  "data": {},
  "message": "Site not found",
  "http_status": 404
}
```

### 500 Server Error

```json
{
  "data": {},
  "message": "An unexpected error occurred",
  "http_status": 500
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 202 | Accepted (async operation started) |
| 204 | No content (successful deletion) |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation failed |
| 429 | Rate limited |
| 500 | Server error |

## Async Operations

Many operations (site creation, deployments, exports) are asynchronous. These return `202 Accepted` with a resource in `pending` status:

```json
{
  "data": {
    "id": 456,
    "status": "pending"
  },
  "message": "Site created successfully",
  "http_status": 202
}
```

Poll the resource endpoint or use webhooks to know when the operation completes.

## Next Steps

- [Create Your First Site](/docs/vector-pro/getting-started/create-first-site/) - Put the API to work
- [Webhook Overview](/docs/vector-pro/webhooks/webhook-overview/) - Replace polling with real-time notifications
