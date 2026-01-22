---
title: Vector Pro PHP SDK
permalink: /vector-pro/sdk-php/
period: 2025-Present
date: 2026-01-17
github: https://github.com/built-fast/vector-pro-sdk-php
license: MIT
tags:
  - PHP
  - SDK
  - API
  - Laravel
languages:
  - name: PHP
    icon: php
tagline: PHP SDK for the Vector Pro API
excerpt: |
  A PHP SDK for the Vector Pro REST API. Built for modern PHP applications,
  fully typed, and PSR-18 compliant.
---

A PHP SDK for the Vector Pro REST API by [BuiltFast](https://builtfast.com).

## Requirements

- PHP 8.3+
- A PSR-18 HTTP client (e.g., Guzzle, Symfony HTTP Client)

## Installation

```bash
composer require built-fast/vector-pro-sdk
```

If you don't already have a PSR-18 HTTP client installed:

```bash
composer require guzzlehttp/guzzle
```

## Usage

### Basic Setup

```php
use VectorPro\Sdk\Client;

$client = new Client('your-api-key');
```

### Sites

```php
// List all sites
$sites = $client->getSites();

// Get a single site
$site = $client->getSite('site_abc123');

// Create a site
$site = $client->createSite([
    'partner_customer_id' => 'cust_123',
    'dev_php_version' => '8.3',
]);

// Update a site
$site = $client->updateSite('site_abc123', [
    'dev_php_version' => '8.4',
]);

// Delete a site
$client->deleteSite('site_abc123');

// Suspend/unsuspend
$client->suspendSite('site_abc123');
$client->unsuspendSite('site_abc123');

// Reset credentials
$client->resetSiteSftpPassword('site_abc123');
$client->resetSiteDatabasePassword('site_abc123');

// Purge CDN cache
$client->purgeSiteCache('site_abc123', ['paths' => ['/css/*', '/js/*']]);
```

### Environments

```php
// List environments for a site
$environments = $client->getEnvironments('site_abc123');

// Get a single environment
$environment = $client->getEnvironment('site_abc123', 'env_xyz789');

// Create an environment
$environment = $client->createEnvironment('site_abc123', [
    'name' => 'staging',
]);

// Update an environment
$environment = $client->updateEnvironment('site_abc123', 'env_xyz789', [
    'php_version' => '8.3',
]);

// Delete an environment
$client->deleteEnvironment('site_abc123', 'env_xyz789');
```

### Deployments

```php
// List deployments
$deployments = $client->getDeployments('site_abc123', 'env_xyz789');

// Get a single deployment
$deployment = $client->getDeployment('site_abc123', 'env_xyz789', 'deploy_456');

// Create a deployment
$deployment = $client->createDeployment('site_abc123', 'env_xyz789');

// Rollback to a previous deployment
$deployment = $client->rollbackDeployment('site_abc123', 'env_xyz789', 'deploy_456');
```

### SSL

```php
// Get SSL status
$ssl = $client->getSslStatus('site_abc123', 'env_xyz789');

// Nudge SSL certificate renewal
$client->nudgeSsl('site_abc123', 'env_xyz789');
```

### Secrets

```php
// Environment secrets
$secrets = $client->getEnvironmentSecrets('site_abc123', 'env_xyz789');
$secret = $client->createEnvironmentSecret('site_abc123', 'env_xyz789', [
    'key' => 'API_KEY',
    'value' => 'secret-value',
]);
$client->updateEnvironmentSecret('site_abc123', 'env_xyz789', 'secret_123', [
    'value' => 'new-value',
]);
$client->deleteEnvironmentSecret('site_abc123', 'env_xyz789', 'secret_123');

// Global secrets
$secrets = $client->getGlobalSecrets();
$secret = $client->createGlobalSecret(['key' => 'GLOBAL_KEY', 'value' => 'value']);
$client->updateGlobalSecret('secret_123', ['value' => 'new-value']);
$client->deleteGlobalSecret('secret_123');
```

### SSH Keys

```php
// Account SSH keys
$keys = $client->getSshKeys();
$key = $client->getSshKey('key_123');
$key = $client->createSshKey(['name' => 'My Key', 'public_key' => 'ssh-ed25519 ...']);
$client->deleteSshKey('key_123');

// Site SSH keys
$keys = $client->getSiteSshKeys('site_abc123');
$client->addSiteSshKey('site_abc123', 'key_123');
$client->removeSiteSshKey('site_abc123', 'key_123');
```

### API Keys

```php
$keys = $client->getApiKeys();
$key = $client->createApiKey(['name' => 'CI/CD Key']);
$client->deleteApiKey('key_123');
```

### Webhooks

```php
$webhooks = $client->getWebhooks();
$webhook = $client->getWebhook('webhook_123');
$webhook = $client->createWebhook([
    'url' => 'https://example.com/webhook',
    'events' => ['deployment.completed'],
]);
$client->updateWebhook('webhook_123', ['url' => 'https://example.com/new-webhook']);
$client->deleteWebhook('webhook_123');
$client->rotateWebhookSecret('webhook_123');

// Webhook logs
$logs = $client->getWebhookLogs('webhook_123');
```

### WAF

```php
// Blocked IPs
$ips = $client->getWafBlockedIps('site_abc123');
$client->addWafBlockedIp('site_abc123', ['ip' => '192.168.1.1']);
$client->removeWafBlockedIp('site_abc123', 'ip_123');

// Blocked referrers
$referrers = $client->getWafBlockedReferrers('site_abc123');
$client->addWafBlockedReferrer('site_abc123', ['referrer' => 'spam.example.com']);
$client->removeWafBlockedReferrer('site_abc123', 'ref_123');

// Allowed referrers
$referrers = $client->getWafAllowedReferrers('site_abc123');
$client->addWafAllowedReferrer('site_abc123', ['referrer' => 'trusted.example.com']);
$client->removeWafAllowedReferrer('site_abc123', 'ref_123');

// Rate limits
$limits = $client->getWafRateLimits('site_abc123');
$client->setWafRateLimits('site_abc123', ['requests_per_minute' => 100]);
$client->deleteWafRateLimit('site_abc123', 'limit_123');
```

### Other

```php
// Available PHP versions
$versions = $client->getPhpVersions();

// Event log
$events = $client->getEvents();

// Site logs
$logs = $client->getSiteLogs('site_abc123', ['type' => 'error', 'lines' => 100]);
```

## Error Handling

All API errors throw a `ClientException`:

```php
use VectorPro\Sdk\Exceptions\ClientException;

try {
    $client->createSite([]);
} catch (ClientException $e) {
    // Get the HTTP status code
    $statusCode = $e->getStatusCode();

    // Check error type
    if ($e->isValidationError()) {
        // Get validation errors
        $errors = $e->getValidationErrors();  // ['name' => ['The name field is required']]
        $first = $e->firstError();            // "The name field is required"
        $nameErrors = $e->errorsFor('name');  // ["The name field is required"]

        if ($e->hasErrorFor('name')) {
            // Handle name field error
        }
    }

    if ($e->isAuthenticationError()) {
        // 401 - Invalid API key
    }

    if ($e->isAuthorizationError()) {
        // 403 - Not authorized
    }

    if ($e->isNotFoundError()) {
        // 404 - Resource not found
    }

    if ($e->isServerError()) {
        // 5xx - Server error
    }

    // Get the full response body
    $response = $e->getResponseBody();
}
```

## Pagination

Methods that return lists support pagination:

```php
// Default: page 1, 15 items per page
$sites = $client->getSites();

// Custom pagination
$sites = $client->getSites(page: 2, perPage: 50);
```

## Dependency Injection

The SDK provides a `ClientInterface` for type hinting and mocking:

```php
use VectorPro\Sdk\ClientInterface;

class DeploymentService
{
    public function __construct(
        private readonly ClientInterface $client
    ) {}

    public function deploy(string $siteId, string $environmentId): array
    {
        return $this->client->createDeployment($siteId, $environmentId);
    }
}
```

## Laravel

```php
use VectorPro\Sdk\Client;

// Create a client using config
$client = new Client(config('services.vector.api_key'));

// Make API calls
$sites = $client->getSites();
$site = $client->createSite(['partner_customer_id' => 'cust_123']);
$deployment = $client->createDeployment($siteId, $environmentId);
```

Add to `config/services.php`:

```php
'vector' => [
    'api_key' => env('VECTOR_API_KEY'),
],
```

## Custom HTTP Client

You can provide your own PSR-18 HTTP client:

```php
use GuzzleHttp\Client as GuzzleClient;
use VectorPro\Sdk\Client;

$httpClient = new GuzzleClient([
    'timeout' => 30,
    'connect_timeout' => 10,
]);

$client = new Client(
    apiKey: 'your-api-key',
    httpClient: $httpClient
);
```

## Development

```bash
# Install dependencies
composer install

# Run tests
composer test

# Code style (Pint)
composer fix

# Static analysis (PHPStan)
composer stan
```

## License

MIT
