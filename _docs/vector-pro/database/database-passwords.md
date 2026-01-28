---
title: Database Passwords
description: Reset database passwords for development and environment databases.
category: Database
order: 3
---

Reset MySQL passwords when credentials are compromised or need rotation.

## Development Database Password

Reset the development container's database password:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/database/reset-password" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": {
    "db_password": "new_generated_password"
  },
  "message": "Database password reset successfully",
  "http_status": 200
}
```

### After Reset

- WordPress `wp-config.php` is automatically updated
- Existing database connections are closed
- New password takes effect immediately

## Environment Database Password

Reset a specific environment's database password:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/environments/67890/database/reset-password" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Response

```json
{
  "data": {
    "db_password": "new_generated_password"
  },
  "message": "Database password reset successfully",
  "http_status": 200
}
```

### After Reset

- Next deployment will use new credentials
- Running environment continues with old password until redeployed
- Redeploy to activate new credentials

## When to Reset Passwords

- **Credential compromise** - Reset immediately if exposed
- **Team member departure** - Reset if they had access
- **Regular rotation** - As part of security policy
- **Compliance requirements** - Per organizational policy

## Webhook Events

Password resets trigger webhook events:

- `vector.dev-site.database-password-reset` - Development container
- `vector.environment.database-password-reset` - Environment database

Use these to update external systems that store credentials.

## Best Practices

1. **Store securely** - Never commit passwords to version control
2. **Use secrets** - Store database connection strings as environment secrets
3. **Rotate regularly** - Consider quarterly rotation
4. **Audit access** - Track who has database access
5. **Monitor events** - Watch for unexpected password resets

## External Database Access

If you've configured external tools (TablePlus, Sequel Pro, etc.) with database credentials:

1. Reset password via API
2. Get new password from response
3. Update external tool configuration
4. Verify connection

## Next Steps

- [Site Credentials](/docs/vector-pro/sites/site-credentials/) - All credential types
- [Environment Secrets](/docs/vector-pro/security/environment-secrets/) - Store credentials securely
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Monitor password changes
