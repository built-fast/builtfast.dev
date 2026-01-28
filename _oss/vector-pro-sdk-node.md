---
title: Vector Pro Node.js SDK
period: 2025-Present
date: 2026-01-17
github: https://github.com/built-fast/vector-pro-sdk-node
license: MIT
tags:
  - vector-pro
  - sdk
  - api
languages:
  - name: TypeScript
    icon: typescript
  - name: Node.js
    icon: node
tagline: TypeScript SDK for the Vector Pro API
excerpt: |
  A TypeScript SDK for the Vector Pro API with zero runtime dependencies.
  Built for high-performance Node.js applications using native fetch.
---

A TypeScript SDK for the [Vector Pro](https://builtfast.com) API with zero runtime dependencies.

## Requirements

- Node.js 18+ (for native `fetch()` support)

## Installation

```bash
npm install @built-fast/vector-pro-sdk
```

## Quick Start

```typescript
import { VectorProClient, VectorProError } from '@built-fast/vector-pro-sdk';

const client = new VectorProClient({ apiKey: 'your-api-key' });

// List sites
const { data: sites } = await client.getSites();

// Create a site
const site = await client.createSite({
  partner_customer_id: 'cust-123',
  dev_php_version: '8.3',
  tags: ['wordpress'],
});

// Create an environment
const environment = await client.createEnvironment(site.id, {
  name: 'production',
  php_version: '8.3',
  is_production: true,
  custom_domain: 'example.com',
});

// Deploy
const deployment = await client.createDeployment(site.id, 'production');
```

## Error Handling

```typescript
import { VectorProClient, VectorProError } from '@built-fast/vector-pro-sdk';

const client = new VectorProClient({ apiKey: 'your-api-key' });

try {
  await client.getSite('nonexistent');
} catch (err) {
  if (err instanceof VectorProError) {
    if (err.isNotFoundError()) {
      console.log('Site not found');
    }
    if (err.isValidationError()) {
      console.log('Validation errors:', err.getValidationErrors());
      console.log('First error:', err.firstError());
    }
    if (err.isAuthenticationError()) {
      console.log('Invalid API key');
    }
  }
}
```

## API Reference

### Sites

```typescript
client.getSites(params?)              // List all sites
client.getSite(siteId)                // Get a site
client.createSite(data)               // Create a site
client.updateSite(siteId, data)       // Update a site
client.deleteSite(siteId)             // Delete a site
client.suspendSite(siteId)            // Suspend a site
client.unsuspendSite(siteId)          // Unsuspend a site
client.resetSiteSftpPassword(siteId)  // Reset SFTP password
client.resetSiteDatabasePassword(siteId) // Reset database password
client.purgeSiteCache(siteId, data?)  // Purge CDN cache
```

### Environments

```typescript
client.getEnvironments(siteId, params?)           // List environments
client.getEnvironment(siteId, envName)            // Get an environment
client.createEnvironment(siteId, data)            // Create an environment
client.updateEnvironment(siteId, envName, data)   // Update an environment
client.deleteEnvironment(siteId, envName)         // Delete an environment
client.suspendEnvironment(siteId, envName)        // Suspend an environment
client.unsuspendEnvironment(siteId, envName)      // Unsuspend an environment
client.resetEnvironmentDatabasePassword(siteId, envName) // Reset database password
```

### Deployments

```typescript
client.getDeployments(siteId, envName, params?)        // List deployments
client.getDeployment(siteId, envName, deploymentId)    // Get a deployment
client.createDeployment(siteId, envName)               // Create a deployment
client.rollbackDeployment(siteId, envName, data?)      // Rollback to a previous deployment
```

### SSL

```typescript
client.getSslStatus(siteId, envName)     // Get SSL status
client.nudgeSsl(siteId, envName, data?)  // Nudge SSL provisioning
```

### Environment Secrets

```typescript
client.getEnvironmentSecrets(siteId, envName, params?)         // List secrets
client.createEnvironmentSecret(siteId, envName, data)          // Create a secret
client.updateEnvironmentSecret(siteId, envName, secretId, data) // Update a secret
client.deleteEnvironmentSecret(siteId, envName, secretId)      // Delete a secret
```

### Global Secrets

```typescript
client.getGlobalSecrets(params?)            // List global secrets
client.createGlobalSecret(data)             // Create a global secret
client.updateGlobalSecret(secretId, data)   // Update a global secret
client.deleteGlobalSecret(secretId)         // Delete a global secret
```

### API Keys

```typescript
client.getApiKeys(params?)     // List API keys
client.createApiKey(data)      // Create an API key
client.deleteApiKey(tokenId)   // Delete an API key
```

### SSH Keys (Account)

```typescript
client.getSshKeys(params?)     // List account SSH keys
client.getSshKey(sshKeyId)     // Get an SSH key
client.createSshKey(data)      // Create an SSH key
client.deleteSshKey(sshKeyId)  // Delete an SSH key
```

### SSH Keys (Site)

```typescript
client.getSiteSshKeys(siteId, params?)        // List site SSH keys
client.addSiteSshKey(siteId, data)            // Add an SSH key to a site
client.removeSiteSshKey(siteId, sshKeyId)     // Remove an SSH key from a site
```

### Webhooks

```typescript
client.getWebhooks(params?)              // List webhooks
client.getWebhook(webhookId)             // Get a webhook
client.createWebhook(data)               // Create a webhook
client.updateWebhook(webhookId, data)    // Update a webhook
client.deleteWebhook(webhookId)          // Delete a webhook
client.rotateWebhookSecret(webhookId)    // Rotate webhook secret
```

### WAF

```typescript
// Allowed Referrers
client.getAllowedReferrers(siteId)               // List allowed referrers
client.addAllowedReferrer(siteId, hostname)      // Add an allowed referrer
client.removeAllowedReferrer(siteId, hostname)   // Remove an allowed referrer

// Blocked Referrers
client.getBlockedReferrers(siteId)               // List blocked referrers
client.addBlockedReferrer(siteId, hostname)      // Add a blocked referrer
client.removeBlockedReferrer(siteId, hostname)   // Remove a blocked referrer

// Blocked IPs
client.getBlockedIps(siteId)                     // List blocked IPs
client.addBlockedIp(siteId, ip, note?)           // Block an IP
client.removeBlockedIp(siteId, ip)               // Unblock an IP

// Rate Limits
client.getRateLimits(siteId)                     // List rate limits
client.createRateLimit(siteId, data)             // Create a rate limit
client.updateRateLimit(siteId, rateLimitId, data) // Update a rate limit
client.deleteRateLimit(siteId, rateLimitId)      // Delete a rate limit
```

### Read-Only

```typescript
client.getPhpVersions()                   // List available PHP versions
client.getEvents(params?)                 // List events
client.getSiteLogs(siteId, params?)       // Get site logs
client.getWebhookLogs(webhookId, params?) // Get webhook logs
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```
