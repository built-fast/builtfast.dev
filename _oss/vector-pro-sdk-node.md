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
  Official Node.js SDK for the Vector Pro API. Full TypeScript support with
  exported types, resource-based API design, and simple error handling.
---

The official Node.js SDK for the [Vector Pro API](https://builtfast.dev/api).
Full TypeScript support with exported types for all API responses and a clean,
resource-based API design.

## Installation

```bash
npm install vector-pro-sdk
```

## Quick Start

```typescript
import { VectorProClient } from 'vector-pro-sdk';

const client = new VectorProClient({
  apiKey: 'your-api-key',
});

// List sites
const sites = await client.sites.list();

// Create a site
const site = await client.sites.create({
  partner_customer_id: 'customer-123',
  dev_php_version: '8.3',
});

// Get a specific site
const site = await client.sites.get('site-id');

// Manage environments
const envs = await client.environments.list('site-id');
await client.environments.deploy('site-id', 'production');
await client.environments.rollback('site-id', 'production');

// Database operations
await client.sites.db.createExport('site-id');
await client.sites.db.importDirect('site-id', { dropTables: true });

// WAF management
await client.sites.waf.addBlockedIP('site-id', '1.2.3.4');
await client.sites.waf.listRateLimits('site-id');

// Account management
const summary = await client.account.getSummary();
await client.account.apiKeys.create({ name: 'ci-token' });
await client.account.secrets.create({ key: 'MY_SECRET', value: 'secret-value' });

// Webhooks
await client.webhooks.create({
  url: 'https://example.com/webhook',
  events: ['site.created', 'deployment.completed'],
});
```

## TypeScript Support

Full TypeScript support with exported types for all API responses:

```typescript
import { VectorProClient } from 'vector-pro-sdk';
import type { Site, Environment, ApiResponse, ListResponse } from 'vector-pro-sdk';

const client = new VectorProClient({ apiKey: 'your-api-key' });

// Responses are fully typed
const sites: ListResponse<Site> = await client.sites.list();
const site: ApiResponse<Site> = await client.sites.get('site-id');

// Access typed data
sites.data?.forEach(site => {
  console.log(site.id, site.status);
});
```

## Error Handling

```typescript
import { VectorProClient, VectorProApiError } from 'vector-pro-sdk';

try {
  await client.sites.get('invalid-id');
} catch (error) {
  if (error instanceof VectorProApiError) {
    console.log(error.status);  // HTTP status code
    console.log(error.body);    // Response body
  }
}
```

## API Reference

### Sites

```typescript
client.sites.list(options?)
client.sites.get(siteId)
client.sites.create(data)
client.sites.update(siteId, data)
client.sites.delete(siteId)
client.sites.clone(siteId, data?)
client.sites.suspend(siteId)
client.sites.unsuspend(siteId)
client.sites.getLogs(siteId, options?)
client.sites.purgeCache(siteId, options?)
```

### Sites - Database

```typescript
client.sites.db.importDirect(siteId, options?)
client.sites.db.createImportSession(siteId, data?)
client.sites.db.runImport(siteId, importId)
client.sites.db.getImportStatus(siteId, importId)
client.sites.db.createExport(siteId, options?)
client.sites.db.getExportStatus(siteId, exportId)
```

### Sites - WAF

```typescript
client.sites.waf.listAllowedReferrers(siteId)
client.sites.waf.addAllowedReferrer(siteId, hostname)
client.sites.waf.removeAllowedReferrer(siteId, hostname)
client.sites.waf.listBlockedReferrers(siteId)
client.sites.waf.addBlockedReferrer(siteId, hostname)
client.sites.waf.removeBlockedReferrer(siteId, hostname)
client.sites.waf.listBlockedIPs(siteId)
client.sites.waf.addBlockedIP(siteId, ip)
client.sites.waf.removeBlockedIP(siteId, ip)
client.sites.waf.listRateLimits(siteId)
client.sites.waf.createRateLimit(siteId, data)
client.sites.waf.getRateLimit(siteId, ruleId)
client.sites.waf.updateRateLimit(siteId, ruleId, data)
client.sites.waf.deleteRateLimit(siteId, ruleId)
```

### Sites - SSH Keys

```typescript
client.sites.sshKeys.list(siteId, options?)
client.sites.sshKeys.add(siteId, data)
client.sites.sshKeys.remove(siteId, keyId)
```

### Sites - SSL

```typescript
client.sites.ssl.getStatus(siteId, envId)
client.sites.ssl.nudge(siteId, envId, options?)
```

### Environments

```typescript
client.environments.list(siteId, options?)
client.environments.get(siteId, envId)
client.environments.create(siteId, data)
client.environments.update(siteId, envId, data)
client.environments.delete(siteId, envId)
client.environments.deploy(siteId, envId)
client.environments.rollback(siteId, envId, targetDeploymentId?)
client.environments.resetDatabasePassword(siteId, envId)
```

### Environments - Deployments

```typescript
client.environments.deployments.list(siteId, envId, options?)
client.environments.deployments.get(siteId, envId, deploymentId)
```

### Environments - Secrets

```typescript
client.environments.secrets.list(siteId, envId, options?)
client.environments.secrets.create(siteId, envId, data)
client.environments.secrets.get(siteId, envId, secretId)
client.environments.secrets.update(siteId, envId, secretId, data)
client.environments.secrets.delete(siteId, envId, secretId)
```

### Account

```typescript
client.account.getSummary()
client.account.sshKeys.list(options?)
client.account.sshKeys.create(data)
client.account.sshKeys.get(keyId)
client.account.sshKeys.delete(keyId)
client.account.apiKeys.list(options?)
client.account.apiKeys.create(data)
client.account.apiKeys.delete(tokenId)
client.account.secrets.list(options?)
client.account.secrets.create(data)
client.account.secrets.get(secretId)
client.account.secrets.update(secretId, data)
client.account.secrets.delete(secretId)
```

### Webhooks

```typescript
client.webhooks.list(options?)
client.webhooks.get(webhookId)
client.webhooks.create(data)
client.webhooks.update(webhookId, data)
client.webhooks.delete(webhookId)
client.webhooks.rotateSecret(webhookId)
client.webhooks.listLogs(webhookId, options?)
```

### Events & PHP Versions

```typescript
client.events.list(options?)
client.phpVersions.list()
```
