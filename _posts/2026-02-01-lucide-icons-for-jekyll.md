---
layout: post
title: "Lucide icons for Jekyll"
date: "Sun Feb 01 16:00:00 -0500 2026"
categories: [jekyll, open-source]
tags: [jekyll, lucide, icons, ruby]
author: Josh Priddle
tagline: "Easily embed Lucide icons as inline SVGs in your Jekyll templates."
---

I wanted to use [Lucide](https://lucide.dev) icons on this site and was surprised to find that a Jekyll plugin didn't exist yet. Lucide has become my go-to icon set for almost everything, so I figured someone would have already built exactly what I needed.

They hadn't, so I did.

## Adapting from Rails

Fortunately, I didn't have to start from scratch. I found [lucide-rails](https://github.com/heyvito/lucide-rails), and it basically worked exactly how I wanted, just for Rails and not Jekyll.

Huge thanks to Vito for making the original Rails gem. That foundation made putting [jekyll-lucide](https://github.com/built-fast/jekyll-lucide) together a breeze.

## How it works

The plugin provides a `lucide_icon` Liquid tag. You just pass the name of the icon and any optional attributes like `size`, `class`, or `stroke-width`.

```liquid
{% lucide_icon "home" %}
{% lucide_icon "arrow-right" size="32" class="my-icon" %}
{% lucide_icon "search" stroke-width="1.5" %}
```

It renders the icon as an inline `<svg>`. No extra HTTP requests, no icon fonts, no external image files. You can style them directly with CSS using `currentColor`, and override default attributes globally in `_config.yml` or per-icon in your templates.

## Configuration

If you want all your icons to have a specific class or stroke width by default, you can set that up in your `_config.yml`:

```yaml
lucide:
  defaults:
    class: "lucide-icon"
    stroke-width: "1.5"
```

The only downside is that the gem bundles all 1,500+ icons, so it adds a bit to your install size. In practice this hasn't been an issue --- the SVGs are tiny and only the ones you use end up in your HTML.

Source and installation instructions are on [GitHub](https://github.com/built-fast/jekyll-lucide).
