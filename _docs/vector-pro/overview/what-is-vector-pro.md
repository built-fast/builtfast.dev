---
title: What is Vector Pro?
description: Vector Pro is a serverless WordPress hosting API that enables partners
  to offer scalable, white-label hosting without managing infrastructure.
category: Overview
order: 2
---

Vector Pro is the API for serverless WordPress hosting by BuiltFast. It enables hosting partners—hosting companies, agencies, and WordPress product companies—to offer scalable, white-label WordPress hosting without managing infrastructure.

## Who It's For

**Hosting Companies** adding WordPress to their product lineup without infrastructure overhead.

**Agencies** hosting client sites under their brand with predictable performance.

**WordPress Product Companies** (themes, plugins, SaaS) providing hosting as part of their offering.

## The Problem with Traditional Hosting

Traditional WordPress hosting requires capacity planning: estimate peak traffic, provision servers, pay for idle resources, scramble when traffic spikes exceed capacity. Scale up, sites slow down. Scale down, waste money.

WordPress wasn't designed for horizontal scaling. Shared hosting clusters struggle with database write contention. VPS solutions require manual management. "Managed WordPress" typically means better-tuned traditional hosting.

## The Vector Pro Solution

Vector Pro uses serverless architecture where sites automatically scale with traffic. No capacity planning. No provisioning. No paying for idle resources.

**Development environments** run WordPress exactly as you expect—full read/write access, WP Admin, plugin installation, content editing. These run on AWS ECS containers with dedicated Aurora databases.

**Production environments** deploy WordPress to AWS Lambda with a read-only filesystem. Content management happens in development, then deploys to production. This read-only constraint enables true horizontal scaling without the database write contention that limits traditional WordPress hosting.

Each environment gets its own Aurora database. Staging changes don't affect production. Database imports/exports move content between environments.

## Platform Features

- **Serverless Execution** - AWS Lambda automatically scales WordPress execution based on traffic. Pay only for actual usage.
- **Global CDN with WAF** - Bunny.net CDN with Shield WAF and DDoS protection on production sites.
- **Automatic SSL** - SSL certificates provision automatically for all custom domains.
- **Independent Databases** - Each environment has its own Aurora MySQL database.
- **White-Label** - Your brand on everything. BuiltFast remains invisible to your customers.
- **Dedicated Support** - Direct access to the BuiltFast team.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Compute | AWS Lambda (production), AWS ECS (development) |
| Database | AWS Aurora MySQL (independent per environment) |
| CDN & Security | Bunny.net CDN with Shield WAF |
| Deployment | Ymir (WordPress serverless deployment framework) |
| Infrastructure | AWS (us-east-1 region) |

## Next Steps

- [Development vs Production Environments](/docs/vector-pro/architecture/dev-vs-production/) - Understand the two-environment architecture
- [Authentication](/docs/vector-pro/getting-started/authentication/) - Set up API access
- [Create Your First Site](/docs/vector-pro/getting-started/create-first-site/) - Build and deploy your first WordPress site
