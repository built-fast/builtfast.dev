---
title: Getting Started
description: Get up and running with Vector Pro in under 5 minutes.
category: Introduction
order: 1
---

Vector Pro is a serverless hosting platform for PHP applications. This guide walks you through your first deployment.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** for the CLI
- **A Vector Pro account** ([sign up here](https://builtfast.com/signup))
- **Your API key** from the dashboard

## Install the CLI

Install the Vector CLI globally via npm:

```bash
npm install -g @builtfast/vector-cli
```

Verify the installation:

```bash
vector --version
# vector-cli/2.1.0
```

## Authenticate

Log in to your Vector Pro account:

```bash
vector login
```

This opens a browser window for authentication. Once complete, your credentials are stored locally.

## Initialize Your Project

Navigate to your PHP project and initialize Vector Pro:

```bash
cd my-project
vector init
```

This creates a `vector.yml` configuration file:

```yaml
name: my-project
runtime: php-8.2
build:
  install: composer install --no-dev
```

## Deploy

Deploy your application:

```bash
vector deploy
```

The CLI will:

1. Build your application
2. Upload the artifacts
3. Deploy to our global network
4. Return your live URL

```
✓ Building application...
✓ Uploading artifacts (2.3 MB)...
✓ Deploying to 12 regions...
✓ Live at https://my-project.vectorpro.dev

Deployment complete in 34s
```

## Next Steps

- [Configure your domain](/docs/custom-domains/)
- [Set up environment variables](/docs/environment-variables/)
- [Enable preview deployments](/docs/preview-deployments/)
- [Explore the API reference](/docs/api-reference/)
