---
title: Partnership Model
description: Vector Pro's white-label partnership model—what you control, what BuiltFast
  manages.
category: Overview
order: 1
---

Vector Pro is designed for white-label integration. Your customers see your brand while BuiltFast operates the infrastructure invisibly.

## API-First Architecture

Everything happens through the API. Integrate Vector Pro into your existing:

- Control panel
- Billing system
- Customer portal
- Provisioning workflows

No BuiltFast branding, dashboards, or customer-facing interfaces.

## What You Control

### Customer Experience

- Your brand on everything
- Your pricing model
- Your customer relationships
- Your support workflows

### Integration

- How Vector Pro fits into your platform
- Site provisioning automation
- Billing integration
- Customer communication

### Site Management

- When sites deploy
- What environments exist
- Custom domain configuration
- Access control and permissions

## What BuiltFast Manages

### Infrastructure

- AWS resources
- Lambda configuration
- Aurora databases
- ECS clusters

### Platform Updates

- PHP version availability
- WordPress core compatibility
- Security patches
- Dependency updates

### Scaling

- Automatic Lambda concurrency
- Database performance tuning
- CDN optimization
- Resource allocation

### Security

- WAF rules
- DDoS mitigation
- SSL certificate provisioning and renewal
- Infrastructure security

## Pricing Model

**White-Label Flexibility**

You set your own prices. Common models:

- Monthly per-site subscription
- Usage-based tiers
- Bundled with other services
- One-time setup + monthly hosting

## Support Structure

**Dedicated Support**

- Direct Slack or email access to the BuiltFast team
- We handle infrastructure issues
- You handle customer relationships

**Your First Line**

Your customers contact you. You escalate infrastructure issues to BuiltFast when needed.

**Response Times**

BuiltFast maintains response SLAs for partner escalations. Your customer-facing SLAs are your own.

## Integration Patterns

### Minimal Integration

```
Your Dashboard → Vector Pro API → WordPress Sites
```

Simple: Add site creation/management to existing dashboard.

### Full Provisioning

```
Customer Signup → Billing → Provisioning → Vector Pro → Webhooks → Status Updates
```

Automated: Full lifecycle management triggered by billing events.

### Multi-Product

```
Your Platform
├── CDN Product → Third-party CDN
├── Email Product → Third-party Email
└── WordPress Hosting → Vector Pro
```

Combined: Vector Pro as one product among many.

## Getting Started

1. **Contact BuiltFast** - Discuss partnership terms and pricing
2. **Receive API credentials** - Get access to the API
3. **Integrate** - Build Vector Pro into your platform
4. **Test** - Verify integration with development sites
5. **Launch** - Offer WordPress hosting to your customers

## Next Steps

- [What is Vector Pro?](/docs/vector-pro/overview/what-is-vector-pro/) - Platform overview
- [Authentication](/docs/vector-pro/getting-started/authentication/) - API access setup
- [Create Your First Site](/docs/vector-pro/getting-started/create-first-site/) - Build a test site
