# frozen_string_literal: true

module Scribe
  # Builds the shared "LLM document" for an endpoint: the markdown body that the
  # "Copy for AI" button puts on the clipboard and that the /docs/llms/api/<slug>.txt
  # files publish. Keeping the assembly here means both consumers share one source of
  # truth and cannot drift.
  module LlmDocument
    module_function

    # Assemble the document body from a normalized endpoint hash (see
    # EndpointNormalizer#normalize). Returns title + description + fenced OpenAPI block,
    # mirroring assembleAIContent() in assets/js/copy-for-ai.js (minus the discovery
    # header, which each consumer prepends itself).
    def build(endpoint)
      title = endpoint['title'].to_s.strip
      title = 'Untitled Endpoint' if title.empty?
      description = strip_html(endpoint['description']).strip
      method = endpoint['method'].to_s.downcase
      uri = endpoint['uri_display'].to_s
      openapi_yaml = endpoint['openapi_yaml'].to_s.strip

      lines = ["# #{title}", '']
      unless description.empty?
        lines << description
        lines << ''
      end

      unless openapi_yaml.empty?
        lines << '## OpenAPI'
        lines << ''
        lines << "```yaml #{method} #{uri}"
        lines << openapi_yaml
        lines << '```'
      end

      lines.join("\n").strip
    end

    # Mirror Liquid's `strip_html` filter (used in _includes/api/endpoint.html) so the
    # plaintext description matches what the page renders.
    def strip_html(text)
      text.to_s.gsub(/<script.*?<\/script>/m, '')
          .gsub(/<!--.*?-->/m, '')
          .gsub(/<style.*?<\/style>/m, '')
          .gsub(/<.*?>/m, '')
    end
  end
end
