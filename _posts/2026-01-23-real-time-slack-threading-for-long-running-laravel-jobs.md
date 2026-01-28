---
published: false
layout: post
title: "Real-time Slack threading for long-running Laravel jobs"
date: "Thu Jan 23 17:00:00 -0500 2026"
categories: [development]
tags: [laravel, php, slack]
author: Josh Priddle
tagline: "For long-running jobs with multiple steps, visibility matters. Threaded Slack notifications with live progress updates."
---

Most developers send a single Slack notification when a job completes. For
jobs that take 30 seconds and involve 15 different steps, you could just fire
and forget, then wait for the one message at the end. But visibility counts,
and we're a bit extra here at BuiltFast. As operations grow and jobs start
taking longer than 30 seconds, your team will appreciate knowing exactly
what's happening and where.

This post shows how to implement threaded Slack notifications with live
progress updates for long-running Laravel jobs.

![Slack notification showing provisioning progress](/assets/images/posts/2026-01/slack-notification.png)

The main message shows completion status with a summary, while the threaded
reply displays step-by-step progress with checkmarks.

## The key concepts

Slack's API has three features that make this possible:

1. **Message timestamps as IDs** - When you send a message, Slack returns a
   `ts` (timestamp) that uniquely identifies that message
2. **Threading via `thread_ts`** - You can reply to a message by including its
   `ts` as `thread_ts` in a new message
3. **Message updates** - You can update any message by calling `chat.update`
   with its `ts`

## The SlackService

First, build a reusable SlackService that wraps the Slack API:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Closure;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Notifications\Slack\SlackMessage;
use Illuminate\Support\Facades\Http;
use LogicException;
use RuntimeException;

final class SlackService
{
    /**
     * Send a Slack message.
     *
     * @param  string|array<mixed>|Closure  $message
     * @return array<mixed>
     */
    public function send(
        string|array|Closure $message,
        ?string $threadTimestamp = null,
        ?string $channel = null,
    ): array {
        $channel ??= $this->defaultChannel();

        if (is_array($message)) {
            $extra = array_filter([
                'channel' => $channel,
                'thread_ts' => $threadTimestamp,
            ], fn ($value) => ! is_null($value));

            $payload = array_merge($message, $extra);
        } else {
            $slackMessage = new SlackMessage;

            if ($channel !== null) {
                $slackMessage->to($channel);
            }

            if ($threadTimestamp !== null) {
                $slackMessage->threadTimestamp($threadTimestamp);
            }

            if ($message instanceof Closure) {
                $message($slackMessage);
            } else {
                $slackMessage->text($message);
            }

            $payload = $slackMessage->toArray();
        }

        return $this->sendRaw($payload);
    }

    /**
     * Update a Slack message.
     *
     * @param  string|array<mixed>|Closure  $message
     * @return array<mixed>
     */
    public function update(
        string|array|Closure $message,
        ?string $timestamp = null,
        ?string $channelId = null,
    ): array {
        $channelId ??= $this->defaultChannel();

        if (is_array($message)) {
            $params = $message;
            if ($channelId !== null) {
                $params['channel'] = $channelId;
            }
        } else {
            $slackMessage = new SlackMessage;

            if ($channelId !== null) {
                $slackMessage->to($channelId);
            }

            if ($message instanceof Closure) {
                $message($slackMessage);
            } else {
                $slackMessage->text($message);
            }

            $params = $slackMessage->toArray();
        }

        $extra = array_filter([
            'ts' => $timestamp,
            'as_user' => true,
        ], fn ($value) => ! is_null($value));

        $params = array_merge($params, $extra);

        if (is_null($params['ts'])) {
            throw new LogicException('Slack message timestamp is not set.');
        }

        return $this->sendRaw($params, '/chat.update');
    }

    /**
     * Add a reaction to a message.
     *
     * @return array<mixed>
     */
    public function addReaction(
        string $name,
        string $timestamp,
        ?string $channelId = null,
    ): array {
        return $this->sendRaw([
            'channel' => $channelId ?? $this->defaultChannel(),
            'name' => $name,
            'timestamp' => $timestamp,
        ], '/reactions.add');
    }

    /**
     * Send a raw Slack payload.
     *
     * @param  array<mixed>  $payload
     * @return array<mixed>
     */
    public function sendRaw(
        array $payload,
        string $url = '/chat.postMessage',
    ): array {
        if (is_null($payload['channel'])) {
            throw new LogicException('Slack notification channel is not set.');
        }

        $response = $this->client()
            ->post($url, $payload)
            ->throw();

        if ($response->successful() && $response->json('ok') === false) {
            throw new RuntimeException(
                'Slack API call failed with error ['.$response->json('error').'].'
            );
        }

        return $response->json();
    }

    private function client(): PendingRequest
    {
        $token = config('services.slack.notifications.bot_user_oauth_token');

        if (is_null($token)) {
            throw new LogicException('Slack bot user OAuth token is not set.');
        }

        return Http::asJson()
            ->withToken($token)
            ->baseUrl('https://slack.com/api');
    }

    private function defaultChannel(): ?string
    {
        return config('services.slack.notifications.channel');
    }
}
```

## The facade

Create a facade for cleaner syntax:

```php
<?php

declare(strict_types=1);

namespace App\Facades;

use App\Services\SlackService;
use Illuminate\Support\Facades\Facade;

/**
 * @method static array<mixed> send(string|array|\Closure $message, ?string $threadTimestamp = null, ?string $channel = null)
 * @method static array<mixed> update(string|array|\Closure $message, ?string $timestamp = null, ?string $channelId = null)
 * @method static array<mixed> addReaction(string $name, string $timestamp, ?string $channelId = null)
 */
final class Slack extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SlackService::class;
    }
}
```

## Message builders

For complex messages with Slack Block Kit, create message builder classes:

```php
<?php

declare(strict_types=1);

namespace App\Services\Slack;

abstract class Message
{
    /**
     * @return array<mixed>
     */
    abstract public function toArray(): array;

    /**
     * @return array<mixed>
     */
    final public function el(string $type, mixed ...$args): array
    {
        return ['type' => $type, ...$args];
    }

    /**
     * @return array<string, string>
     */
    final public function divider(): array
    {
        return $this->el(type: 'divider');
    }

    protected function defaultChannelId(): ?string
    {
        return config('services.slack.notifications.channel');
    }
}
```

```php
<?php

declare(strict_types=1);

namespace App\Services\Slack;

use Illuminate\Support\Arr;
use RuntimeException;

final class MarkdownMessage extends Message
{
    /** @var array<mixed> */
    private array $blocks = [];

    /**
     * @return array<mixed>
     */
    public function toArray(): array
    {
        if ($this->blocks === []) {
            throw new RuntimeException('No blocks have been added to the message.');
        }

        return [
            'channel' => $this->defaultChannelId(),
            'blocks' => $this->blocks,
        ];
    }

    public function addMessage(string ...$texts): self
    {
        $this->blocks[] = $this->el(
            type: 'section',
            text: $this->el(
                type: 'mrkdwn',
                text: implode("\n", $texts),
            ),
        );

        return $this;
    }

    public function addDivider(): self
    {
        $this->blocks[] = $this->divider();

        return $this;
    }

    public function addContext(string ...$texts): self
    {
        $this->addDivider();

        $this->blocks[] = $this->el(
            type: 'context',
            elements: Arr::map($texts, function ($text) {
                return $this->el(type: 'mrkdwn', text: $text);
            }),
        );

        return $this;
    }
}
```

## The progress tracker

Here's the key piece - a class that tracks progress and updates Slack in
real-time:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Facades\Slack;
use App\Services\Slack\MarkdownMessage;
use Carbon\CarbonImmutable;

final class SlackProgressTracker
{
    private ?string $mainMessageTs = null;
    private ?string $threadTs = null;
    private ?string $channelId = null;
    private CarbonImmutable $startedAt;

    /** @var array<int, array{step: string, status: string}> */
    private array $steps = [];

    public function __construct(
        private readonly string $title,
        private readonly string $channel,
    ) {
        $this->startedAt = CarbonImmutable::now();
    }

    /**
     * Start tracking - sends the initial "in progress" message.
     */
    public function start(): self
    {
        $message = (new MarkdownMessage())
            ->addMessage(
                ":hourglass_flowing_sand: *{$this->title}*",
                '',
                '_Starting..._'
            );

        $response = Slack::send(
            message: $message->toArray(),
            channel: $this->channel,
        );

        $this->mainMessageTs = $response['ts'];
        $this->channelId = $response['channel'];

        return $this;
    }

    /**
     * Add a step and update the thread.
     */
    public function step(string $description, string $status = 'pending'): self
    {
        $this->steps[] = [
            'step' => $description,
            'status' => $status,
        ];

        $this->updateThread();

        return $this;
    }

    /**
     * Mark the last step as complete.
     */
    public function completeStep(): self
    {
        if ($this->steps !== []) {
            $lastIndex = count($this->steps) - 1;
            $this->steps[$lastIndex]['status'] = 'complete';
            $this->updateThread();
        }

        return $this;
    }

    /**
     * Mark the last step as failed.
     */
    public function failStep(string $error = ''): self
    {
        if ($this->steps !== []) {
            $lastIndex = count($this->steps) - 1;
            $this->steps[$lastIndex]['status'] = 'failed';
            if ($error !== '') {
                $this->steps[$lastIndex]['step'] .= " - {$error}";
            }
            $this->updateThread();
        }

        return $this;
    }

    /**
     * Complete the entire process and update the main message.
     *
     * @param array<string, string> $summary Key-value pairs to display
     */
    public function complete(array $summary = []): self
    {
        $duration = $this->startedAt->diffInSeconds(CarbonImmutable::now());

        $lines = [
            ":white_check_mark: *{$this->title}*",
            '',
        ];

        foreach ($summary as $label => $value) {
            $lines[] = "- *{$label}:* {$value}";
        }

        $lines[] = '';
        $lines[] = "_Completed in {$duration} seconds_";

        $message = (new MarkdownMessage())->addMessage(...$lines);

        Slack::update(
            message: $message->toArray(),
            timestamp: $this->mainMessageTs,
            channelId: $this->channelId,
        );

        // Add a checkmark reaction
        Slack::addReaction(
            name: 'white_check_mark',
            timestamp: $this->mainMessageTs,
            channelId: $this->channelId,
        );

        return $this;
    }

    /**
     * Mark the entire process as failed.
     */
    public function fail(string $error = ''): self
    {
        $lines = [
            ":x: *{$this->title}* - Failed",
        ];

        if ($error !== '') {
            $lines[] = '';
            $lines[] = "```{$error}```";
        }

        $message = (new MarkdownMessage())->addMessage(...$lines);

        Slack::update(
            message: $message->toArray(),
            timestamp: $this->mainMessageTs,
            channelId: $this->channelId,
        );

        return $this;
    }

    /**
     * Update the thread with current step progress.
     */
    private function updateThread(): void
    {
        $lines = [];

        foreach ($this->steps as $step) {
            $emoji = match ($step['status']) {
                'complete' => ':white_check_mark:',
                'failed' => ':x:',
                default => ':hourglass_flowing_sand:',
            };

            $lines[] = "{$emoji} {$step['step']}";
        }

        $message = (new MarkdownMessage())->addMessage(...$lines);

        if ($this->threadTs === null) {
            // First thread message - create it
            $response = Slack::send(
                message: $message->toArray(),
                threadTimestamp: $this->mainMessageTs,
                channel: $this->channelId,
            );
            $this->threadTs = $response['ts'];
        } else {
            // Update existing thread message
            Slack::update(
                message: $message->toArray(),
                timestamp: $this->threadTs,
                channelId: $this->channelId,
            );
        }
    }
}
```

## Using it in a job

Here's how to use this in a provisioning job:

```php
<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Site;
use App\Services\SlackProgressTracker;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

final class ProvisionSiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly Site $site,
    ) {}

    public function handle(): void
    {
        $tracker = new SlackProgressTracker(
            title: "Provisioning {$this->site->domain}",
            channel: config('services.slack.notifications.provisioning_channel'),
        );

        $tracker->start();

        try {
            // Step 1: Validate
            $tracker->step('Running preflight checks');
            $this->runPreflightChecks();
            $tracker->completeStep();

            // Step 2: Create user
            $tracker->step("Creating system user `{$this->site->username}`");
            $this->createSystemUser();
            $tracker->completeStep();

            // Step 3: Configure web server
            $tracker->step('Configuring Apache');
            $this->configureApache();
            $tracker->completeStep();

            // Step 4: Set up database
            $tracker->step('Creating database');
            $this->createDatabase();
            $tracker->completeStep();

            // Step 5: Configure PHP
            $tracker->step('Configuring PHP');
            $this->configurePHP();
            $tracker->completeStep();

            // Done!
            $tracker->complete([
                'Domain' => $this->site->domain,
                'Username' => $this->site->username,
                'Server' => $this->site->server->hostname,
            ]);

        } catch (Throwable $e) {
            $tracker->failStep($e->getMessage());
            $tracker->fail($e->getMessage());

            throw $e;
        }
    }

    private function runPreflightChecks(): void
    {
        // Your validation logic
    }

    private function createSystemUser(): void
    {
        // Create Linux user account
    }

    private function configureApache(): void
    {
        // Set up Apache vhost
    }

    private function createDatabase(): void
    {
        // Create MySQL database and user
    }

    private function configurePHP(): void
    {
        // Configure PHP-FPM pool
    }
}
```

## Configuration

Add these to your `config/services.php`:

```php
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_TOKEN'),
        'channel' => env('SLACK_NOTIFICATION_CHANNEL', '#general'),
        'provisioning_channel' => env('SLACK_PROVISIONING_CHANNEL', '#provisioning'),
    ],
],
```

## Setting up the Slack app

1. Create a Slack App at <https://api.slack.com/apps>
2. Add these OAuth scopes:
   - `chat:write` - Send messages
   - `chat:write.public` - Send to channels without joining
   - `reactions:write` - Add reactions
3. Install to your workspace
4. Copy the Bot User OAuth Token to your `.env`

## Testing

For testing, create a fake method on your service:

```php
public static function fake(): void
{
    Http::fake([
        'slack.com/api/*' => Http::response([
            'ok' => true,
            'ts' => '1742623778.410039',
            'channel' => 'C12345678',
        ]),
    ]);
}
```

Then in your tests:

```php
it('sends slack notifications during provisioning', function () {
    Slack::fake();

    $site = Site::factory()->create();

    ProvisionSiteJob::dispatch($site);

    Http::assertSent(function ($request) {
        return str_contains($request->url(), 'chat.postMessage');
    });
});
```

## Why this matters

For any business with long-running operations, visibility into what's
happening is important:

1. **Debugging** - When something fails at step 12 of 15, you know exactly
   where to look
2. **Customer support** - You can tell customers exactly what's happening with
   their order
3. **Team awareness** - Everyone can see activity in real-time

The extra code to implement threading and live updates pays dividends in
operational clarity.

## Wrapping up

Slack's threading API combined with message updates creates a straightforward
pattern for real-time job progress tracking. The key insight is treating the
message timestamp as a pointer you can use to update and thread off of.

This pattern works for any long-running process: deployments, data imports,
report generation, or any job with multiple discrete steps.
