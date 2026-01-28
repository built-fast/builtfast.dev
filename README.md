<p align="center">
    <img alt="BuiltFast Logo Light Mode" src="/assets/images/logo-light-mode.svg#gh-light-mode-only"/>
    <img alt="BuiltFast Logo Dark Mode" src="/assets/images/logo-dark-mode.svg#gh-dark-mode-only"/>
</p>

# BuiltFast Developers Portal

Documentation hub, API reference, blog, and open source showcase for [BuiltFast](https://builtfast.dev).

## Tech Stack

- **Jekyll 4.4** - Static site generator
- **Tailwind CSS 4** - Styling
- **Alpine.js** - Interactivity
- **GitHub Pages** - Hosting

## Development

**Prerequisites:** Ruby 3.4+, Node.js, Bundler

```bash
# Install dependencies
bundle install
npm install && npm run setup

# Start dev server (http://localhost:4000)
bundle exec jekyll serve
```

## Project Structure

```
_posts/          # Blog articles
_docs/           # Documentation pages
_oss/            # Open source project pages
_data/           # API endpoint definitions (YAML)
_plugins/        # Custom Jekyll plugins
_layouts/        # Page templates
_includes/       # Reusable components
assets/          # CSS, JS, images
api/             # API reference page + OpenAPI spec
```

## Custom Plugins

- **api_docs.rb** - Generates API documentation from YAML definitions in `_data/vector_pro_endpoints/`
- **markdown_callouts.rb** - Obsidian-style callout syntax (`> [!NOTE]`, `> [!WARNING]`, etc.)

## Licenses

- **Code:** MIT License
- **Content:** CC BY-SA 4.0
