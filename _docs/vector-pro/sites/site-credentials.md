---
title: Site Credentials
description: Manage SFTP, database, and SSH credentials for Vector Pro development
  containers.
category: Sites
order: 3
---

Every Vector Pro site includes credentials for SFTP, database, and SSH access to the development container.

## Retrieving Credentials

Get all credentials by fetching the site:

```bash
curl -X GET "https://api.builtfast.dev/api/v1/vector/sites/12345" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Response

```json
{
  "data": {
    "id": 12345,
    "dev_domain": "happy-panda.vectorpages.com",
    "sftp_username": "vector_12345",
    "sftp_password": "generated-password",
    "sftp_host": "sftp.vector.app",
    "sftp_port": 22,
    "db_username": "vector_12345",
    "db_password": "generated-db-password",
    "db_host": "db.vector.app",
    "db_name": "vector_12345",
    "db_port": 3306
  }
}
```

## Reset SFTP Password

Generate a new SFTP password:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/sftp/reset-password" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Response

```json
{
  "data": {
    "sftp_password": "new-generated-password"
  },
  "message": "SFTP password reset successfully",
  "http_status": 200
}
```

The new password takes effect immediately. Existing SFTP sessions may be disconnected.

## Reset Database Password

Generate a new MySQL password:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/database/reset-password" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Accept: application/json"
```

### Response

```json
{
  "data": {
    "db_password": "new-generated-db-password"
  },
  "message": "Database password reset successfully",
  "http_status": 200
}
```

> **Note:** Password resets only affect the development container. Environment database credentials are managed separately.

## SSH Key Management

SSH access uses key-based authentication. Keys can be managed at two levels:

### Account-Level Keys

Keys added at the account level are **automatically** added to all new sites:

```bash
# List account SSH keys
curl -X GET "https://api.builtfast.dev/api/v1/vector/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Add account SSH key
curl -X POST "https://api.builtfast.dev/api/v1/vector/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John MacBook",
    "public_key": "ssh-rsa AAAAB3NzaC1yc2E..."
  }'
```

### Site-Level Key Attachment

Attach existing keys to specific sites:

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ssh_key_id": 456
  }'
```

### Remove SSH Key from Site

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/ssh-keys/456" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Security Best Practices

1. **Rotate passwords periodically** - Reset credentials on a regular schedule
2. **Use SSH keys** - Prefer key-based authentication over SFTP passwords
3. **Limit SSH access** - Only attach keys for team members who need access
4. **Store securely** - Never commit credentials to version control
5. **Monitor access** - Review event logs for credential changes

## Next Steps

- [SSH Keys](/docs/vector-pro/security/ssh-keys/) - Detailed SSH key management
- [Environment Secrets](/docs/vector-pro/security/environment-secrets/) - Store sensitive configuration
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Monitor credential changes
