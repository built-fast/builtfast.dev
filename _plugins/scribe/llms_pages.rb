# frozen_string_literal: true

module Scribe
  # A plaintext page published per API endpoint at /docs/llms/api/<slug>.txt so agents
  # and LLMs can fetch a single endpoint's spec instead of copy/pasting from /api/.
  # Content is pre-rendered (shared with the "Copy for AI" button); Liquid rendering is
  # disabled so OpenAPI YAML containing {{ or {% is never interpreted.
  class LlmsApiPage < Jekyll::PageWithoutAFile
    def initialize(site, slug, content)
      super(site, site.source, 'docs/llms/api', "#{slug}.txt")
      self.content = content
      data['layout'] = nil
      data['permalink'] = "/docs/llms/api/#{slug}.txt"
      data['sitemap'] = false
      data['render_with_liquid'] = false
    end

    def render_with_liquid?
      false
    end
  end

  # Emits the per-endpoint .txt pages. Runs after Scribe::Generator (priority :low) has
  # populated site.data['api_groups'].
  class LlmsPagesGenerator < Jekyll::Generator
    safe true
    priority :lowest

    HEADER_TEMPLATE = <<~HEADER
      > Source: https://builtfast.dev/api/#%<id>s
      > API Base URL: https://api.builtfast.com
      > Full API index: https://builtfast.dev/docs/llms/api/index.txt
    HEADER

    def generate(site)
      groups = site.data['api_groups']
      return unless groups

      groups.each do |group|
        group['subgroups'].each do |subgroup|
          subgroup['endpoints'].each do |endpoint|
            site.pages << LlmsApiPage.new(site, endpoint['id'], file_body(endpoint))
          end
        end
      end
    end

    private

    def file_body(endpoint)
      header = format(HEADER_TEMPLATE, id: endpoint['id'])
      "#{header}\n#{endpoint['llm_document']}\n"
    end
  end
end
