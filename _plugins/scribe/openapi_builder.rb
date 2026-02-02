# frozen_string_literal: true

module Scribe
  class OpenApiBuilder
    def build(endpoint, group_name, method, uri, url_params, query_params, body_params)
      metadata = endpoint['metadata'] || {}
      title = metadata['title'] || 'Untitled Endpoint'
      description = metadata['description'] || ''
      uri_display = uri.start_with?('/') ? uri : "/#{uri}"

      yaml_lines = []
      yaml_lines << 'openapi: 3.1.0'
      yaml_lines << 'info:'
      yaml_lines << "  title: #{yaml_escape(title)}"
      yaml_lines << '  version: 1.0.0'
      yaml_lines << 'paths:'
      yaml_lines << "  #{uri_display}:"
      yaml_lines << "    #{method.downcase}:"
      yaml_lines << "      summary: #{yaml_escape(title)}"
      yaml_lines << "      description: #{yaml_escape(strip_html(description))}" if description != ''
      yaml_lines << '      tags:'
      yaml_lines << "        - #{yaml_escape(group_name)}"

      parameters = build_parameters(url_params, query_params)
      if parameters.any?
        yaml_lines << '      parameters:'
        parameters.each { |param| yaml_lines << param }
      end

      if %w[POST PUT PATCH].include?(method) && body_params.any?
        yaml_lines << '      requestBody:'
        yaml_lines << '        required: true'
        yaml_lines << '        content:'
        yaml_lines << '          application/json:'
        yaml_lines << '            schema:'
        yaml_lines << '              type: object'
        yaml_lines << '              properties:'
        body_params.each do |param|
          yaml_lines.concat(build_property(param, 16))
        end
        required_params = body_params.select { |p| p['required'] }.map { |p| p['name'] }
        if required_params.any?
          yaml_lines << '              required:'
          required_params.each { |name| yaml_lines << "                - #{name}" }
        end
      end

      yaml_lines << '      responses:'
      responses = endpoint['responses'] || []
      if responses.any?
        responses.each do |response|
          status = response['status'].to_s
          desc = response['description'] || 'Response'
          yaml_lines << "        '#{status}':"
          yaml_lines << "          description: #{yaml_escape(desc)}"
        end
      else
        yaml_lines << "        '200':"
        yaml_lines << '          description: Success'
      end

      yaml_lines.join("\n")
    end

    private

    def build_parameters(url_params, query_params)
      lines = []

      url_params.each do |param|
        lines << "        - name: #{param['name']}"
        lines << '          in: path'
        lines << '          required: true'
        lines << '          schema:'
        lines << "            type: #{openapi_type(param['type'])}"
        if param['description'] && param['description'] != ''
          lines << "          description: #{yaml_escape(param['description'])}"
        end
      end

      query_params.each do |param|
        lines << "        - name: #{param['name']}"
        lines << '          in: query'
        lines << "          required: #{param['required']}"
        lines << '          schema:'
        lines << "            type: #{openapi_type(param['type'])}"
        if param['enum_values'] && param['enum_values'].any?
          lines << '            enum:'
          param['enum_values'].each { |v| lines << "              - #{yaml_escape(v)}" }
        end
        if param['description'] && param['description'] != ''
          lines << "          description: #{yaml_escape(param['description'])}"
        end
      end

      lines
    end

    def build_property(param, indent)
      pad = ' ' * indent
      lines = []
      lines << "#{pad}#{param['name']}:"
      lines << "#{pad}  type: #{openapi_type(param['type'])}"
      if param['description'] && param['description'] != ''
        lines << "#{pad}  description: #{yaml_escape(param['description'])}"
      end
      if param['enum_values'] && param['enum_values'].any?
        lines << "#{pad}  enum:"
        param['enum_values'].each { |v| lines << "#{pad}    - #{yaml_escape(v)}" }
      end
      lines << "#{pad}  nullable: true" if param['nullable']
      lines << "#{pad}  deprecated: true" if param['deprecated']
      lines
    end

    def openapi_type(type)
      case type.to_s.downcase
      when 'integer', 'int' then 'integer'
      when 'number', 'float', 'double' then 'number'
      when 'boolean', 'bool' then 'boolean'
      when 'array' then 'array'
      when 'object' then 'object'
      else 'string'
      end
    end

    def yaml_escape(text)
      return '""' if text.nil? || text.empty?

      text = text.to_s.gsub("\n", ' ').gsub("\r", '').strip
      if text.match?(/[:#\[\]{}|>&*!?'"]/) || text.start_with?('-', '@', '`')
        "\"#{text.gsub('"', '\\"')}\""
      else
        text
      end
    end

    def strip_html(text)
      return '' if text.nil?

      text.to_s.gsub(/<[^>]+>/, '').strip
    end
  end
end
