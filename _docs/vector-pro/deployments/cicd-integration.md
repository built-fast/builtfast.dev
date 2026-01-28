---
title: CI/CD Integration
description: Automate Vector Pro deployments from your CI/CD pipeline using GitHub
  Actions, GitLab CI, and other tools.
category: Deployments
order: 1
---

Automate deployments from your CI/CD pipeline to deploy on push, on schedule, or on manual trigger.

## GitHub Actions

### Basic Deployment

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Deployment
        run: |
          curl -X POST \
            https://api.builtfast.dev/api/v1/vector/sites/${{ secrets.SITE_ID }}/environments/${{ secrets.PROD_ENV_ID }}/deployments \
            -H "Authorization: Bearer ${{ secrets.VECTOR_API_TOKEN }}" \
            -H "Accept: application/json"
```

### With Status Polling

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Deployment
        run: |
          DEPLOY_ID=$(curl -X POST \
            https://api.builtfast.dev/api/v1/vector/sites/${{ secrets.SITE_ID }}/environments/${{ secrets.PROD_ENV_ID }}/deployments \
            -H "Authorization: Bearer ${{ secrets.VECTOR_API_TOKEN }}" \
            -H "Accept: application/json" \
            | jq -r '.data.id')
          echo "DEPLOY_ID=$DEPLOY_ID" >> $GITHUB_ENV

      - name: Wait for Deployment
        run: |
          while true; do
            STATUS=$(curl -s \
              https://api.builtfast.dev/api/v1/vector/sites/${{ secrets.SITE_ID }}/environments/${{ secrets.PROD_ENV_ID }}/deployments/${{ env.DEPLOY_ID }} \
              -H "Authorization: Bearer ${{ secrets.VECTOR_API_TOKEN }}" \
              -H "Accept: application/json" \
              | jq -r '.data.status')

            if [ "$STATUS" = "deployed" ]; then
              echo "Deployment successful"
              exit 0
            elif [ "$STATUS" = "failed" ]; then
              echo "Deployment failed"
              exit 1
            fi

            echo "Status: $STATUS - waiting..."
            sleep 10
          done
```

### Using Vector CLI

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Install Vector CLI
        run: |
          curl -sL https://github.com/builtfast/vector-cli/releases/latest/download/vector-linux-amd64 -o vector
          chmod +x vector
          sudo mv vector /usr/local/bin/

      - name: Deploy
        env:
          VECTOR_API_KEY: ${{ secrets.VECTOR_API_KEY }}
        run: |
          vector deploy:create \
            --site=${{ secrets.SITE_ID }} \
            --env=${{ secrets.PROD_ENV_ID }} \
            --wait
```

## GitLab CI

```yaml
stages:
  - deploy

deploy_production:
  stage: deploy
  only:
    - main
  script:
    - |
      DEPLOY_ID=$(curl -X POST \
        "https://api.builtfast.dev/api/v1/vector/sites/${SITE_ID}/environments/${PROD_ENV_ID}/deployments" \
        -H "Authorization: Bearer ${VECTOR_API_TOKEN}" \
        -H "Accept: application/json" \
        | jq -r '.data.id')

      while true; do
        STATUS=$(curl -s \
          "https://api.builtfast.dev/api/v1/vector/sites/${SITE_ID}/environments/${PROD_ENV_ID}/deployments/${DEPLOY_ID}" \
          -H "Authorization: Bearer ${VECTOR_API_TOKEN}" \
          -H "Accept: application/json" \
          | jq -r '.data.status')

        if [ "$STATUS" = "deployed" ]; then
          echo "Deployment successful"
          exit 0
        elif [ "$STATUS" = "failed" ]; then
          echo "Deployment failed"
          exit 1
        fi

        sleep 10
      done
  variables:
    SITE_ID: $VECTOR_SITE_ID
    PROD_ENV_ID: $VECTOR_PROD_ENV_ID
```

## Staging → Production Workflow

### Deploy to Staging on PR

```yaml
name: Deploy to Staging
on:
  pull_request:
    branches: [main]

jobs:
  staging:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        env:
          VECTOR_API_KEY: ${{ secrets.VECTOR_API_KEY }}
        run: |
          vector deploy:create \
            --site=${{ secrets.SITE_ID }} \
            --env=${{ secrets.STAGING_ENV_ID }} \
            --wait
```

### Deploy to Production on Merge

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  production:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        env:
          VECTOR_API_KEY: ${{ secrets.VECTOR_API_KEY }}
        run: |
          vector deploy:create \
            --site=${{ secrets.SITE_ID }} \
            --env=${{ secrets.PROD_ENV_ID }} \
            --wait
```

## Using Webhooks Instead of Polling

For more efficient CI/CD, use webhooks to notify your pipeline:

1. Create a webhook endpoint in your CI system
2. Register Vector webhook for `vector.deployment.completed`
3. Trigger next pipeline step from webhook

## Rollback on Failure

```yaml
- name: Deploy with Rollback Safety
  env:
    VECTOR_API_KEY: ${{ secrets.VECTOR_API_KEY }}
  run: |
    # Get current deployment before deploying
    CURRENT=$(vector deploy:list --site=$SITE_ID --env=$PROD_ENV_ID --json | jq -r '.[0].id')

    # Deploy
    vector deploy:create --site=$SITE_ID --env=$PROD_ENV_ID --wait || {
      echo "Deployment failed, rolling back..."
      vector deploy:rollback $CURRENT
      exit 1
    }
```

## Secrets Configuration

Store these secrets in your CI/CD platform:

| Secret | Description |
|--------|-------------|
| `VECTOR_API_KEY` | API authentication token |
| `SITE_ID` | Target site ID |
| `STAGING_ENV_ID` | Staging environment ID |
| `PROD_ENV_ID` | Production environment ID |

## Next Steps

- [Deployment Basics](/docs/vector-pro/deployments/deployment-basics/) - Understanding deployments
- [Rollbacks](/docs/vector-pro/deployments/rollbacks/) - Automated rollback strategies
- [CLI](/docs/vector-pro/tools/cli/) - Command-line reference
