# frozen_string_literal: true

# MarkdownCallouts - Jekyll plugin for Obsidian-style callouts/admonitions
#
# Converts markdown callout syntax:
#   > [!NOTE]
#   > This is a note callout.
#
# Into styled HTML matching the existing callout component styles.
#
# Supported types: note, tip, info, warning, caution, error, danger, success, important
#
# Usage in templates:
#   {{ content | calloutify }}           - converts callouts and markdown
#   {{ description | calloutify }}       - works with any markdown string
module MarkdownCallouts
  # SVG icon definitions (Lucide icons as inline SVG)
  ICONS = {
    'bookmark' => '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    'lightbulb' => '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'info' => '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'alert-triangle' => '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'alert-circle' => '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'check-circle' => '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'
  }.freeze

  # Map callout types to CSS class names and icon names
  CALLOUT_CONFIG = {
    'note' => { class: 'note', icon: 'bookmark', title: 'Note' },
    'tip' => { class: 'info', icon: 'lightbulb', title: 'Tip' },
    'info' => { class: 'info', icon: 'info', title: 'Info' },
    'warning' => { class: 'warning', icon: 'alert-triangle', title: 'Warning' },
    'caution' => { class: 'warning', icon: 'alert-triangle', title: 'Caution' },
    'error' => { class: 'error', icon: 'alert-circle', title: 'Error' },
    'danger' => { class: 'error', icon: 'alert-circle', title: 'Danger' },
    'success' => { class: 'success', icon: 'check-circle', title: 'Success' },
    'important' => { class: 'error', icon: 'alert-circle', title: 'Important' }
  }.freeze

  # Generator that processes all pages and documents
  class CalloutConverter < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      @markdown = site.find_converter_instance(Jekyll::Converters::Markdown)
      @converted_count = 0

      process_collections(site)
      process_pages(site)

      if @converted_count.positive?
        Jekyll.logger.info 'Callouts:', "Converted callouts in #{@converted_count} file(s)"
      end
    end

    private

    def process_collections(site)
      site.collections.each_value do |collection|
        collection.docs.each { |doc| process_document(doc) }
      end
    end

    def process_pages(site)
      site.pages.each { |page| process_document(page) }
    end

    def process_document(doc)
      return if doc.content.nil? || doc.content.empty?

      original = doc.content.dup
      doc.content = convert_callouts(doc.content)

      @converted_count += 1 if doc.content != original
    end

    def convert_callouts(content)
      # Protect code blocks from processing
      code_blocks = []
      protected = content.gsub(/```[\s\S]*?```/m) do |match|
        code_blocks << match
        "<<<CODEBLOCK#{code_blocks.length - 1}>>>"
      end

      # Match callout blocks:
      # > [!TYPE] Optional title
      # > Content line 1
      # > Content line 2
      pattern = /^(?<indent>\s*)>\s*\[!(?<type>[A-Z]+)\](?<custom_title>[^\n]*)\n(?<body>(?:\k<indent>>\s*[^\n]*\n?)+)/

      result = protected.gsub(pattern) do
        indent = Regexp.last_match[:indent]
        type = Regexp.last_match[:type].downcase
        custom_title = Regexp.last_match[:custom_title].strip
        body = Regexp.last_match[:body]

        config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG['note']
        title = custom_title.empty? ? config[:title] : custom_title

        # Remove blockquote markers and dedent the body
        body_content = body.lines.map do |line|
          line.sub(/^#{Regexp.escape(indent)}>\s?/, '')
        end.join.strip

        # Convert markdown in body to HTML
        body_html = @markdown.convert(body_content)

        build_callout_html(config[:class], config[:icon], title, body_html)
      end

      # Restore code blocks
      result.gsub(/<<<CODEBLOCK(\d+)>>>/) { code_blocks[Regexp.last_match(1).to_i] }
    end

    def build_callout_html(css_class, icon, title, body_html)
      icon_svg = ICONS[icon] || ICONS['info']
      <<~HTML
        <div class="callout callout-#{css_class}">
          <div class="callout-title">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">#{icon_svg}</svg>
            <span>#{title}</span>
          </div>
          <div class="callout-content">
            #{body_html}
          </div>
        </div>

      HTML
    end
  end

  # Liquid filter for use in templates: {{ content | calloutify }}
  module CalloutFilter
    def calloutify(input)
      return '' if input.nil? || input.empty?

      site = @context.registers[:site]
      markdown = site.find_converter_instance(Jekyll::Converters::Markdown)

      # Normalize collapsed blockquote callouts (newlines may become spaces in some contexts)
      # Convert "> [!TYPE] > line1 > line2" back to multiline format
      normalized = input.dup
      if input.match?(/>\s*\[![A-Z]+\]/) && input.include?(' > ')
        # Replace " > " with newline only after a callout marker appears
        normalized = input.gsub(/(>\s*\[![A-Z]+\].*)/) do |match|
          match.gsub(' > ', "\n> ")
        end
      end

      # Protect code blocks from processing
      code_blocks = []
      protected = normalized.gsub(/```[\s\S]*?```/m) do |match|
        code_blocks << match
        "<<<CODEBLOCK#{code_blocks.length - 1}>>>"
      end

      # Match callout blocks
      pattern = /^(?<indent>\s*)>\s*\[!(?<type>[A-Z]+)\](?<custom_title>[^\n]*)\n(?<body>(?:\k<indent>>\s*[^\n]*\n?)+)/

      result = protected.gsub(pattern) do
        indent = Regexp.last_match[:indent]
        type = Regexp.last_match[:type].downcase
        custom_title = Regexp.last_match[:custom_title].strip
        body = Regexp.last_match[:body]

        config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG['note']
        title = custom_title.empty? ? config[:title] : custom_title

        # Remove blockquote markers and dedent the body
        body_content = body.lines.map do |line|
          line.sub(/^#{Regexp.escape(indent)}>\s?/, '')
        end.join.strip

        body_html = markdown.convert(body_content)
        build_callout_html(config[:class], config[:icon], title, body_html)
      end

      # Restore code blocks
      result = result.gsub(/<<<CODEBLOCK(\d+)>>>/) { code_blocks[Regexp.last_match(1).to_i] }

      # Convert remaining markdown to HTML
      markdown.convert(result)
    end

    private

    def build_callout_html(css_class, icon, title, body_html)
      icon_svg = ICONS[icon] || ICONS['info']
      <<~HTML
        <div class="callout callout-#{css_class}">
          <div class="callout-title">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">#{icon_svg}</svg>
            <span>#{title}</span>
          </div>
          <div class="callout-content">
            #{body_html}
          </div>
        </div>
      HTML
    end
  end
end

Liquid::Template.register_filter(MarkdownCallouts::CalloutFilter)
