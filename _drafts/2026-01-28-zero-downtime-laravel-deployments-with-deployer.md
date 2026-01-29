---
layout: post
title: "Zero-downtime Laravel deployments with Deployer, 1Password, and Slack"
date: "Wed Jan 28 01:00:00 -0500 2026"
categories: [devops]
tags: [laravel, php, deployer, devops, 1password]
author: Josh Priddle
tagline: "A deployment setup for Laravel and Vue.js applications using Deployer, with secrets managed through 1Password CLI and notifications sent to Slack."
---

Deploying a Laravel application to production should be boring---in the best
way. After nearly two decades of deployment tools---Capistrano, rsync scripts,
git pull workflows, and various CI/CD pipelines---I've settled on [Deployer][1]
as my tool of choice for Laravel projects. It's simple,
powerful, and written in PHP, which means Laravel developers can extend it
without learning a new language.

This post walks through a deployment setup that handles both a Laravel API
backend and a Vue.js frontend, with secrets managed through 1Password CLI and
notifications sent to Slack.

## The wrapper script

Rather than invoking Deployer directly, I use a bash wrapper script that handles
authentication and routing between backend and frontend deployments:

```bash
#!/usr/bin/env bash
# Usage: deploy [backend|frontend] [task] [options]

set -euo pipefail

export OP_ACCOUNT="${OP_ACCOUNT:-mycompany}"
OP_URI="op://CLI/com.example.app.production.deployer"

op_run() {
  if ! type op > /dev/null 2>&1; then
    echo "1Password CLI is not installed" >&2
    echo "  brew install 1password-cli" >&2
    exit 1
  fi

  if ! op whoami > /dev/null 2>&1; then
    eval "$(op signin --account "$OP_ACCOUNT")"
  fi

  op run "$@"
}

deploy_backend() {
  check_vpn

  if [[ "${DEPLOYER_DOTENV_SECRET:-}" ]]; then
    export DEPLOYER_DOTENV_SECRET
    dep --ansi -f deploy/backend.php "${@:-deploy}"
  else
    export DEPLOYER_DOTENV_SECRET="${OP_URI}/DEPLOYER_DOTENV_SECRET"
    op_run -- dep --ansi -f deploy/backend.php "${@:-deploy}"
  fi
}

deploy_frontend() {
  check_vpn
  dep -f deploy/frontend.php "${@:-deploy}"
}

check_vpn() {
  if ! tailscale status > /dev/null 2>&1; then
    echo "You are not connected to Tailscale VPN." >&2
    return 1
  fi
}
```

The key insight here is using `op run` to inject secrets as environment
variables. The 1Password CLI reads secret references like
`op://CLI/com.example.app.production.deployer/DEPLOYER_DOTENV_SECRET` and
exposes them to the child process without ever writing them to disk.

For developers who have the secrets cached in [direnv][2], the script bypasses
1Password entirely---a nice optimization for frequent deployers.

## Deployer configuration

### Shared configuration

Both backend and frontend deployments share common settings:

```php
<?php
// deploy/setenv.php

namespace Deployer;

use RuntimeException;

set('repository', 'git@github.com:mycompany/myapp.git');
set('shell', 'bash -s');
set('keep_releases', 5);

function env(string $key): string
{
    $value = getenv($key);

    if ($value === false) {
        throw new RuntimeException("Missing required env var: {$key}");
    }

    return $value;
}

set('deployer_dotenv_secret', fn() => env('DEPLOYER_DOTENV_SECRET'));
```

### Backend deployment

The backend deployment extends Deployer's built-in Laravel recipe:

```php
<?php
// deploy/backend.php

namespace Deployer;

require 'recipe/laravel.php';
require __DIR__.'/slack.php';
require __DIR__.'/shared.php';
require __DIR__.'/setenv.php';

set('default_selector', 'role=backend,stage=production');
set('what', 'MyApp API');

host('api.example.com')
    ->setLabels(['role' => 'backend', 'stage' => 'production'])
    ->set('bin/php', '/opt/remi/php83/root/usr/bin/php')
    ->set('become', 'appuser')
    ->set('deploy_path', '~/app');

// Decrypt the encrypted .env file
desc('Decrypt .env file');
task('deploy:env:decrypt', artisan('env:decrypt --env={{where}} --key="{{deployer_dotenv_secret}}"'));

desc('Rename .env.production to .env');
task('deploy:env:rename', function () {
    run('cd {{release_path}} && mv .env.production .env');
});

// Generate API documentation post-deploy
desc('Generate API documentation');
task('app:docs', function () {
    run('cd {{release_path}} && {{bin/php}} artisan scribe:generate');
});

// Trigger PHP-FPM reload without root access
desc('Create restart file to trigger PHP-FPM reload');
task('deploy:reload-php-fpm', function () {
    run('touch {{deploy_path}}/restart.txt');
});

desc('Deploy backend');
task('deploy', [
    'deploy:info',
    'deploy:setup',
    'deploy:lock',
    'deploy:release',
    'deploy:update_code',
    'deploy:shared',
    'deploy:writable',
    'deploy:vendors',
    'deploy:env:decrypt',
    'deploy:env:rename',
    'artisan:storage:link',
    'artisan:config:cache',
    'artisan:route:cache',
    'artisan:view:cache',
    'artisan:event:cache',
    'artisan:migrate',
    'deploy:symlink',
    'deploy:unlock',
    'app:docs',
    'deploy:reload-php-fpm',
    'artisan:horizon:terminate',
    'deploy:cleanup',
    'deploy:success',
    'slack:notify',
]);

after('deploy:failed', 'deploy:unlock');
```

A few things worth noting:

1. **Encrypted environment files**: Laravel's `env:encrypt` command lets you
   commit encrypted `.env` files to your repository. The decryption key is
   passed via 1Password, so secrets never touch your local machine or CI logs.

2. **PHP-FPM reload**: Instead of requiring sudo access to restart PHP-FPM, I
   use a `restart.txt` file that a systemd path unit watches. When the file is
   touched, it triggers a graceful PHP-FPM reload.

3. **Horizon termination**: After the symlink switches, we terminate Horizon
   workers so they restart with the new code.

### Frontend deployment

The frontend deployment is simpler---no Laravel recipe needed:

```php
<?php
// deploy/frontend.php

namespace Deployer;

require 'recipe/common.php';
require __DIR__.'/setenv.php';
require __DIR__.'/shared.php';
require __DIR__.'/slack.php';

set('sub_directory', 'frontend');
set('what', 'MyApp Frontend');
set('default_selector', 'role=frontend,stage=production');
set('shared_files', ['.env.production']);

host('web.example.com')
    ->setLabels(['role' => 'frontend', 'stage' => 'production'])
    ->set('become', 'appuser')
    ->set('deploy_path', '~/app');

desc('Install NPM dependencies');
task('deploy:vendors', function () {
    run('cd {{release_path}} && npm ci 2>&1');
});

desc('Build application');
task('deploy:build', function () {
    run('cd {{release_path}} && npm run build:prod 2>&1 && rm -rf public && mv dist public');
});

desc('Deploy frontend');
task('deploy', [
    'deploy:info',
    'deploy:setup',
    'deploy:lock',
    'deploy:release',
    'deploy:update_code',
    'deploy:shared',
    'deploy:vendors',
    'deploy:build',
    'deploy:symlink',
    'deploy:unlock',
    'deploy:cleanup',
    'deploy:success',
    'slack:notify',
]);
```

## Slack notifications

The Slack integration generates contextual deploy messages showing exactly what
changed:

```php
<?php
// deploy/slack.php

namespace Deployer;

use Deployer\Utility\Httpie;

set('slack_text', function () {
    $repo = get('repository');
    $repoUrl = str_replace(['git@github.com:', '.git'], ['https://github.com/', ''], $repo);

    $original = mb_substr(get('slack_original_revision', 'HEAD'), 0, 8);
    $new = mb_substr(get('release_revision', 'HEAD'), 0, 8);
    $logPaths = get('slack_git_log_paths', '.');

    $format = "• `<{$repoUrl}/commit/%h|%h>`: %s";

    if ($original === $new) {
        $action = 'Re-deployed';
        $log = runLocally("git log -1 --pretty=format:'$format' {$new}");
        $diff = "<{$repoUrl}/commit/{$new}|$new>";
    } else {
        $action = 'Deployed';
        $appLogs = runLocally("cd $(git rev-parse --show-toplevel) && git log --pretty=format:'$format' {$original}..{$new} -- {$logPaths}");
        $fullLogs = runLocally("cd $(git rev-parse --show-toplevel) && git log --pretty=format:'%h' {$original}..{$new}");
        $fullChangeCount = count(explode("\n", trim($fullLogs)));

        $diff = $fullChangeCount === 1
            ? "<{$repoUrl}/commit/{$new}|1 commit>"
            : "<{$repoUrl}/compare/{$original}...{$new}|{$fullChangeCount} commits>";

        // Truncate long changelogs
        $appLogs = explode("\n", $appLogs);
        if (count($appLogs) > 20) {
            $appLogs = array_slice($appLogs, 0, 20);
            $appLogs[] = "• _and more..._";
        }
        $log = implode("\n", $appLogs);
    }

    // Convert GitHub PR references to links
    $log = preg_replace('/\(#(\d+)\)/', '(<'.$repoUrl.'/pull/$1|#$1>)', $log);

    return "{$action} {$diff} to *{{what}} {{where}}*:\n\n{$log}";
});

set('slack_webhook', function () {
    return get('where') === 'production'
        ? 'https://hooks.slack.com/services/YOUR/PROD/WEBHOOK'
        : 'https://hooks.slack.com/services/YOUR/DEV/WEBHOOK';
});

desc('Notifies Slack');
task('slack:notify', function () {
    Httpie::post(get('slack_webhook'))
        ->jsonBody(['text' => get('slack_text'), 'mrkdwn_in' => ['text']])
        ->send();
})->once()->hidden();

// Capture the pre-deploy revision for comparison
task('deploy:info:original-revision', function () {
    $rev = trim(run('cat {{current_path}}/REVISION', no_throw: true));
    set('slack_original_revision', $rev ?: 'HEAD');
})->once()->hidden();

after('deploy:info', 'deploy:info:original-revision');
```

The `slack_git_log_paths` setting filters the git log to only show commits
relevant to the app being deployed. When deploying the frontend, you only see
frontend changes; when deploying the backend, you only see backend changes.

A typical Slack message looks like:

> Deployed [4 commits](https://github.com/mycompany/myapp/compare/a1b2c3d4...e5f6g7h8) to **MyApp API production**:
>
> - `e5f6g7h8`: Add rate limiting to authentication endpoints ([#142](https://github.com/mycompany/myapp/pull/142))
> - `d4c3b2a1`: Fix invoice PDF generation for multi-currency accounts
> - `9f8e7d6c`: Update Horizon configuration for better queue throughput
> - `b5a4c3d2`: Add missing index on orders.customer_id ([#141](https://github.com/mycompany/myapp/pull/141))

## Checking pending deploys

One useful utility task shows what commits are waiting to be deployed:

```php
<?php
// deploy/shared.php

namespace Deployer;

desc('Show pending commits');
task('deploy:pending', function () {
    $currentRevision = run('cat {{current_path}}/REVISION', no_throw: true);

    if (empty($currentRevision)) {
        $currentRevision = 'HEAD';
    }

    $gitLog = runLocally("git log {$currentRevision}..HEAD --pretty=format:'<comment>%h</comment>: %s <fg=cyan>(%an)</>'");

    if (empty($gitLog)) {
        writeln('<info>No pending commits to deploy</info>');
    } else {
        writeln("<info>Pending commits:</info>\n{$gitLog}");
    }
});
```

Running `deploy backend deploy:pending` shows:

```
Pending commits:
e5f6g7h8: Add rate limiting to authentication endpoints (Sarah Chen)
d4c3b2a1: Fix invoice PDF generation for multi-currency accounts (Josh Priddle)
9f8e7d6c: Update Horizon configuration for better queue throughput (Sarah Chen)
```

## Usage

With all this in place, deploying is straightforward:

```bash
# Deploy backend (default)
deploy

# Deploy frontend
deploy frontend

# Deploy a specific branch
deploy backend deploy -o branch=feature/new-billing

# Rollback to previous release
deploy backend rollback

# Unlock a failed deployment
deploy backend deploy:unlock

# Check what's waiting to be deployed
deploy backend deploy:pending
```

## Wrapping up

This setup has served me well across multiple production applications. The key
principles:

1. **Keep secrets out of the repository** using 1Password CLI or similar
2. **Use atomic deployments** with symlink switching for zero downtime
3. **Automate everything** including cache clearing, migrations, and
   notifications
4. **Make rollbacks trivial** by keeping multiple releases

Deployer's PHP-based configuration means you can leverage your existing Laravel
knowledge, and the built-in recipes handle most of the work. The remaining bit
is just wiring up your specific requirements.

[1]: https://deployer.org
[2]: https://direnv.net
