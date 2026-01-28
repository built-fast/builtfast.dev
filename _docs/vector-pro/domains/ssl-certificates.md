---
title: SSL Certificates
description: Automatic SSL certificate provisioning for custom domains via AWS ACM
  and Let's Encrypt.
category: Domains
order: 2
---

SSL certificates provision automatically when you attach custom domains. Vector Pro uses a multi-step process with AWS ACM and Let's Encrypt.

## SSL Provisioning Flow

| Step | Description | Action Required |
|------|-------------|-----------------|
| `requesting_cert` | Requesting AWS ACM certificate | None - automatic |
| `waiting_cert` | Waiting for DNS validation | None - automatic |
| `deploying` | Deploying to infrastructure | None - automatic |
| `configuring_dns` | Configuring platform DNS | None - automatic |
| `ready` | Platform SSL complete | None - automatic |
| `waiting_custom_dns` | Waiting for customer DNS | **Customer must update DNS** |
| `provisioning_cdn_ssl` | Requesting Let's Encrypt cert | None - automatic |
| `complete` | Fully provisioned | Site live on custom domain |

Most steps are automatic. You only need to configure DNS when the status reaches `waiting_custom_dns`.

## Check SSL Status

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/ssl" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": {
    "provisioning_step": "waiting_custom_dns",
    "error": null,
    "dns_instructions": {
      "type": "CNAME",
      "name": "www.example.com",
      "value": "different-words.vectorpages.com"
    }
  }
}
```

## DNS Configuration

When status shows `waiting_custom_dns`, configure your DNS:

### CNAME Record

```
www.example.com -> different-words.vectorpages.com
```

Use your DNS provider's interface to add this record. DNS propagation typically takes a few minutes to a few hours.

## Retry SSL Provisioning

If SSL appears stuck or needs a nudge:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/ssl/nudge" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

This retries the current provisioning step. Safe to call multiple times.

## Common Issues

### DNS Not Propagated

**Symptom:** Status stuck on `waiting_custom_dns`

**Solution:** Verify DNS record exists with:

```bash
dig www.example.com CNAME
```

Wait for propagation (can take up to 48 hours, usually much faster).

### Wrong CNAME Target

**Symptom:** SSL provisioning fails

**Solution:** Ensure CNAME points to the exact platform subdomain provided in the SSL status response.

### Root Domain vs WWW

Root domains (`example.com`) require different DNS handling than subdomains (`www.example.com`):

- **Subdomains**: Use CNAME records
- **Root domains**: May need ALIAS or ANAME records (provider-dependent)

## Certificate Renewal

Certificates renew automatically before expiration. No action required.

## Domain Verification (Optional)

Partners can require domain ownership verification:

### Initiate Verification

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/domains" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com"
  }'
```

### Response

```json
{
  "data": {
    "id": "dom_xyz789",
    "domain": "example.com",
    "verified": false,
    "verification_token": "vector-verify-abc123def456",
    "verification_record": {
      "type": "TXT",
      "name": "_vector-verify.example.com",
      "value": "vector-verify-abc123def456"
    }
  }
}
```

Add the TXT record, then verify:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/domains/dom_xyz789/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Next Steps

- [Custom Domains](/docs/vector-pro/domains/custom-domains/) - Domain configuration basics
- [CDN and Caching](/docs/vector-pro/performance/cdn-caching/) - Production CDN features
- [WAF Protection](/docs/vector-pro/security/waf-protection/) - Security for production sites
