# frozen_string_literal: true

require 'json'

module Scribe
  class EndpointNormalizer
    def initialize(code_examples, openapi_builder)
      @code_examples = code_examples
      @openapi_builder = openapi_builder
    end

    def normalize(endpoint, group_name)
      metadata = endpoint['metadata'] || {}
      method = endpoint['httpMethods']&.first || 'GET'
      uri = endpoint['uri'] || ''

      url_params = build_parameters(endpoint['urlParameters'])
      query_params = build_parameters(endpoint['queryParameters'])
      body_params = build_parameters(endpoint['bodyParameters'])

      clean_url = normalize_to_hash(endpoint['cleanUrlParameters'])
      clean_query = normalize_to_hash(endpoint['cleanQueryParameters'])
      clean_body = normalize_to_hash(endpoint['cleanBodyParameters'])

      {
        'id' => endpoint_id(group_name, method, uri),
        'title' => endpoint_title(metadata),
        'description' => metadata['description'] || '',
        'method' => method,
        'methods' => endpoint['httpMethods'] || [method],
        'uri' => uri,
        'uri_display' => uri_display(uri),
        'group' => group_name,
        'subgroup' => metadata['subgroup'] || '',
        'authenticated' => metadata['authenticated'] != false,
        'deprecated' => metadata['deprecated'] == true,
        'url_parameters' => url_params,
        'query_parameters' => query_params,
        'body_parameters' => body_params,
        'responses' => build_responses(endpoint['responses']),
        'examples' => @code_examples.build_examples(method, uri, clean_url, clean_query, clean_body),
        '_raw' => endpoint,
        'openapi_yaml' => @openapi_builder.build(endpoint, group_name, method, uri, url_params, query_params, body_params)
      }
    end

    private

    def endpoint_id(group, method, uri)
      clean_uri = uri.sub(%r{^api/v1/vector/}, '').gsub('/', '-')
      base = "#{group}-#{method.downcase}-#{clean_uri}"
      slugify(base)
    end

    def endpoint_title(metadata)
      metadata['title'] || 'Untitled Endpoint'
    end

    def uri_display(uri)
      uri.start_with?('/') ? uri : "/#{uri}"
    end

    def build_parameters(params)
      return [] unless params.is_a?(Hash)

      params.map do |name, param|
        next unless param.is_a?(Hash)

        {
          'name' => param['name'] || name,
          'type' => param['type'] || 'string',
          'required' => param['required'] == true,
          'description' => param['description'] || '',
          'example' => param['example'],
          'enum_values' => param['enumValues'] || [],
          'nullable' => param['nullable'] == true,
          'deprecated' => param['deprecated'] == true
        }
      end.compact
    end

    def build_responses(responses)
      return [] unless responses.is_a?(Array)

      responses.map do |response|
        next unless response.is_a?(Hash)

        status = response['status']
        description = response['description'] || ''
        slug = slugify("#{status}-#{description}")

        {
          'status' => status,
          'description' => description,
          'slug' => slug,
          'content' => pretty_print_json(response['content'])
        }
      end.compact
    end

    def pretty_print_json(content)
      return '' if content.nil? || content.empty?

      parsed = JSON.parse(content)
      JSON.pretty_generate(parsed)
    rescue JSON::ParserError
      content
    end

    def normalize_to_hash(value)
      return {} if value.nil? || value.is_a?(Array)
      return value if value.is_a?(Hash)

      {}
    end

    def slugify(text)
      text.to_s
          .downcase
          .gsub(/[^a-z0-9\s-]/, '')
          .gsub(/\s+/, '-')
          .gsub(/-+/, '-')
          .gsub(/^-|-$/, '')
    end
  end
end
