---
title: Serverless Architecture
description: Deep dive into Vector Pro's serverless WordPress architecture on AWS
  Lambda.
category: Architecture
order: 2
---

Vector Pro runs production WordPress on AWS Lambda—serverless functions that scale automatically with traffic.

## The Serverless Shift

Traditional WordPress hosting keeps servers running 24/7. You pay for capacity whether you need it or not. Traffic spikes can overwhelm your server and crash your site.

Vector Pro on Lambda means:

- **Automatic scaling** - From zero to thousands of requests per second
- **Pay per request** - No cost for idle capacity
- **No capacity planning** - Infrastructure adapts to demand
- **No downtime from traffic** - Spikes handled automatically

## The Tradeoff

Lambda has no persistent filesystem. This fundamentally changes how WordPress operates in production.

### Read-Only Filesystem

Production WordPress runs with an immutable codebase:

- **Code is packaged** at deploy time
- **No runtime writes** to the filesystem
- **Media stored in S3** rather than local filesystem
- **Plugins that write files** won't work in production

### No WordPress Admin

The `/wp-admin` path is disabled in production:

- Content management happens in development
- Configuration is locked after deploy
- Changes require redeployment

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Compute** | AWS Lambda | Serverless WordPress execution |
| **Development** | AWS ECS | Container-based dev environment |
| **Database** | AWS Aurora MySQL | Managed database per environment |
| **Storage** | Amazon S3 | Media and asset storage |
| **CDN** | Bunny.net | Global edge caching |
| **Security** | Bunny Shield | WAF and DDoS protection |
| **Deployment** | Ymir | WordPress Lambda packaging |

## Request Flow

### Production Request

```
Client Request
    ↓
Bunny.net CDN Edge
    ↓ (cache miss)
WAF/DDoS Protection
    ↓
AWS Lambda (cold start or warm)
    ↓
Aurora MySQL Database
    ↓
S3 (media files)
    ↓
Response → CDN Cache → Client
```

### Development Request

```
Client Request
    ↓
ECS Container
    ↓
Aurora MySQL Database
    ↓
Local Filesystem
    ↓
Response → Client
```

## Lambda Characteristics

### Cold Starts

Lambda functions spin up on demand. A "cold start" occurs when no warm instance is available:

- First request after idle period: ~1-3 seconds
- Subsequent requests: milliseconds

Mitigation strategies:

- CDN caching reduces Lambda invocations
- Common paths stay warm from regular traffic
- Database connections are pooled

### Concurrency

Lambda scales horizontally:

- Each request gets its own function instance
- Thousands of concurrent requests supported
- No database connection exhaustion (pooled)

### Memory and Timeout

Production functions are configured with:

- Sufficient memory for WordPress execution
- Appropriate timeouts for page generation
- Optimized for typical WordPress workloads

## Database Architecture

Each environment has an independent Aurora MySQL database:

- **Serverless scaling** - Scales with query load
- **Automatic failover** - Multi-AZ resilience
- **Connection pooling** - Prevents connection exhaustion
- **Independent data** - Environments isolated from each other

## S3 Media Storage

Media files are stored in S3 rather than the Lambda filesystem:

- **Unlimited storage** - No filesystem constraints
- **CDN integration** - Served from edge locations
- **Deployment separation** - Media persists across deploys

## CDN Layer

Bunny.net CDN provides:

- **Global edge network** - 100+ locations
- **WordPress-aware caching** - Dynamic content stays dynamic
- **Automatic invalidation** - Cache cleared on deploy
- **WAF protection** - Security at the edge

## Implications for Development

### Compatible Plugins

Plugins must work without filesystem writes:

- Cache plugins that use object cache ✓
- Cache plugins that write to filesystem ✗
- Contact forms ✓
- File-based session plugins ✗

### Development Workflow

1. Build in development (traditional WordPress)
2. Test read-only compatibility
3. Deploy to production (serverless)
4. Iterate

## Next Steps

- [Development vs Production](/docs/vector-pro/architecture/dev-vs-production/) - Environment differences
- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - How deployments work
- [CDN and Caching](/docs/vector-pro/performance/cdn-caching/) - CDN architecture
