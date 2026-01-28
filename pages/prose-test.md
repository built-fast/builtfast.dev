---
layout: page
title: Prose Styling Test
permalink: /prose-test/
---

# Typography & Prose Test Page

This page demonstrates all the prose styling available for content authors. Write plain markdown and everything just works.

## Headings

All six heading levels are styled. Headings h2-h4 get anchor links for deep linking.

### This is an H3 heading

Used for major subsections within a document.

#### This is an H4 heading

Used for minor subsections or feature callouts.

##### This is an H5 heading

Styled as uppercase label text.

###### This is an H6 heading

Also uppercase, slightly smaller.

---

## Paragraphs and Inline Elements

Regular paragraph text uses Inter for optimal readability. The first paragraph after the main title gets slightly larger "lead" styling automatically.

This paragraph demonstrates **bold text** for emphasis, *italic text* for terminology or titles, and `inline code` for technical references like variable names or commands.

You can also use ~~strikethrough~~ for deleted content, and <mark>highlighted text</mark> for calling attention to important phrases.

For keyboard shortcuts, use the kbd element: Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the command palette.

---

## Links

Regular links are styled with the [cyan accent color](/docs/) and get an underline on hover.

External links to [other domains](https://github.com) automatically get a small arrow icon to indicate they open elsewhere.

Links within [the builtfast.com domain](https://builtfast.com/pricing) don't get the external icon.

---

## Lists

### Unordered Lists

Bullet points use cyan dashes instead of dots for a distinctive look:

- First item in the list
- Second item with more text to show how wrapping works when the content is longer than a single line
- Third item
  - Nested item one (uses a dot)
  - Nested item two
    - Even deeper nesting
- Back to top level

### Ordered Lists

Numbered lists use monospace numbers:

1. First step in the process
2. Second step with additional details
3. Third step
   1. Sub-step one (uses letters)
   2. Sub-step two
4. Final step

### Mixed Lists

You can mix list types:

1. First ordered item
   - Unordered child
   - Another unordered child
2. Second ordered item

---

## Code

### Inline Code

Use backticks for inline code like `const foo = "bar"` or command names like `npm install`.

### Code Blocks

Fenced code blocks get the dark editor styling:

```javascript
// JavaScript example
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}
```

```php
<?php
// PHP example
class UserController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }
}
```

```bash
# Shell commands
npm install @builtfast/vector-pro
export VECTOR_API_KEY="your-key-here"
```

---

## Blockquotes

Standard blockquotes with cyan left border:

> This is a blockquote. It's useful for highlighting important information, quotes from documentation, or callouts that need emphasis.

Nested blockquotes switch to orange:

> This is the outer quote.
>
> > This is a nested quote with a different accent color.
>
> Back to the outer quote.

With attribution:

> The best code is no code at all.
>
> <cite>Jeff Atwood</cite>

---

## Callouts

> [!NOTE]
> This is a note callout. Use it for general information or tips.

> [!TIP]
> This is an info/tip callout. Use it for helpful tips and additional context.

> [!WARNING]
> This is a warning callout. Use it to highlight potential issues or things to watch out for.

> [!ERROR]
> This is an error callout. Use it for critical warnings or breaking changes.

> [!SUCCESS]
> This is a success callout. Use it to confirm something worked or highlight best practices.

> [!NOTE] Pro Tip
> Callouts can contain **rich markdown** including:
>
> - Bullet points
> - `inline code`
> - [Links to other pages](/docs/)

---

## Tables

Tables get zebra striping and hover states:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sites` | List all sites |
| POST | `/sites` | Create a new site |
| GET | `/sites/:id` | Get site details |
| DELETE | `/sites/:id` | Delete a site |

Tables with more content:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The site name, must be unique |
| `region` | string | Yes | Deployment region (`us-east-1`, `eu-west-1`) |
| `plan` | string | No | Hosting plan tier, defaults to `starter` |
| `php_version` | string | No | PHP version (`8.1`, `8.2`, `8.3`) |

---

## Images and Figures

Regular markdown images get border and rounded corners:

![Placeholder image](https://via.placeholder.com/800x400/151c24/94a3b8?text=Sample+Image)

Using the figure include for images with captions:

{% include components/figure.html
   src="https://via.placeholder.com/800x400/151c24/1dc9d8?text=Architecture+Diagram"
   alt="System architecture diagram"
   caption="Figure 1: High-level architecture of the Vector Pro platform"
%}

---

## Horizontal Rules

Regular horizontal rules create visual section breaks (see above).

For more prominent breaks, use three centered dots:

<hr class="section-break">

This creates a stronger visual separation between major sections.

---

## Definition Lists

Definition lists are useful for glossaries or option documentation:

API Key
: A unique identifier used to authenticate requests to the Vector Pro API.

Webhook
: An HTTP callback that sends real-time notifications when events occur.

Region
: The geographic location where your site is deployed. Available regions include `us-east-1`, `eu-west-1`, and `ap-southeast-1`.

---

## Badges

Inline badges for status indicators: {% include components/badge.html text="New" type="info" %} {% include components/badge.html text="Beta" type="warning" %} {% include components/badge.html text="Deprecated" type="error" %}

---

## Footnotes

Here's a sentence with a footnote[^1] and another one[^2].

[^1]: This is the first footnote with additional context.
[^2]: This is the second footnote. Footnotes can contain `code` and **formatting**.

---

## Compact Prose Variant

Add the `.prose-compact` class for tighter spacing in sidebars or constrained spaces. This is typically used in layouts rather than content files.

---

## Accessibility Notes

- All headings support anchor links for deep linking
- External links are marked with visual indicators
- Code blocks have sufficient contrast ratios
- Focus states are visible for keyboard navigation
- Tables support horizontal scrolling on mobile
