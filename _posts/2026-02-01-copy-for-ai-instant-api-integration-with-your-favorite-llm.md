---
layout: post
title: "Copy for AI: instant API integration with your favorite LLM"
date: "Sat Feb 01 15:00:00 -0500 2026"
categories: [vector-pro, api]
tags: [ai, api, developer-tools]
author: Josh Priddle
tagline: "One click to copy everything an AI needs to write working API code."
---

We added a small feature to our API docs today: a "Copy for AI" button on every endpoint. Click it, paste into Claude or ChatGPT, and ask for code in whatever language you want. The AI gets enough context to write working integration code on the first try.

## The problem

LLMs are good at writing API integration code, but they need context. Without it, they hallucinate endpoints, invent parameters, and produce code that looks right but fails immediately.

You can paste in documentation, but that's tedious. You can point the AI at your API docs URL, but it might fetch an outdated cached version or miss important details. What you really want is a single copy-paste that gives the AI everything it needs.

## How it works

Every endpoint in our [API reference](/api/) now has a sparkles icon next to the copy URL button. Click it, and you get a markdown document with:

1. A pointer to our full documentation index
2. The endpoint title and description
3. A complete OpenAPI spec for that specific endpoint

Here's what gets copied for the "Create Site" endpoint:

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
      ...
```​
```

The OpenAPI spec includes every parameter, type, description, and response code. That's usually enough for an AI to generate correct code without follow-up questions.

## Real example: Ruby

We have official SDKs for [PHP](/docs/vector-pro/tools/php-sdk/) and [Node.js](/docs/vector-pro/tools/node-sdk/), but what if you're building in Ruby? You could read the API docs and write the HTTP calls yourself, or you could let an AI do it.

I copied the "Create Site" endpoint and pasted it into Claude with: "Write a Ruby class to create a Vector Pro site using this API. Use the standard library."

Here's what came back:

```ruby
require 'net/http'
require 'json'
require 'uri'

class VectorProClient
  BASE_URL = 'https://api.builtfast.com'

  def initialize(api_key)
    @api_key = api_key
  end

  def create_site(your_customer_id:, dev_php_version:, tags: nil)
    uri = URI("#{BASE_URL}/api/v1/vector/sites")

    body = {
      your_customer_id: your_customer_id,
      dev_php_version: dev_php_version
    }
    body[:tags] = tags if tags

    request = Net::HTTP::Post.new(uri)
    request['Authorization'] = "Bearer #{@api_key}"
    request['Content-Type'] = 'application/json'
    request['Accept'] = 'application/json'
    request.body = body.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end

    case response
    when Net::HTTPCreated
      JSON.parse(response.body)
    when Net::HTTPUnauthorized
      raise "Authentication failed"
    when Net::HTTPForbidden
      raise "Access denied"
    when Net::HTTPUnprocessableEntity
      error = JSON.parse(response.body)
      raise "Validation error: #{error['message']}"
    else
      raise "Unexpected response: #{response.code}"
    end
  end
end
```

That's working code. The AI got the URL right, used the correct HTTP method, included the required headers, handled the response codes from the spec, and even made `tags` optional because the OpenAPI spec didn't list it as required.

Usage:

```ruby
client = VectorProClient.new(ENV['VECTOR_PRO_API_KEY'])

site = client.create_site(
  your_customer_id: 'customer_123',
  dev_php_version: '8.3'
)

puts "Created site: #{site['data']['dev_domain']}"
```

Would I ship this to production? Probably not without some polish. But as a starting point, it's better than what I'd write in 30 seconds, and it took about 10.

## The documentation index

The copied content includes a link to `/docs/llms.txt`. This is a plain text index of all our documentation and API endpoints, formatted for LLM consumption. If the AI needs more context---say, to understand how environments relate to sites---it can fetch that file and find the relevant docs.

You can also point an AI at that URL directly if you want it to explore the full API rather than a single endpoint.

## Why this matters

Every Vector Pro endpoint now has this. That's 50+ endpoints where you can copy, paste, and get working code in seconds. Need to deploy an environment? Copy, paste, "write me a Bash script using curl." Want to list all sites in Go? Same workflow.

We're not replacing our official SDKs. If you're building something substantial in PHP or Node.js, use those---they handle pagination, retries, and type safety. But for quick scripts, one-off automations, or languages we don't have SDKs for, this gets you there fast.

The feature is live now. Head to the [API reference](/api/), find an endpoint, click the sparkles, and try it with your AI of choice.
