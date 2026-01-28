---
title: Node.js SDK
description: Official Node.js SDK with full TypeScript support for integrating Vector
  Pro into JavaScript applications.
category: Tools
order: 3
---

The Vector Pro Node.js SDK provides a typed interface for the Vector Pro API with full TypeScript support.

## Installation

```bash
npm install @builtfast/vector-pro-sdk
```

## Basic Usage

```typescript
import { VectorClient } from '@builtfast/vector-pro-sdk';

const client = new VectorClient('your-api-key');

// List sites
const sites = await client.getSites();

// Create site
const site = await client.createSite({
  partnerCustomerId: 'cust_123',
  devPhpVersion: '8.3',
});

// Create environment
const environment = await client.createEnvironment(site.id, {
  name: 'production',
  phpVersion: '8.3',
  isProduction: true,
});

// Deploy
const deployment = await client.createDeployment(site.id, environment.id);
```

## TypeScript Types

Full type definitions are included for IDE autocomplete and type safety:

```typescript
import {
  VectorClient,
  Site,
  Environment,
  Deployment,
  CreateSiteRequest,
  CreateEnvironmentRequest
} from '@builtfast/vector-pro-sdk';

const createSite = async (customerId: string): Promise<Site> => {
  const client = new VectorClient(process.env.VECTOR_API_KEY!);

  const request: CreateSiteRequest = {
    partnerCustomerId: customerId,
    devPhpVersion: '8.3',
  };

  return client.createSite(request);
};
```

## Available Methods

### Sites

```typescript
// List all sites
const sites = await client.getSites();

// Get single site
const site = await client.getSite(siteId);

// Create site
const site = await client.createSite({
  partnerCustomerId: 'cust_123',
  devPhpVersion: '8.3',
});

// Update site
await client.updateSite(siteId, { tags: ['production'] });

// Delete site
await client.deleteSite(siteId);

// Suspend/unsuspend
await client.suspendSite(siteId);
await client.unsuspendSite(siteId);

// Purge cache
await client.purgeSiteCache(siteId);
```

### Environments

```typescript
// List environments
const environments = await client.getEnvironments(siteId);

// Create environment
const env = await client.createEnvironment(siteId, {
  name: 'staging',
  phpVersion: '8.3',
  isProduction: false,
});

// Update environment
await client.updateEnvironment(siteId, envId, {
  customDomain: 'staging.example.com',
});

// Delete environment
await client.deleteEnvironment(siteId, envId);
```

### Deployments

```typescript
// List deployments
const deployments = await client.getDeployments(siteId, envId);

// Create deployment
const deployment = await client.createDeployment(siteId, envId);

// Rollback
await client.rollbackDeployment(deploymentId);
```

## Error Handling

```typescript
import { VectorApiError } from '@builtfast/vector-pro-sdk';

try {
  await client.createSite({});
} catch (error) {
  if (error instanceof VectorApiError) {
    if (error.isValidationError()) {
      console.log('Validation errors:', error.validationErrors);
    }
    if (error.isAuthenticationError()) {
      console.log('Invalid API key');
    }
    if (error.isNotFoundError()) {
      console.log('Resource not found');
    }
  }
}
```

## Configuration Options

```typescript
const client = new VectorClient('your-api-key', {
  baseUrl: 'https://api.builtfast.com', // Custom API URL
  timeout: 30000, // Request timeout in ms
  retries: 3, // Number of retries on failure
});
```

## Express.js Example

```typescript
import express from 'express';
import { VectorClient } from '@builtfast/vector-pro-sdk';

const app = express();
const client = new VectorClient(process.env.VECTOR_API_KEY!);

app.post('/api/sites', async (req, res) => {
  try {
    const site = await client.createSite({
      partnerCustomerId: req.body.customerId,
      devPhpVersion: '8.3',
    });
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create site' });
  }
});
```

## Async/Await Patterns

### Polling for Completion

```typescript
const waitForSite = async (siteId: string): Promise<Site> => {
  let site = await client.getSite(siteId);

  while (site.status === 'pending') {
    await new Promise(resolve => setTimeout(resolve, 5000));
    site = await client.getSite(siteId);
  }

  return site;
};
```

### Parallel Operations

```typescript
// Create multiple sites in parallel
const sites = await Promise.all([
  client.createSite({ partnerCustomerId: 'cust_1', devPhpVersion: '8.3' }),
  client.createSite({ partnerCustomerId: 'cust_2', devPhpVersion: '8.3' }),
  client.createSite({ partnerCustomerId: 'cust_3', devPhpVersion: '8.3' }),
]);
```

## Next Steps

- [PHP SDK](/docs/vector-pro/tools/php-sdk/) - PHP SDK documentation
- [CLI](/docs/vector-pro/tools/cli/) - Command-line interface
- [Webhook Verification](/docs/vector-pro/webhooks/webhook-verification/) - Node.js verification example
