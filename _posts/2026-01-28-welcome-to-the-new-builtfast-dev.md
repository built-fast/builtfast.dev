---
title: "Welcome to the new builtfast.dev"
date: "Tue Jan 28 00:00:00 -0500 2026"
author: Josh Priddle
tagline: "We rebuilt our developer portal from scratch. Here's what's new."
tags:
- general
- vector-pro
---

We've been quietly rebuilding builtfast.dev over the past ~~few months~~ two
weeks[^1], and today we're making it official. The site you're reading now is the new home for
Vector Pro documentation, our open source projects, and this engineering blog.

## The documentation problem

If you've ever tried to integrate with an API whose docs were last updated
sometime during the previous administration, you know the pain. Endpoints
change, parameters get added, examples stop working, and you're left reading
code or bothering support to figure out what actually works.

We didn't want that for Vector Pro. So we built a system where the
documentation can't drift from the API.

Here's how it works: [Scribe][] introspects our Laravel controllers, form
requests, and route definitions to generate structured YAML. A GitHub Actions
workflow detects any API changes, regenerates the docs, and pushes the data to
this Jekyll site. A custom Ruby plugin transforms that into browsable
documentation with code examples in curl, PHP, and JavaScript.

Every merge to main that touches API code updates the public docs within
minutes. No manual steps. No "I'll update the docs later" that never happens.

## What's here now

**Vector Pro Documentation** — Full guides covering architecture,
authentication, deployments, security, databases, environments, domains, and
performance. The API reference includes every endpoint with parameters,
response schemas, and working code examples.

**Developer Tools** — Everything you need to work with the API:

- [Vector CLI][] — A Rust-based CLI for managing sites without leaving the terminal
- [PHP SDK][] — Fully typed, PSR-18 compliant
- [Node.js SDK][] — TypeScript-first with async/await
- [OpenAPI Spec][] — For code generation and tooling
- [Postman Collection][] — Ready-to-use requests

**Open Source Projects** — Tools we build and use in production:

- [gh-shellcheck][] — Discover and lint shell scripts across repos
- [phpstan-sensitive-parameter][] — Catch unprotected sensitive data in stack traces
- [gh-clover-annotate][] — Coverage tables in GitHub Actions summaries
- [LCARS][] — Laravel CLI toolkit

**This Blog** — Technical articles on PHP, Laravel, GitHub Actions, and hosting
infrastructure. We write for developers who want depth, not marketing copy. Oh,
and [the site itself is open source][site-repo] too.

## How we built it

The portal itself is intentionally simple: Jekyll for static generation,
Alpine.js where we need interactivity, dark mode by default. The whole site
builds in seconds and deploys to GitHub Pages.

We didn't reach for a JavaScript framework because we didn't need one. The most
complex interactive element is a code example switcher. Alpine handles that in
about 20 lines.

## Getting started

Vector Pro is currently in private beta. If you're interested in running
WordPress on serverless infrastructure, [get in touch][contact]—we'd love to
talk about what you're building.

In the meantime, the documentation, SDKs, and open source tools are all
publicly available. Poke around, and when you're ready to try it out, we'll get
you set up.

[contact]: /contact/
[Scribe]: https://scribe.knuckles.wtf
[Vector CLI]: /oss/vector-cli/
[PHP SDK]: /docs/vector-pro/tools/php-sdk/
[Node.js SDK]: /docs/vector-pro/tools/node-sdk/
[OpenAPI Spec]: /api/openapi/
[Postman Collection]: /api/postman/
[gh-shellcheck]: /oss/gh-shellcheck/
[phpstan-sensitive-parameter]: /oss/phpstan-sensitive-parameter/
[gh-clover-annotate]: /oss/gh-clover-annotate/
[LCARS]: /oss/lcars/
[site-repo]: https://github.com/built-fast/builtfast.dev

[^1]: We'll have a deep dive on the redesign process coming soon. It's a story.
