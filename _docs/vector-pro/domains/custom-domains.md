---
title: Custom Domains
description: Configure custom domains for your production environments with automatic
  SSL.
category: Domains
order: 1
---

Every environment receives a platform subdomain automatically. Production environments can also use custom domains with automatic SSL provisioning.

## Platform Domains

Every environment gets a platform subdomain immediately after provisioning:

- **Development**: `happy-panda.vectorpages.com`
- **Production**: `different-words.vectorpages.com`
- **Custom environments**: `unique-words.vectorpages.com`

These work immediately with automatic SSL certificates. No configuration required.

## Attach Custom Domain

Add a custom domain to a production environment:

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_domain": "www.example.com"
  }'
```

### Requirements

- Environment must have `is_production: true`
- Domain must be a valid FQDN (no protocols, no paths)
- Triggers automatic SSL provisioning

### Response

```json
{
  "data": {
    "id": "env_abc123",
    "custom_domain": "www.example.com",
    "ssl_provisioning_step": "requesting_cert"
  }
}
```

## DNS Configuration

After attaching a custom domain, configure DNS:

### CNAME Record

```
www.example.com -> different-words.vectorpages.com
```

Point your custom domain to the platform subdomain provided in the environment response.

## Check SSL Status

Monitor SSL provisioning progress:

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

## Change Custom Domain

Replace an existing custom domain:

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_domain": "newdomain.com"
  }'
```

### Behavior

- Old domain stops working after DNS propagation
- New SSL provisioning starts automatically
- Platform subdomain remains unchanged

## Remove Custom Domain

Revert to platform subdomain only:

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_domain": null
  }'
```

The site immediately becomes accessible only via the platform subdomain.

## Non-Production Custom Domains

Staging and custom environments can also use custom domains:

```bash
curl -X PUT "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_domain": "staging.example.com"
  }'
```

Non-production environments:

- Use platform subdomains by default
- Can attach custom domains if needed
- No CDN routing (direct to origin)
- SSL still automatic

## Next Steps

- [SSL Certificates](/docs/vector-pro/domains/ssl-certificates/) - Detailed SSL provisioning flow
- [CDN and Caching](/docs/vector-pro/performance/cdn-caching/) - Production CDN configuration
- [Creating Environments](/docs/vector-pro/environments/creating-environments/) - Set up production environments
