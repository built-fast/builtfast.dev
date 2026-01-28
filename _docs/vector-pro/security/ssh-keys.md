---
title: SSH Keys
description: Control SSH access to development containers with account-level and site-level
  keys.
category: Security
order: 4
---

SSH access to development containers uses key-based authentication. Manage keys at the account level (automatic for new sites) or attach keys to specific sites.

## Account-Level SSH Keys

Keys added at the account level are **automatically** added to all new sites created after key registration.

### List Account Keys

```bash
curl "https://api.builtfast.dev/api/v1/vector/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Add Account Key

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John MacBook",
    "public_key": "ssh-rsa AAAAB3NzaC1yc2E..."
  }'
```

### Response

```json
{
  "data": {
    "id": 456,
    "name": "John MacBook",
    "fingerprint": "SHA256:abc123...",
    "created_at": "2026-01-24T10:30:00Z"
  },
  "message": "SSH key created successfully",
  "http_status": 201
}
```

### Delete Account Key

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/ssh-keys/456" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

Deleting an account key does not automatically remove it from existing sites.

## Site-Level Key Attachment

Attach existing keys to specific sites:

### Attach Key to Site

```bash
curl -X POST "https://api.builtfast.dev/api/v1/vector/sites/12345/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ssh_key_id": 456
  }'
```

This grants SSH access to the development container for the specified key.

### List Keys on Site

```bash
curl "https://api.builtfast.dev/api/v1/vector/sites/12345/ssh-keys" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Remove Key from Site

```bash
curl -X DELETE "https://api.builtfast.dev/api/v1/vector/sites/12345/ssh-keys/456" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Key Format

SSH keys must be in OpenSSH format:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB... user@host
```

Supported key types:

- `ssh-rsa`
- `ssh-ed25519`
- `ecdsa-sha2-nistp256`
- `ecdsa-sha2-nistp384`
- `ecdsa-sha2-nistp521`

## Connecting via SSH

Once your key is attached, connect using the site's SFTP username:

```bash
ssh vector_12345@sftp.vector.app
```

The username is provided in the site details response.

## SSH vs SFTP

Both SSH and SFTP use the same credentials and key authentication:

- **SSH**: Command-line access, WP-CLI, git operations
- **SFTP**: File transfer, GUI clients (FileZilla, Transmit)

## Security Best Practices

1. **Use unique keys per device** - Easier to revoke if a device is lost
2. **Name keys descriptively** - "John MacBook 2024" instead of "key1"
3. **Remove unused keys** - Regularly audit and remove keys for departed team members
4. **Use SSH keys over passwords** - Keys are more secure than SFTP passwords

## Webhook Events

Monitor SSH key changes:

- `vector.ssh-key.created` - Key added to account
- `vector.ssh-key.deleted` - Key removed from account
- `vector.dev-site.ssh-key-added` - Key attached to site
- `vector.dev-site.ssh-key-removed` - Key removed from site

## Next Steps

- [Site Credentials](/docs/vector-pro/sites/site-credentials/) - Other access credentials
- [API Keys](/docs/vector-pro/security/api-keys/) - Manage API authentication
- [Audit Logs](/docs/vector-pro/security/audit-logs/) - Monitor access changes
