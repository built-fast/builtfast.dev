---
title: CDN and Caching
description: Production environments use Bunny.net CDN for global edge caching with
  WordPress-aware behavior.
category: Performance
order: 1
---

Vector Pro production environments use Bunny.net CDN for global edge caching. Non-production environments bypass the CDN and serve directly from origin.

## CDN Architecture

Production sites benefit from:

- **Global edge caching** - Content cached at 100+ edge locations worldwide
- **WordPress-aware caching** - Dynamic content (admin, logged-in users) stays dynamic
- **Automatic cache management** - Purged on deployments
- **Non-production bypass** - Development/staging environments skip CDN

## Cache Behavior

### Cached by Default

- Static assets (CSS, JavaScript, images)
- Anonymous page views
- Fonts and media files

### Never Cached

- WordPress admin (`/wp-admin/`)
- Logged-in user sessions
- POST requests
- Pages with specific cookies

## Cache Management API

Base endpoint: `/api/v1/vector/sites/{site_id}/cdn/cache`

### View Cache Settings

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/cdn/cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Full Cache Purge

Purge the entire site cache:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/cdn/cache/purge" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

No request body required.

### Purge by Cache Tag

Purge content matching a specific tag:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/cdn/cache/purge" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cache_tag": "images"
  }'
```

Useful for category-based purging (e.g., all product images).

### Purge Specific URL

Purge a single URL:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/cdn/cache/purge" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/style.css"
  }'
```

## When to Purge Cache

- **After deploying new assets** - Automatic on deployment
- **After content changes** - When frontend-visible content updates
- **After site-wide configuration changes** - Menu updates, theme changes
- **When debugging cache-related issues** - To verify origin behavior

## Development Workflow

Non-production environments bypass CDN automatically:

- **Development**: No caching, see changes immediately
- **Staging**: No caching, test without CDN interference
- **Production**: Full CDN caching

Test cache behavior in staging before production deployment by temporarily enabling CDN features if needed.

## Cache Headers

Vector Pro sets appropriate cache headers based on content type. Override using WordPress filters for specific use cases:

```php
// Extend cache time for specific content
add_filter('wp_headers', function($headers) {
    if (is_page('static-content')) {
        $headers['Cache-Control'] = 'public, max-age=86400';
    }
    return $headers;
});
```

## Performance Best Practices

1. **Targeted purging** - Use cache tags instead of full purges when possible
2. **Deploy timing** - Schedule deployments during low-traffic windows
3. **Monitor deployments** - Check logs after deploying to catch issues early
4. **Optimize assets** - Minimize CSS/JS for faster edge delivery

## Next Steps

- [Site Logs](/docs/vector-pro/performance/site-logs/) - Monitor cache behavior
- [WAF Protection](/docs/vector-pro/security/waf-protection/) - Security features included with CDN
- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Automatic cache purge on deploy
