---
title: Optimizing WordPress Performance
category: wordpress
date: 2026-01-15
author: Josh Priddle
tags:
  - WordPress
  - Performance
  - Caching
  - Optimization
excerpt: |
  Techniques for making your WordPress site faster, from server-level
  optimizations to front-end performance tuning.
---

A fast website isn't optional anymore. Page speed affects user experience, conversion rates, and search rankings. Here's how to optimize WordPress performance on BuiltFast hosting.

## Understanding Performance Metrics

Before optimizing, establish your baseline. Key metrics to track:

- **Time to First Byte (TTFB)**: Server response time, aim for <200ms
- **Largest Contentful Paint (LCP)**: Main content visible, aim for <2.5s
- **First Input Delay (FID)**: Interactivity, aim for <100ms
- **Cumulative Layout Shift (CLS)**: Visual stability, aim for <0.1

Test with [PageSpeed Insights](https://pagespeed.web.dev/) and [WebPageTest](https://webpagetest.org/).

## Server-Level Optimization

### PHP Version

Always run the latest supported PHP version. Each release brings significant performance improvements:

| PHP Version | Relative Performance |
|-------------|---------------------|
| 7.4         | Baseline            |
| 8.0         | ~15% faster         |
| 8.1         | ~20% faster         |
| 8.2         | ~25% faster         |
| 8.3         | ~30% faster         |

Update in the BuiltFast dashboard under **Sites > [Your Site] > Settings > PHP Version**.

### OPcache

BuiltFast enables OPcache by default. This caches compiled PHP code, dramatically reducing execution time on subsequent requests.

Verify it's active with a simple test:

```php
<?php
phpinfo();
// Look for "Zend OPcache" section
```

### Object Caching

For sites with complex queries, enable Redis object caching:

1. Navigate to **Sites > [Your Site] > Settings > Object Cache**
2. Enable Redis
3. Install the Redis Object Cache plugin in WordPress

This caches database query results in memory, reducing load on MySQL.

## Page Caching

Page caching stores fully-rendered HTML pages, bypassing PHP and database entirely for repeat visitors.

### BuiltFast Edge Cache

Our CDN caches static pages at edge locations worldwide. Configure cache rules in the dashboard:

```yaml
Default TTL: 3600 (1 hour)
Static assets: 31536000 (1 year)
API endpoints: 0 (no cache)
```

### WordPress Caching Plugin

For dynamic cache control, add WP Super Cache:

```php
// wp-config.php
define('WP_CACHE', true);
```

Configure settings:

- **Caching**: ON - WP Super Cache
- **Cache Delivery Method**: Expert (mod_rewrite)
- **Cache Timeout**: 3600 seconds

## Database Optimization

### Clean Up Revisions

WordPress stores unlimited post revisions by default. Limit them:

```php
// wp-config.php
define('WP_POST_REVISIONS', 5);
```

Remove existing excess revisions with WP-CLI:

```bash
wp post delete $(wp post list --post_type='revision' --format=ids)
```

### Optimize Tables

Database tables fragment over time. Optimize monthly:

```sql
OPTIMIZE TABLE wp_posts;
OPTIMIZE TABLE wp_postmeta;
OPTIMIZE TABLE wp_options;
```

Or use a plugin like WP-Optimize for automated maintenance.

### Autoloaded Options

Some plugins abuse the autoload feature. Identify bloat:

```sql
SELECT SUM(LENGTH(option_value)) as size
FROM wp_options
WHERE autoload = 'yes';
```

If over 1MB, investigate and clean up unnecessary autoloaded data.

## Image Optimization

Images typically account for 50%+ of page weight.

### Serve Modern Formats

Configure your image plugin to serve WebP to supported browsers:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_ACCEPT} image/webp
  RewriteCond %{REQUEST_FILENAME}.webp -f
  RewriteRule ^(.+)\.(jpe?g|png)$ $1.$2.webp [T=image/webp,L]
</IfModule>
```

### Lazy Loading

WordPress 5.5+ includes native lazy loading. Verify it's enabled:

```php
// Should return true
has_filter('wp_lazy_loading_enabled');
```

For above-the-fold images, disable lazy loading to avoid LCP issues:

```html
<img src="hero.jpg" loading="eager" fetchpriority="high">
```

### Responsive Images

WordPress generates multiple sizes automatically. Ensure your theme uses srcset:

```php
the_post_thumbnail('large', [
    'sizes' => '(max-width: 768px) 100vw, 50vw'
]);
```

## Front-End Performance

### Minimize Render-Blocking Resources

Identify blocking CSS and JS with PageSpeed Insights. Solutions:

1. **Inline critical CSS** - Include above-the-fold styles in `<head>`
2. **Defer non-critical JS** - Add `defer` or `async` attributes
3. **Preload key resources** - Fonts, hero images, critical scripts

```php
// functions.php
add_action('wp_head', function() {
    echo '<link rel="preload" href="' . get_template_directory_uri() . '/fonts/inter.woff2" as="font" crossorigin>';
}, 1);
```

### Reduce Plugin Impact

Each plugin adds weight. Audit with Query Monitor:

1. Enable Query Monitor
2. Load a representative page
3. Check "Scripts" and "Styles" panels
4. Identify plugins loading assets unnecessarily

Disable plugin assets on pages where they're not needed:

```php
add_action('wp_enqueue_scripts', function() {
    if (!is_page('contact')) {
        wp_dequeue_style('contact-form-7');
        wp_dequeue_script('contact-form-7');
    }
}, 100);
```

## Monitoring Performance

Set up ongoing monitoring:

1. **Google Search Console** - Core Web Vitals report
2. **Real User Monitoring** - New Relic, Datadog, or similar
3. **Synthetic Testing** - Scheduled PageSpeed tests

Create a performance budget and alert on regressions:

| Metric | Budget | Alert Threshold |
|--------|--------|-----------------|
| Page Weight | 1.5MB | 2MB |
| Requests | 50 | 75 |
| LCP | 2.0s | 2.5s |

## Checklist

Before launching, verify:

- [ ] PHP 8.3 enabled
- [ ] Page caching active
- [ ] Images optimized and lazy-loaded
- [ ] No render-blocking resources
- [ ] Database optimized
- [ ] CDN configured
- [ ] Monitoring in place

Run a final PageSpeed Insights test and address any remaining issues.
