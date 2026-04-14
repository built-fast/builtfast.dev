---
layout: post
title: "OpenAPI is a cheatcode for building with AI"
date: "Tue Apr 14 10:31:16 -0400 2026"
categories: [development]
tags: [ai, api, openapi]
author: Josh Priddle
tagline: "Point an AI at an OpenAPI spec and get a tested API client in any language. Pair it with Prism for cheap integration testing that keeps the AI honest."
---

Somehow, I hadn't heard of OpenAPI until about a year ago when we started
adding automated documentation to our Laravel monolith with [Scribe][].
Shortly later, I started adopting AI tools in my development flow. When I
needed to build some integrations with 3rd party APIs, I stumbled on their
OpenAPI specs and it was a game changer.

Let's face it: building API clients is 90% boilerplate. Most of the time, you
read docs then abstract away some patterns for auth, pagination, and error
handling. Then you copy paste a bunch of methods and classes, depending on
your taste, and then test and fix what the docs lied about or accidentally
omitted. If you're lucky, the docs include things like headers, payloads,
responses, error codes. Maybe even code snippets to SDKs, if the vendor offers
them. Otherwise, you better be good at testing.

If you want to do an API client _well_, and perhaps even open source it, you
need automated tests. That means maybe mocking responses with something like
Mockery, recording responses with something like [VCR][] and tweaking your
HTTP client in tests to return them, or spinning up a fake API server with
something like [Prism][].

OpenAPI specs make custom API clients trivial with AI tools. A well defined
OpenAPI spec will include all your headers, request payloads, responses, and
error codes, etc. With that, you can easily point your AI of choice at an
`openapi.yaml` file and ask it to generate a client in your language of
choice.

The cool part about this, is you now have a dirt cheap way to do
integration testing against a "real" API. With Prism or other tools, you can
spin up a fake API server that serves the exact same responses that your
client was written against. The _really_ cool thing with this, is that your AI
can correct itself if it starts hallucinating or making mistakes.

A workflow/setup I've landed on with a few Golang CLI projects I've been
working on is:

- Download the OpenAPI spec for whatever API
- Instruct an agent to make a plan to implement that as a CLI
    - There's a lot of back and forth to get the overall design nailed down
- Include a Bats based test suite, which...
    - Spins up a Prism server with the OpenAPI spec
    - Runs the CLI against it, and tests the output
- Include standard Go unit tests, etc.

As an API builder, I love this flow for a couple reasons. I can build great
CLIs for my users, and focus my attention on the UX and design of the CLI
rather than the boilerplate. I can quickly spin up SDKs in languages that I am
willing to support directly. And, if I don't feel comfortable maintaining an
SDK in an unknown language, a user could also trivially generate their own
client with the spec.

[Scribe]: https://scribe.knuckles.wtf
[VCR]: https://github.com/vcr/vcr
[Prism]: https://stoplight.io/open-source/prism
