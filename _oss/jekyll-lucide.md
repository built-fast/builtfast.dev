---
title:  Jekyll Lucide
period: Feb 2026
date:   2026-02-01
github: https://github.com/built-fast/jekyll-lucide
license: MIT
tags:
  - jekyll
  - icons
  - ruby
languages:
  - name: Ruby
    icon: ruby
tagline: Lucide icons as inline SVGs for Jekyll sites
excerpt: |
  A Jekyll plugin that provides Lucide icons as inline SVGs via a Liquid tag.
  Adapted from lucide-rails.
---

Jekyll Lucide is a Jekyll plugin that provides [Lucide](https://lucide.dev) icons
as inline SVGs via a Liquid tag. It's adapted from
[lucide-rails](https://github.com/heyvito/lucide-rails).

## Installation

Add the gem to your Jekyll site's Gemfile:

```ruby
gem "jekyll-lucide"
```

Then run `bundle install`.

Add the plugin to your `_config.yml`:

```yaml
plugins:
  - jekyll-lucide
```

## Usage

Use the `lucide_icon` Liquid tag in your templates:

```liquid
{% raw %}{% lucide_icon "home" %}
{% lucide_icon "arrow-right" size="32" class="my-icon" %}
{% lucide_icon "search" stroke-width="1.5" %}{% endraw %}
```

You can also use variables for the icon name:

```liquid
{% raw %}{% lucide_icon page.icon %}
{% lucide_icon item.icon_name size="20" %}{% endraw %}
```

## Options

| Option         | Description                            |
| -------------- | -------------------------------------- |
| `size`         | Sets both `width` and `height`         |
| `class`        | CSS class(es) to add to the SVG        |
| `stroke-width` | Stroke width (default: `2`)            |
| `stroke`       | Stroke color (default: `currentColor`) |
| `fill`         | Fill color (default: `none`)           |

Any valid SVG attribute can be passed as an option.

## Default Attributes

All icons include these default attributes:

```html
aria-hidden="true"
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
```

## Configuration

Set default attributes for all icons in `_config.yml`:

```yaml
lucide:
  defaults:
    class: "lucide-icon"
    stroke-width: "1.5"
```

## Available Icons

See the full list of available icons at [lucide.dev/icons](https://lucide.dev/icons).
