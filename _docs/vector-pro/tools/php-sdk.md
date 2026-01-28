---
title: PHP SDK
description: Official PHP SDK for integrating Vector Pro into Laravel, WordPress,
  and other PHP applications.
category: Tools
order: 4
---

The Vector Pro PHP SDK provides a convenient interface for the Vector Pro API in PHP applications.

## Installation

```bash
composer require built-fast/vector-pro-sdk
```

Requires PHP 8.3+ and a PSR-18 HTTP client:

```bash
composer require guzzlehttp/guzzle
```

## Basic Usage

```php
use VectorPro\Sdk\Client;

$client = new Client('your-api-key');

// List sites
$sites = $client->getSites();

// Create site
$site = $client->createSite([
    'partner_customer_id' => 'cust_123',
    'dev_php_version' => '8.3',
]);

// Create environment
$environment = $client->createEnvironment($site['id'], [
    'name' => 'production',
    'php_version' => '8.3',
    'is_production' => true,
]);

// Deploy
$deployment = $client->createDeployment($site['id'], $environment['id']);
```

## Available Methods

### Sites

| Method | Description |
|--------|-------------|
| `getSites()` | List all sites |
| `getSite($siteId)` | Get site details |
| `createSite($data)` | Create new site |
| `updateSite($siteId, $data)` | Update site |
| `deleteSite($siteId)` | Delete site |
| `suspendSite($siteId)` | Suspend site |
| `unsuspendSite($siteId)` | Unsuspend site |
| `purgeSiteCache($siteId)` | Purge CDN cache |

### Environments

| Method | Description |
|--------|-------------|
| `getEnvironments($siteId)` | List environments |
| `createEnvironment($siteId, $data)` | Create environment |
| `updateEnvironment($siteId, $envId, $data)` | Update environment |
| `deleteEnvironment($siteId, $envId)` | Delete environment |

### Deployments

| Method | Description |
|--------|-------------|
| `getDeployments($siteId, $envId)` | List deployments |
| `createDeployment($siteId, $envId)` | Create deployment |
| `rollbackDeployment($deploymentId)` | Rollback deployment |

### Secrets

| Method | Description |
|--------|-------------|
| `getGlobalSecrets($siteId)` | List global secrets |
| `createGlobalSecret($siteId, $data)` | Create global secret |
| `getEnvironmentSecrets($siteId, $envId)` | List environment secrets |
| `createEnvironmentSecret($siteId, $envId, $data)` | Create environment secret |

### WAF

| Method | Description |
|--------|-------------|
| `getBlockedIps($siteId)` | List blocked IPs |
| `blockIp($siteId, $ip)` | Block IP |
| `getAllowedIps($siteId)` | List allowed IPs |
| `allowIp($siteId, $ip)` | Allow IP |
| `getRateLimits($siteId)` | List rate limits |
| `createRateLimit($siteId, $data)` | Create rate limit |

## Error Handling

```php
use VectorPro\Sdk\Exceptions\ClientException;

try {
    $client->createSite([]);
} catch (ClientException $e) {
    if ($e->isValidationError()) {
        $errors = $e->getValidationErrors();
        // Handle validation errors
    }
    if ($e->isAuthenticationError()) {
        // Handle 401 - invalid API key
    }
    if ($e->isNotFoundError()) {
        // Handle 404 - resource not found
    }
    if ($e->isServerError()) {
        // Handle 5xx - server errors
    }
}
```

## Laravel Integration

### Configuration

```php
// config/services.php
'vector' => [
    'api_key' => env('VECTOR_API_KEY'),
],
```

### Service Provider

```php
use VectorPro\Sdk\Client;

$this->app->singleton(Client::class, function ($app) {
    return new Client(config('services.vector.api_key'));
});
```

### Controller Usage

```php
use VectorPro\Sdk\Client;

class SiteController extends Controller
{
    public function __construct(private Client $vector) {}

    public function store(Request $request)
    {
        $site = $this->vector->createSite([
            'partner_customer_id' => $request->customer_id,
            'dev_php_version' => '8.3',
        ]);

        return response()->json($site);
    }
}
```

## Async Operations

Many operations are asynchronous. Poll for completion:

```php
$site = $client->createSite([
    'partner_customer_id' => 'cust_123',
    'dev_php_version' => '8.3',
]);

// Poll until active
while ($site['status'] === 'pending') {
    sleep(5);
    $site = $client->getSite($site['id']);
}

// Site is ready
echo $site['dev_domain'];
```

For production, use webhooks instead of polling.

## Next Steps

- [Node.js SDK](/docs/vector-pro/tools/node-sdk/) - JavaScript/TypeScript SDK
- [CLI](/docs/vector-pro/tools/cli/) - Command-line interface
- [Webhook Overview](/docs/vector-pro/webhooks/webhook-overview/) - Replace polling with webhooks
