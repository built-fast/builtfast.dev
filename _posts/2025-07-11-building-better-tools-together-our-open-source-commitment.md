---
title: "Building Better Tools Together: Our Open Source Commitment"
date: "Fri Jul 11 19:58:35 -0400 2025"
author: Josh Priddle
tagline: "We believe the best tools come from developers who understand real problems. That's why we give back to the community."
tags:
- open-source
- general
excerpt: |
  At BuiltFast, we believe the best solutions come from developers who
  understand real-world problems. That's why we're committed to giving back to
  the community that shaped our careers—sharing the utilities, scripts, and
  solutions we've built along the way.
---

At BuiltFast, we believe the best solutions come from developers who
understand real-world problems. Having spent decades in the hosting industry,
we've seen firsthand how the right tools can make the difference between a
project that struggles and one that thrives. That's why we're committed to
giving back to the community that shaped our careers—sharing the utilities,
scripts, and solutions we've built along the way.

Our open source philosophy mirrors our hosting approach: security-first,
quality over speed, and practical solutions that solve actual problems. Every
project we release has been battle-tested in production environments, refined
through real-world use, and designed to help developers succeed without
compromising on security or maintainability.

## Our Current Projects

### [gh-shellcheck][]: Shell Script Quality Made Simple

Every project accumulates shell scripts—deployment scripts, build tools,
utility commands scattered across directories with inconsistent naming. While
ShellCheck is excellent for individual files, tracking down every script in a
repository becomes tedious, especially when they lack standard extensions or
live in unexpected places.

Our [GitHub CLI][] extension solves this by automatically discovering all
shell scripts in a git repository using intelligent detection—finding files by
extension, examining shebangs, and even checking BATS test files. It
integrates seamlessly with GitHub Actions for automated quality checks, but
works just as well locally with a simple `gh shellcheck` command. No more
maintaining manual lists of script paths or wondering if you missed a file.

### [phpstan-sensitive-parameter][]: Protecting Data in Stack Traces

PHP 8.2 introduced the `SensitiveParameter` attribute to redact sensitive data
from stack traces and debugging output—a crucial security feature that
prevents passwords, API keys, and personal information from appearing in logs.
The challenge is remembering to use it consistently across your codebase.

Our PHPStan extension automatically detects parameters that should be marked
sensitive based on naming patterns like `password`, `secret`, `token`,
`apikey`, and many others. It catches both obvious cases and subtle
ones—helping you identify security gaps before sensitive data makes it into
production logs. The rule integrates into your existing static analysis
workflow, making security a automatic part of code review rather than an
afterthought.

### [vim-laravel-projections][]: Navigate Laravel Like a Pro

Laravel's convention-over-configuration philosophy creates predictable file
structures, but navigating between related files—from controller to model to
test—can still slow down your development flow. If you're a Vim user who
appreciates efficient navigation, you know the frustration of typing out long
file paths or losing context while switching between files.

Built on Tim Pope's [projectionist.vim][], our Laravel projections provide
intelligent shortcuts that understand Laravel's structure. Type `:Emodel User`
to open your User model, `:AV` to jump to its test in a vertical split, or
`:Tcontroller` to open the related controller in a new tab. It includes
templates for new files, alternate file mappings, and even integration with
dispatch.vim for running tests directly from Vim. It's designed for developers
who want Laravel-aware navigation without leaving their preferred editor.

### [lcars][]: Laravel CLI Toolkit for Daily Development

Development workflows often involve running the same commands
repeatedly—testing, linting, generating hashes, checking SSL certificates, or
browsing documentation. Context switching between different tools and
remembering various command flags can interrupt your flow and slow down
productive work.

LCARS (Laravel CLI and Reusable Scripts) consolidates common Laravel
development tasks into a unified command-line interface. Run your entire test
suite with `lcars test`, browse Laravel documentation with fuzzy search using
`lcars docs`, generate secure hashes with `lcars hash`, or inspect HTTP
headers and SSL certificates with simple commands. It includes utilities for
encryption, clipboard operations, and even an interactive Artisan command
launcher. Available via Homebrew for easy installation, it's designed to
minimize friction in your daily development workflow.

### [gh-clover-annotate][]: Coverage Reports in GitHub Actions

Understanding test coverage is important for code quality, but parsing XML
coverage reports manually during code review is tedious and error-prone.
Coverage data often gets ignored simply because it's not visible where
decisions are being made—in the pull request itself.

Our GitHub CLI extension reads Clover XML coverage reports (generated by
PHPUnit or Pest) and creates formatted tables directly in GitHub Actions
summaries. See exactly which files have coverage gaps, understand the impact
of your changes, and make informed decisions about testing—all without leaving
GitHub. It's particularly useful for on-demand coverage reports that you can
trigger via workflow dispatch when you need detailed coverage analysis without
slowing down every CI run.

## Looking Forward

These projects represent just the beginning of our open source journey. As we
continue building tools for our hosting platform, we're committed to sharing
the ones that can benefit the broader developer community. Each project is
MIT-licensed and open to contributions, because the best tools improve when
diverse perspectives contribute to their development.

We're not just building hosting infrastructure—we're building the tools that
make great development experiences possible. Whether you're maintaining shell
scripts, securing PHP applications, navigating Laravel codebases, streamlining
your development workflow, or improving your testing process, we believe every
developer deserves tools that help them focus on what matters most: building
great software.

Check out our projects on [GitHub][], try them in your workflow, and let us know
how they work for you!

[lcars]: https://github.com/built-fast/lcars
[phpstan-sensitive-parameter]: https://github.com/built-fast/phpstan-sensitive-parameter
[gh-shellcheck]: https://github.com/built-fast/gh-shellcheck
[gh-clover-annotate]: https://github.com/built-fast/gh-clover-annotate
[GitHub]: https://github.com/built-fast
[vim-laravel-projections]: https://github.com/built-fast/vim-laravel-projections
[projectionist.vim]: https://github.com/tpope/vim-projectionist
[GitHub CLI]: https://cli.github.com
