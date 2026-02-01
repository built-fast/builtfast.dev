---
title: AI Assistants
description: Generate working API integration code in any language using Claude, ChatGPT,
  or other AI assistants.
category: Tools
order: 6
---

The Vector Pro API documentation is designed to work well with AI assistants. Every endpoint has a "Copy for AI" button, and we publish a machine-readable documentation index for broader exploration.

## How It Works

1. Navigate to any endpoint in the [API reference](/api/)
2. Click the sparkles icon next to the copy URL button
3. Paste the copied content into your preferred LLM
4. Ask for code in any language

The copied content includes:

- A pointer to the full documentation index
- The endpoint title and description
- A complete OpenAPI spec with parameters, types, and response codes

## Example Output

When you click "Copy for AI" on the Create Site endpoint, you get:

```markdown
> ## Documentation Index
> Fetch the complete documentation index at: https://builtfast.dev/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Site

> Creates a new site for the authenticated account...

## OpenAPI

```yaml post /api/v1/vector/sites
openapi: 3.1.0
info:
  title: Create Site
  version: 1.0.0
paths:
  /api/v1/vector/sites:
    post:
      summary: Create Site
      parameters: [...]
      requestBody: [...]
      responses: [...]
```​
```

## Sample Prompts

After pasting the endpoint content, try prompts like:

| Language | Prompt |
|----------|--------|
| Ruby | "Write a Ruby class using net/http to call this API" |
| Go | "Generate a Go function with proper error handling" |
| Rust | "Create a Rust implementation using reqwest" |
| Bash | "Write a curl script with error checking" |
| Python | "Generate a Python function using requests" |

## Documentation Index

The copied content references `/docs/llms.txt`, a plain text index of all documentation and API endpoints. If you want an AI to explore the full API:

```
Fetch https://builtfast.dev/docs/llms.txt and tell me what Vector Pro can do
```

The LLM can use this index to discover related endpoints and documentation pages.

## When to Use This vs SDKs

**Use AI assistants when:**

- You need code in a language without an official SDK
- You're writing a quick script or one-off automation
- You want to prototype before committing to an approach

**Use official SDKs when:**

- Building production applications in PHP or Node.js
- You need pagination, retries, and error handling built-in
- You want TypeScript types or PHPDoc annotations

## Next Steps

- [API Reference](/api/) - Browse all endpoints
- [PHP SDK](/docs/vector-pro/tools/php-sdk/) - Official PHP SDK
- [Node.js SDK](/docs/vector-pro/tools/node-sdk/) - Official Node.js SDK
