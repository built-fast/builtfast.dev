---
layout: post
title: "Dark mode images in GitHub READMEs"
date: "Sat Jan 24 00:00:00 -0500 2026"
categories: [github]
tags: [github, readme, dark-mode, tips]
author: Josh Priddle
tagline: "GitHub supports automatic light/dark mode image switching in READMEs using simple URL fragments."
---

GitHub supports automatic light/dark mode image switching in READMEs. Add a URL
fragment to show different images based on the user's system preferences.

## The syntax

Append `#gh-light-mode-only` or `#gh-dark-mode-only` to your image URLs:

```html
<p align="center">
  <img alt="Logo" src="logo-light.svg#gh-light-mode-only"/>
  <img alt="Logo" src="logo-dark.svg#gh-dark-mode-only"/>
</p>
```

Users with light mode see `logo-light.svg`. Dark mode users see `logo-dark.svg`.

## Markdown syntax

This also works with standard markdown image syntax:

```markdown
![Logo](logo-light.svg#gh-light-mode-only)
![Logo](logo-dark.svg#gh-dark-mode-only)
```

## How it works

GitHub's markdown renderer parses these URL fragments and wraps the images in a
`<picture>` element with appropriate `prefers-color-scheme` media queries. The
fragment itself doesn't affect the actual image URL—it's stripped before the
image loads.

## Common use cases

- **Logos**: Show a dark logo on light backgrounds and vice versa
- **Diagrams**: Mermaid or other diagrams with inverted colors
- **Screenshots**: Terminal screenshots with different themes
- **Badges**: Custom badges that match the viewing context

## Tips

1. **Keep both images the same dimensions** to prevent layout shift
2. **Use SVGs when possible** for crisp rendering at any size
3. **Test both modes** by toggling your system preferences
4. **Provide fallbacks** in the alt text for accessibility

This feature works in READMEs, issues, pull requests, discussions, and anywhere
else GitHub renders markdown.
