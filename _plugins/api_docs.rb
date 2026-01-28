# frozen_string_literal: true

require 'cgi'
require 'json'

module Jekyll
  class ApiDocsGenerator < Generator
    safe true
    priority :low

    def generate(site)
      return unless site.data['vector_pro_endpoints']

      config = site.config['api_docs'] || {}
      order = config['order'] || []
      subgroup_orders = config['subgroups'] || {}

      groups = build_groups(site.data['vector_pro_endpoints'], subgroup_orders)
      sorted_groups = sort_by_order(groups, order)

      site.data['api_groups'] = sorted_groups
    end

    private

    def build_groups(endpoints_data, subgroup_orders)
      groups = {}

      # Sort files by key (filename without extension) for consistent ordering
      sorted_files = endpoints_data.sort_by { |key, _| key }

      sorted_files.each do |_filename, file_data|
        next unless file_data.is_a?(Hash) && file_data['endpoints']

        group_name = file_data['name']
        next unless group_name

        group_desc = file_data['description'] || ''

        if groups[group_name]
          # Group already exists - check for conflicting descriptions
          existing_desc = groups[group_name]['description']
          if group_desc != '' && existing_desc != '' && group_desc != existing_desc
            raise <<~ERROR
              Conflicting group descriptions for "#{group_name}":
                Existing: #{existing_desc.inspect}
                New:      #{group_desc.inspect}
              Fix: Use the same description in all controllers, or leave all but one blank.
            ERROR
          end

          # Use new description if existing was blank
          if existing_desc == '' && group_desc != ''
            groups[group_name]['description'] = group_desc
          end
        else
          groups[group_name] = {
            'name' => group_name,
            'slug' => slugify(group_name),
            'description' => group_desc,
            'subgroups' => {}
          }
        end

        file_data['endpoints'].each do |endpoint|
          subgroup_name = endpoint.dig('metadata', 'subgroup') || ''
          subgroup_slug = slugify(subgroup_name)
          subgroup_desc = endpoint.dig('metadata', 'subgroupDescription') || ''

          if groups[group_name]['subgroups'][subgroup_name]
            # Subgroup already exists - check for conflicting descriptions
            existing_desc = groups[group_name]['subgroups'][subgroup_name]['description']
            if subgroup_desc != '' && existing_desc != '' && subgroup_desc != existing_desc
              raise <<~ERROR
                Conflicting subgroup descriptions for "#{subgroup_name}" in group "#{group_name}":
                  Existing: #{existing_desc.inspect}
                  New:      #{subgroup_desc.inspect}
                Fix: Use the same description in all controllers, or leave all but one blank.
              ERROR
            end

            # Use new description if existing was blank
            if existing_desc == '' && subgroup_desc != ''
              groups[group_name]['subgroups'][subgroup_name]['description'] = subgroup_desc
            end
          else
            groups[group_name]['subgroups'][subgroup_name] = {
              'name' => subgroup_name,
              'slug' => subgroup_slug,
              'description' => subgroup_desc,
              'endpoints' => []
            }
          end

          groups[group_name]['subgroups'][subgroup_name]['endpoints'] << normalize_endpoint(endpoint, group_name)
        end
      end

      # Sort endpoints within each subgroup, then convert subgroups hash to sorted array
      groups.each do |group_name, group|
        group['subgroups'].each_value do |subgroup|
          subgroup['endpoints'] = sort_endpoints(subgroup['endpoints'])
        end

        subgroup_order = subgroup_orders[group_name] || []
        group['subgroups'] = sort_subgroups(group['subgroups'], subgroup_order)
      end

      groups.values
    end

    def sort_subgroups(subgroups_hash, order)
      subgroups = subgroups_hash.values

      if order.empty?
        # Default: empty string first, then alphabetical
        subgroups.sort_by { |sg| [sg['name'].empty? ? 0 : 1, sg['name'].downcase] }
      else
        # Use explicit order with wildcard support
        sort_by_order(subgroups, order, name_key: 'name')
      end
    end

    # Sort endpoints by base URI (grouping related resources) then by HTTP method
    def sort_endpoints(endpoints)
      method_priority = { 'GET' => 0, 'POST' => 1, 'PUT' => 2, 'PATCH' => 3, 'DELETE' => 4 }

      endpoints.sort_by do |endpoint|
        base_uri = normalize_uri_for_sort(endpoint['uri'])
        method_order = method_priority[endpoint['method']] || 99
        [base_uri, method_order]
      end
    end

    # Strip trailing ID parameters from URI for grouping related endpoints
    # e.g., "sites/{site}/waf/rate-limits/{ruleId}" -> "sites/{site}/waf/rate-limits"
    def normalize_uri_for_sort(uri)
      uri.to_s.gsub(/\/\{[^}]+\}$/, '')
    end

    def sort_by_order(items, order, name_key: 'name')
      return items if order.empty?

      wildcard_index = order.index('*')

      items.sort_by do |item|
        name = item[name_key]
        index = order.index(name)
        if index
          # Use array with index and empty string for consistent comparison
          [index, '']
        elsif wildcard_index
          # Items not in order list go where the wildcard is, sorted alphabetically
          [wildcard_index, name.downcase]
        else
          # If no wildcard, put at end alphabetically
          [order.size, name.downcase]
        end
      end
    end

    def normalize_endpoint(endpoint, group_name)
      metadata = endpoint['metadata'] || {}
      method = endpoint['httpMethods']&.first || 'GET'
      uri = endpoint['uri'] || ''

      url_params = build_parameters(endpoint['urlParameters'])
      query_params = build_parameters(endpoint['queryParameters'])
      body_params = build_parameters(endpoint['bodyParameters'])

      # Get clean parameter values for examples
      # Note: YAML uses [] for empty but {} for values, so normalize to hash
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
        'examples' => {
          'curl' => build_curl_example(method, uri, clean_url, clean_query, clean_body),
          'php' => build_php_example(method, uri, clean_url, clean_query, clean_body),
          'js' => build_js_example(method, uri, clean_url, clean_query, clean_body)
        },
        '_raw' => endpoint
      }
    end

    def endpoint_id(group, method, uri)
      # Create a unique, URL-safe ID
      # Strip api/v1/vector prefix and convert slashes to dashes
      clean_uri = uri.sub(%r{^api/v1/vector/}, '').gsub('/', '-')
      base = "#{group}-#{method.downcase}-#{clean_uri}"
      slugify(base)
    end

    def endpoint_title(metadata)
      metadata['title'] || 'Untitled Endpoint'
    end

    def uri_display(uri)
      # Ensure URI starts with /
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

    # =========================================================================
    # Code Example Generators
    # =========================================================================

    BASE_URL = 'https://api.builtfast.com'

    def build_curl_example(method, uri, url_params, query_params, body_params)
      # Build URI with substituted URL parameters
      full_uri = substitute_url_params(uri, url_params)
      url = "#{BASE_URL}/#{full_uri.sub(%r{^/}, '')}"

      # Add query string
      if query_params.any?
        query_string = query_params.map { |k, v| "#{k}=#{CGI.escape(v.to_s)}" }.join('&')
        url = "#{url}?#{query_string}"
      end

      lines = []
      lines << "curl -X #{method} \\"
      lines << "  \"#{url}\" \\"
      lines << '  -H "Authorization: Bearer $API_KEY" \\'
      lines << '  -H "Accept: application/json"'

      if %w[POST PUT PATCH].include?(method)
        # Insert Content-Type before Accept
        lines[-1] = '  -H "Content-Type: application/json" \\'
        lines << '  -H "Accept: application/json"'

        if body_params.any?
          lines[-1] += ' \\'
          lines << "  -d '#{JSON.generate(body_params)}'"
        end
      end

      lines.join("\n")
    end

    def build_php_example(method, uri, url_params, query_params, body_params)
      # Build the method chain based on URI structure
      # e.g., "api/v1/vector/sites/{site}/environments" -> sites()->environments()
      method_chain = build_sdk_method_chain(uri)
      http_method = method.downcase

      lines = []
      lines << '$response = $vectorPro'
      lines << "    ->#{method_chain}"

      args = []

      # URL parameters become method arguments
      url_params.each_value do |value|
        args << quote_value(value)
      end

      # Query params for GET, body params for others
      params_hash = method == 'GET' ? query_params : body_params
      if params_hash.any?
        args << format_php_array(params_hash, 8)
      end

      if args.any?
        lines << "    ->#{http_method}(#{args.join(', ')});"
      else
        lines << "    ->#{http_method}();"
      end

      lines.join("\n")
    end

    def build_js_example(method, uri, url_params, query_params, body_params)
      # Build the method chain
      method_chain = build_sdk_method_chain(uri)
      http_method = method.downcase

      lines = []
      lines << 'const response = await vectorPro'
      lines << "    .#{method_chain}"

      args = []

      # URL parameters become method arguments
      url_params.each_value do |value|
        args << quote_value(value)
      end

      # Query params for GET, body params for others
      params_hash = method == 'GET' ? query_params : body_params
      if params_hash.any?
        args << format_js_object(params_hash, 8)
      end

      if args.any?
        lines << "    .#{http_method}(#{args.join(', ')});"
      else
        lines << "    .#{http_method}();"
      end

      lines.join("\n")
    end

    # Convert URI path to SDK method chain
    # "api/v1/vector/sites/{site}/environments/{env}" -> "sites(site).environments(env)"
    def build_sdk_method_chain(uri)
      # Remove api/v1/vector prefix
      path = uri.sub(%r{^api/v1/vector/}, '')

      # Split into segments
      segments = path.split('/')

      # Build method chain
      chain_parts = []
      i = 0
      while i < segments.length
        segment = segments[i]

        if segment.start_with?('{') && segment.end_with?('}')
          # This is a parameter, it should have been attached to previous method
          i += 1
          next
        end

        # Check if next segment is a parameter
        next_segment = segments[i + 1]
        if next_segment&.start_with?('{') && next_segment&.end_with?('}')
          # Method with parameter placeholder
          chain_parts << camelize(segment)
          i += 2
        else
          # Method without parameter
          chain_parts << camelize(segment)
          i += 1
        end
      end

      chain_parts.join('.')
    end

    def substitute_url_params(uri, url_params)
      result = uri.dup
      url_params.each do |key, value|
        result = result.gsub("{#{key}}", value.to_s)
      end
      result
    end

    def quote_value(value)
      case value
      when String then "'#{value}'"
      when Integer, Float then value.to_s
      when TrueClass, FalseClass then value.to_s
      else "'#{value}'"
      end
    end

    def format_php_array(hash, indent = 0)
      return '[]' if hash.empty?

      pad = ' ' * indent
      inner_pad = ' ' * (indent + 4)

      lines = ["["]
      hash.each do |key, value|
        formatted_value = format_php_value(value, indent + 4)
        lines << "#{inner_pad}'#{key}' => #{formatted_value},"
      end
      lines << "#{pad}]"

      lines.join("\n")
    end

    def format_php_value(value, indent = 0)
      case value
      when String then "'#{value}'"
      when Integer, Float then value.to_s
      when TrueClass then 'true'
      when FalseClass then 'false'
      when NilClass then 'null'
      when Array
        items = value.map { |v| format_php_value(v, indent) }
        "[#{items.join(', ')}]"
      when Hash
        format_php_array(value, indent)
      else
        "'#{value}'"
      end
    end

    def format_js_object(hash, indent = 0)
      return '{}' if hash.empty?

      pad = ' ' * indent
      inner_pad = ' ' * (indent + 4)

      lines = ["{"]
      hash.each do |key, value|
        formatted_value = format_js_value(value, indent + 4)
        # Use unquoted key if valid identifier, otherwise quote
        key_str = key.to_s.match?(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? key : "'#{key}'"
        lines << "#{inner_pad}#{key_str}: #{formatted_value},"
      end
      lines << "#{pad}}"

      lines.join("\n")
    end

    def format_js_value(value, indent = 0)
      case value
      when String then "'#{value}'"
      when Integer, Float then value.to_s
      when TrueClass then 'true'
      when FalseClass then 'false'
      when NilClass then 'null'
      when Array
        items = value.map { |v| format_js_value(v, indent) }
        "[#{items.join(', ')}]"
      when Hash
        format_js_object(value, indent)
      else
        "'#{value}'"
      end
    end

    def camelize(str)
      # Convert snake_case or kebab-case to camelCase
      str.gsub(/[-_]([a-z])/) { ::Regexp.last_match(1).upcase }
    end

    def normalize_to_hash(value)
      return {} if value.nil? || value.is_a?(Array)
      return value if value.is_a?(Hash)

      {}
    end

    # =========================================================================
    # Utility Methods
    # =========================================================================

    def pretty_print_json(content)
      return '' if content.nil? || content.empty?

      # Try to parse and pretty-print JSON
      parsed = JSON.parse(content)
      JSON.pretty_generate(parsed)
    rescue JSON::ParserError
      # If it's not valid JSON, return as-is
      content
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
