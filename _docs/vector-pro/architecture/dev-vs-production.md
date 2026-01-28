---
title: Development vs Production Environments
description: Vector Pro sites run in two distinct environments with different architectures—development
  for building and production for serving at scale.
category: Architecture
order: 1
---

Vector Pro sites run in two distinct environments with fundamentally different architectures. Understanding this split is essential for building on the platform.

## Development Environment

Development runs on AWS ECS containers—persistent infrastructure with a writable filesystem.

You get:

- Full WordPress admin access at `https://your-site.partner.com`
- SFTP access for file management
- Plugin and theme installation
- Content creation and editing
- Database writes and updates

Development is where you build. It operates like traditional WordPress hosting.

## Production Environment

Production runs on AWS Lambda—serverless functions with no persistent storage.

Key characteristics:

- **Read-only filesystem** - code and assets are immutable
- **No WordPress admin** - `/wp-admin` is disabled
- **No direct file writes** - plugins that write files won't work
- **Independent database** - content lives in its own MySQL instance

This read-only architecture is what enables infinite scaling. Lambda functions are stateless and ephemeral, spinning up and down as needed.

## The Development-to-Production Flow

Content changes follow this workflow:

1. **Create in development** - use WordPress admin to build pages, write posts, configure settings
2. **Deploy** - package code and assets for production
3. **Live on Lambda** - production serves your site at global scale

### What Deploys Copy

A deployment packages:

- WordPress core files
- Themes and plugins
- Custom code
- Uploaded media (to S3)

### What Deploys Don't Copy

Databases are **never** copied during deployment.

Each environment maintains its own independent MySQL database:

- Development database: for content creation
- Staging database: for isolated testing
- Production database: for the live site

This separation is intentional. It prevents accidental data loss and gives you control over what content appears in each environment.

> **Important:** If you create a blog post in development and deploy, the post won't appear in production. You need to recreate content in production or use database migration tools.

## Media Storage

Media files follow a different path than code:

- **Development**: Files stored in ECS container filesystem
- **Production**: Files uploaded to Amazon S3

When you deploy, media from development is uploaded to S3. Production serves images from S3 through the CDN.

## Key Differences

| Traditional WordPress | Vector Production |
|----------------------|-------------------|
| Writable filesystem | Read-only filesystem |
| WP Admin always available | No WP Admin access |
| Single server or cluster | Serverless autoscaling |
| Manual scaling | Automatic scaling |
| Pay for capacity | Pay per request |
| Backup management required | Code immutable, data separated |

Development environments behave like traditional hosting. Production environments prioritize scalability and performance over write access.

## What This Means for Your Applications

Build WordPress sites exactly as you always have. The serverless architecture is transparent during development.

When deploying to production:

- Test read-only compatibility
- Verify plugins don't require filesystem writes
- Plan content migration strategy
- Configure CDN caching rules
- Set up monitoring and alerts

## Next Steps

- [Understanding Environments](/docs/vector-pro/environments/understanding-environments/) - Environment lifecycle and management
- [Deployments](/docs/vector-pro/deployments/deployment-basics/) - How to deploy from development to production
- [Database Management](/docs/vector-pro/database/database-architecture/) - Moving data between environments
