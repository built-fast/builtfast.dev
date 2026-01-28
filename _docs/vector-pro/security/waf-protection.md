---
title: WAF Protection
description: Production sites include Bunny Shield WAF with DDoS protection, IP filtering,
  and rate limiting.
category: Security
order: 5
---

Production environments include Bunny Shield WAF with DDoS protection, IP filtering, rate limiting, and referrer controls.

## Blocked IPs

Block malicious IP addresses:

### Add Blocked IP

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/blocked-ips" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "1.2.3.4"
  }'
```

### List Blocked IPs

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/blocked-ips" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Remove Blocked IP

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/blocked-ips/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Allowed IPs

Whitelist trusted IPs that bypass WAF entirely:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/allowed-ips" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "10.0.0.1"
  }'
```

> **Warning:** Allowed IPs bypass all WAF protections. Use sparingly for trusted infrastructure only (e.g., your office IP, monitoring services).

### List Allowed IPs

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/allowed-ips" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Remove Allowed IP

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/allowed-ips/{id}" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Blocked Referrers

Block traffic from specific domains:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/blocked-referrers" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "spam-domain.com"
  }'
```

Useful for blocking:

- Known spam referrers
- Hotlinking domains
- Malicious traffic sources

## Allowed Referrers

Only permit traffic from specified domains:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/allowed-referrers" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "trusted-partner.com"
  }'
```

> **Warning:** Allowed referrers block all other traffic. Use only when strict referrer requirements are needed.

## Rate Limiting

Configure request rate limits:

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/waf/rate-limit" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requests_per_second": 100
  }'
```

Protects against:

- Traffic spikes
- Brute force attacks
- API abuse
- Denial of service attempts

## DDoS Protection

Bunny Shield provides automatic DDoS mitigation:

- Layer 3/4 attack protection
- Layer 7 application-layer filtering
- Automatic detection and response
- No configuration required

## Production Only

WAF features are only available on production environments (`is_production: true`). Non-production environments bypass WAF and access origin directly.

## When to Use Each Feature

| Feature | Use Case |
|---------|----------|
| Blocked IPs | Known bad actors, repeated attackers |
| Allowed IPs | Office IP, monitoring services, CI/CD |
| Blocked Referrers | Spam domains, hotlinking |
| Allowed Referrers | Strict access control |
| Rate Limiting | API endpoints, forms, high-value pages |

## Next Steps

- [CDN and Caching](/docs/vector-pro/performance/cdn-caching/) - CDN features with WAF
- [Site Logs](/docs/vector-pro/performance/site-logs/) - Monitor blocked requests
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Track WAF configuration changes
