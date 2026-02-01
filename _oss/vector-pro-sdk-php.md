---
title: Vector Pro PHP SDK
period: 2025-Present
date: 2026-01-17
github: https://github.com/built-fast/vector-pro-sdk-php
license: MIT
tags:
  - vector-pro
  - sdk
  - api
languages:
  - name: PHP
    icon: php
tagline: PHP SDK for the Vector Pro API
excerpt: |
  Official PHP SDK for the Vector Pro API. Fully typed response objects,
  resource-based API design, and PSR-18 HTTP client support.
---

The official PHP SDK for the [Vector Pro](https://builtfast.com) API. Designed
for modern PHP applications with typed response objects, IDE autocomplete
support, and flexibility to use any PSR-18 HTTP client.

## Requirements

- PHP 8.3+
- A PSR-18 HTTP client (e.g., Guzzle)

## Installation

```bash
composer require built-fast/vector-pro-sdk
```

You'll also need a PSR-18 HTTP client if you don't have one:

```bash
composer require guzzlehttp/guzzle
```

## Quick Start

```php
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\HttpFactory;
use VectorPro\VectorProClient;
use VectorPro\VectorProClientConfig;

$config = new VectorProClientConfig(
    apiKey: 'your-api-key',
);

$factory = new HttpFactory();
$client = new VectorProClient(
    $config,
    new Client(),
    $factory,
    $factory,
);

// List all sites
$response = $client->sites->list();
foreach ($response->data as $site) {
    echo $site->id . ': ' . $site->partner_customer_id . "\n";
}

// Get a specific site
$site = $client->sites->get('site-id');
echo $site->dev_php_version; // '8.3'
```

## Typed Response Objects

All API methods return typed response objects for IDE autocomplete and type safety:

```php
use VectorPro\Response\Site;
use VectorPro\Response\Environment;
use VectorPro\Response\Deployment;
use VectorPro\Response\PaginatedResponse;

// Site properties
$site = $client->sites->get('site-id');
$site->id;                  // string
$site->partner_customer_id; // string
$site->dev_php_version;     // string
$site->tags;                // string[]
$site->status;              // ?string

// Paginated responses
$response = $client->sites->list(['per_page' => 10, 'page' => 2]);
$response->data;         // Site[]
$response->current_page; // int
$response->per_page;     // int
$response->total;        // int
$response->last_page;    // int
```

## API Reference

### Sites

```php
$client->sites->list(['per_page' => 10, 'page' => 1]);
$client->sites->get('site-id');
$client->sites->create(['partner_customer_id' => 'cust-123', 'dev_php_version' => '8.3']);
$client->sites->update('site-id', ['tags' => ['production']]);
$client->sites->clone('site-id');
$client->sites->delete('site-id');
$client->sites->suspend('site-id');
$client->sites->unsuspend('site-id');
$client->sites->resetSftpPassword('site-id');
$client->sites->getLogs('site-id', ['type' => 'error', 'lines' => 100]);
$client->sites->purgeCache('site-id', ['paths' => ['/wp-content/*']]);
```

### Environments

```php
$client->environments->list('site-id');
$client->environments->get('site-id', 'env-id');
$client->environments->create('site-id', [
    'name' => 'staging',
    'php_version' => '8.3',
    'is_production' => false,
]);
$client->environments->update('site-id', 'env-id', ['php_version' => '8.2']);
$client->environments->delete('site-id', 'env-id');
$client->environments->resetDatabasePassword('site-id', 'env-id');
```

### Deployments

```php
$client->environments->deployments->list('site-id', 'env-id');
$client->environments->deployments->create('site-id', 'env-id', ['description' => 'Release v1.0']);
$client->environments->deployments->get('site-id', 'env-id', 'deployment-id');
$client->environments->deployments->rollback('site-id', 'env-id', ['deployment_id' => 'prev-id']);
```

### Database

```php
$client->sites->db->import('site-id', [
    'url' => 'https://example.com/backup.sql.gz',
    'search_replace' => [
        ['search' => 'old-domain.com', 'replace' => 'new-domain.com'],
    ],
]);
$client->sites->db->createImportSession('site-id', ['filename' => 'backup.sql']);
$client->sites->db->runImport('site-id', 'import-id');
$client->sites->db->getImportStatus('site-id', 'import-id');
$client->sites->db->createExport('site-id', ['format' => 'sql']);
$client->sites->db->getExportStatus('site-id', 'export-id');
$client->sites->db->resetPassword('site-id');
```

### WAF (Web Application Firewall)

```php
// Allowed/blocked referrers
$client->sites->waf->listAllowedReferrers('site-id');
$client->sites->waf->addAllowedReferrer('site-id', ['hostname' => 'trusted.com']);
$client->sites->waf->removeAllowedReferrer('site-id', 'trusted.com');
$client->sites->waf->listBlockedReferrers('site-id');
$client->sites->waf->addBlockedReferrer('site-id', ['hostname' => 'spam.com']);
$client->sites->waf->removeBlockedReferrer('site-id', 'spam.com');

// Blocked IPs
$client->sites->waf->listBlockedIPs('site-id');
$client->sites->waf->addBlockedIP('site-id', ['ip' => '192.168.1.1']);
$client->sites->waf->removeBlockedIP('site-id', '192.168.1.1');

// Rate limiting
$client->sites->waf->listRateLimits('site-id');
$client->sites->waf->createRateLimit('site-id', [
    'path' => '/wp-login.php',
    'requests_per_second' => 5,
    'block_duration' => 300,
]);
$client->sites->waf->getRateLimit('site-id', 'rule-id');
$client->sites->waf->updateRateLimit('site-id', 'rule-id', ['requests_per_second' => 10]);
$client->sites->waf->deleteRateLimit('site-id', 'rule-id');
```

### SSL

```php
$client->sites->ssl->getStatus('site-id', 'env-id');
$client->sites->ssl->nudge('site-id', 'env-id');
```

### SSH Keys

```php
// Account-level
$client->account->sshKeys->list();
$client->account->sshKeys->create(['name' => 'My Key', 'public_key' => 'ssh-ed25519 ...']);
$client->account->sshKeys->get('key-id');
$client->account->sshKeys->delete('key-id');

// Site-level
$client->sites->sshKeys->list('site-id');
$client->sites->sshKeys->attach('site-id', ['ssh_key_id' => 'key-id']);
$client->sites->sshKeys->detach('site-id', 'key-id');
```

### Secrets

```php
// Global secrets
$client->account->secrets->list();
$client->account->secrets->create(['name' => 'API_KEY', 'value' => 'secret']);
$client->account->secrets->get('secret-id');
$client->account->secrets->update('secret-id', ['value' => 'new-secret']);
$client->account->secrets->delete('secret-id');

// Environment secrets
$client->environments->secrets->list('site-id', 'env-id');
$client->environments->secrets->create('site-id', 'env-id', ['name' => 'DB_HOST', 'value' => 'localhost']);
$client->environments->secrets->get('site-id', 'env-id', 'secret-id');
$client->environments->secrets->update('site-id', 'env-id', 'secret-id', ['value' => 'newhost']);
$client->environments->secrets->delete('site-id', 'env-id', 'secret-id');
```

### Webhooks

```php
$client->webhooks->list();
$client->webhooks->get('webhook-id');
$client->webhooks->create([
    'url' => 'https://example.com/webhook',
    'events' => ['site.created', 'deployment.completed'],
]);
$client->webhooks->update('webhook-id', ['enabled' => false]);
$client->webhooks->rotateSecret('webhook-id');
$client->webhooks->delete('webhook-id');
$client->webhooks->listLogs('webhook-id');
```

### API Keys

```php
$client->account->apiKeys->list();
$client->account->apiKeys->create(['name' => 'CI/CD Key']);
$client->account->apiKeys->delete('key-id');
```

### Events & PHP Versions

```php
// Returns PaginatedResponse<Event>
$response = $client->events->list([
    'site_id' => 'site-id',
    'type' => 'deployment',
    'per_page' => 50,
]);

// Event properties
$event = $response->data[0];
$event->id;          // string
$event->event;       // string (e.g., 'site.created', 'deployment.completed')
$event->model_type;  // ?string
$event->model_id;    // ?string
$event->context;     // mixed
$event->actor;       // ?Actor (ip, token_name)
$event->occurred_at; // ?string
$event->created_at;  // ?string

$client->phpVersions->list();
```
