# frozen_string_literal: true

require 'cgi'
require 'erb'
require 'json'

module Scribe
  class CodeExamples
    BASE_URL = 'https://api.builtfast.com'

    # Maps [uri_pattern, http_method] => template_name
    # URI pattern is the path after api/v1/vector/ with placeholders
    TEMPLATE_MAP = {
      # Account
      ['account', 'GET'] => 'account.getSummary',

      # SSH Keys (Account)
      ['ssh-keys', 'GET'] => 'account.sshKeys.list',
      ['ssh-keys', 'POST'] => 'account.sshKeys.create',
      ['ssh-keys/{key}', 'GET'] => 'account.sshKeys.get',
      ['ssh-keys/{key}', 'DELETE'] => 'account.sshKeys.delete',

      # API Keys
      ['api-keys', 'GET'] => 'account.apiKeys.list',
      ['api-keys', 'POST'] => 'account.apiKeys.create',
      ['api-keys/{token}', 'DELETE'] => 'account.apiKeys.delete',

      # Global Secrets
      ['global-secrets', 'GET'] => 'account.secrets.list',
      ['global-secrets', 'POST'] => 'account.secrets.create',
      ['global-secrets/{secret}', 'GET'] => 'account.secrets.get',
      ['global-secrets/{secret}', 'PUT'] => 'account.secrets.update',
      ['global-secrets/{secret}', 'DELETE'] => 'account.secrets.delete',

      # PHP Versions
      ['php-versions', 'GET'] => 'phpVersions.list',

      # Sites
      ['sites', 'GET'] => 'sites.list',
      ['sites', 'POST'] => 'sites.create',
      ['sites/{site}', 'GET'] => 'sites.get',
      ['sites/{site}', 'PUT'] => 'sites.update',
      ['sites/{site}', 'DELETE'] => 'sites.delete',
      ['sites/{site}/clone', 'POST'] => 'sites.clone',
      ['sites/{site}/suspend', 'POST'] => 'sites.suspend',
      ['sites/{site}/unsuspend', 'POST'] => 'sites.unsuspend',
      ['sites/{site}/sftp/reset-password', 'POST'] => 'sites.resetSftpPassword',
      ['sites/{site}/database/reset-password', 'POST'] => 'sites.db.resetPassword',
      ['sites/{site}/logs', 'GET'] => 'sites.getLogs',
      ['sites/{site}/purge-cache', 'POST'] => 'sites.purgeCache',

      # Sites - SSH Keys
      ['sites/{site}/ssh-keys', 'GET'] => 'sites.sshKeys.list',
      ['sites/{site}/ssh-keys', 'POST'] => 'sites.sshKeys.add',
      ['sites/{site}/ssh-keys/{key}', 'DELETE'] => 'sites.sshKeys.remove',

      # Sites - Database
      ['sites/{site}/db/import', 'POST'] => 'sites.db.import',
      ['sites/{site}/db/imports', 'POST'] => 'sites.db.createImportSession',
      ['sites/{site}/db/imports/{import}', 'GET'] => 'sites.db.getImportStatus',
      ['sites/{site}/db/imports/{import}/run', 'POST'] => 'sites.db.runImport',
      ['sites/{site}/db/export', 'POST'] => 'sites.db.createExport',
      ['sites/{site}/db/exports/{export}', 'GET'] => 'sites.db.getExportStatus',

      # Sites - WAF
      ['sites/{site}/waf/allowed-referrers', 'GET'] => 'sites.waf.listAllowedReferrers',
      ['sites/{site}/waf/allowed-referrers', 'POST'] => 'sites.waf.addAllowedReferrer',
      ['sites/{site}/waf/allowed-referrers/{hostname}', 'DELETE'] => 'sites.waf.removeAllowedReferrer',
      ['sites/{site}/waf/blocked-referrers', 'GET'] => 'sites.waf.listBlockedReferrers',
      ['sites/{site}/waf/blocked-referrers', 'POST'] => 'sites.waf.addBlockedReferrer',
      ['sites/{site}/waf/blocked-referrers/{hostname}', 'DELETE'] => 'sites.waf.removeBlockedReferrer',
      ['sites/{site}/waf/blocked-ips', 'GET'] => 'sites.waf.listBlockedIPs',
      ['sites/{site}/waf/blocked-ips', 'POST'] => 'sites.waf.addBlockedIP',
      ['sites/{site}/waf/blocked-ips/{ip}', 'DELETE'] => 'sites.waf.removeBlockedIP',
      ['sites/{site}/waf/rate-limits', 'GET'] => 'sites.waf.listRateLimits',
      ['sites/{site}/waf/rate-limits', 'POST'] => 'sites.waf.createRateLimit',
      ['sites/{site}/waf/rate-limits/{rule}', 'GET'] => 'sites.waf.getRateLimit',
      ['sites/{site}/waf/rate-limits/{rule}', 'PUT'] => 'sites.waf.updateRateLimit',
      ['sites/{site}/waf/rate-limits/{rule}', 'DELETE'] => 'sites.waf.deleteRateLimit',

      # Environments
      ['sites/{site}/environments', 'GET'] => 'environments.list',
      ['sites/{site}/environments', 'POST'] => 'environments.create',
      ['environments', 'GET'] => 'environments.listAll',
      ['environments/{env}', 'GET'] => 'environments.get',
      ['environments/{env}', 'PUT'] => 'environments.update',
      ['environments/{env}', 'DELETE'] => 'environments.delete',
      ['environments/{env}/database/reset-password', 'POST'] => 'environments.resetDatabasePassword',

      # Environments - SSL
      ['environments/{env}/ssl', 'GET'] => 'sites.ssl.getStatus',
      ['environments/{env}/ssl/nudge', 'POST'] => 'sites.ssl.nudge',

      # Environments - Secrets
      ['environments/{env}/secrets', 'GET'] => 'environments.secrets.list',
      ['environments/{env}/secrets', 'POST'] => 'environments.secrets.create',
      ['secrets/{secret}', 'GET'] => 'environments.secrets.get',
      ['secrets/{secret}', 'PUT'] => 'environments.secrets.update',
      ['secrets/{secret}', 'DELETE'] => 'environments.secrets.delete',

      # Environments - Deployments
      ['environments/{env}/deployments', 'GET'] => 'environments.deployments.list',
      ['environments/{env}/deployments', 'POST'] => 'environments.deployments.create',
      ['deployments/{deployment}', 'GET'] => 'environments.deployments.get',
      ['environments/{env}/rollback', 'POST'] => 'environments.deployments.rollback',

      # Webhooks
      ['webhooks', 'GET'] => 'webhooks.list',
      ['webhooks', 'POST'] => 'webhooks.create',
      ['webhooks/{webhook}', 'GET'] => 'webhooks.get',
      ['webhooks/{webhook}', 'PUT'] => 'webhooks.update',
      ['webhooks/{webhook}', 'DELETE'] => 'webhooks.delete',
      ['webhooks/{webhook}/logs', 'GET'] => 'webhooks.listLogs',
      ['webhooks/{webhook}/rotate-secret', 'POST'] => 'webhooks.rotateSecret',

      # Events
      ['events', 'GET'] => 'events.list'
    }.freeze

    def initialize(site_source)
      @site_source = site_source
      @templates_dir = File.join(site_source, '_plugins', 'scribe', 'templates')
      @template_cache = {}
    end

    def build_examples(method, uri, url_params, query_params, body_params)
      {
        'curl' => build_curl_example(method, uri, url_params, query_params, body_params),
        'php' => build_php_example(method, uri, url_params, query_params, body_params),
        'js' => build_js_example(method, uri, url_params, query_params, body_params)
      }
    end

    private

    def template_name_for(uri, method)
      pattern = uri.sub(%r{^api/v1/vector/}, '')
      TEMPLATE_MAP[[pattern, method]]
    end

    def load_template(lang, name)
      cache_key = "#{lang}/#{name}"
      return @template_cache[cache_key] if @template_cache.key?(cache_key)

      file_path = File.join(@templates_dir, lang, "#{name}.#{lang}.erb")
      if File.exist?(file_path)
        @template_cache[cache_key] = ERB.new(File.read(file_path), trim_mode: '-')
      else
        @template_cache[cache_key] = nil
      end
    end

    def render_template(lang, name, binding_context)
      template = load_template(lang, name)
      return nil unless template

      template.result(binding_context)
    end

    # =========================================================================
    # cURL Examples
    # =========================================================================

    def build_curl_example(method, uri, url_params, query_params, body_params)
      full_uri = substitute_url_params(uri, url_params)
      url = "#{BASE_URL}/#{full_uri.sub(%r{^/}, '')}"

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
        lines[-1] = '  -H "Content-Type: application/json" \\'
        lines << '  -H "Accept: application/json"'

        if body_params.any?
          lines[-1] += ' \\'
          lines << "  -d '#{JSON.generate(body_params)}'"
        end
      end

      lines.join("\n")
    end

    # =========================================================================
    # PHP Examples
    # =========================================================================

    def build_php_example(method, uri, url_params, query_params, body_params)
      template_name = template_name_for(uri, method)

      if template_name
        ctx = TemplateContext.new(method, uri, url_params, query_params, body_params)
        result = render_template('php', template_name, ctx.get_binding)
        return result if result
      end

      # Fallback to auto-generated example
      build_php_example_fallback(method, uri, url_params, query_params, body_params)
    end

    def build_php_example_fallback(method, uri, url_params, query_params, body_params)
      method_chain = build_sdk_method_chain(uri)
      http_method = method.downcase

      lines = []
      lines << '$response = $vectorPro'
      lines << "    ->#{method_chain}"

      args = []

      url_params.each_value do |value|
        args << quote_value(value)
      end

      params_hash = method == 'GET' ? query_params : body_params
      args << format_php_array(params_hash, 8) if params_hash.any?

      if args.any?
        lines << "    ->#{http_method}(#{args.join(', ')});"
      else
        lines << "    ->#{http_method}();"
      end

      lines.join("\n")
    end

    # =========================================================================
    # JavaScript Examples
    # =========================================================================

    def build_js_example(method, uri, url_params, query_params, body_params)
      template_name = template_name_for(uri, method)

      if template_name
        ctx = TemplateContext.new(method, uri, url_params, query_params, body_params)
        result = render_template('js', template_name, ctx.get_binding)
        return result if result
      end

      # Fallback to auto-generated example
      build_js_example_fallback(method, uri, url_params, query_params, body_params)
    end

    def build_js_example_fallback(method, uri, url_params, query_params, body_params)
      method_chain = build_sdk_method_chain(uri)
      http_method = method.downcase

      lines = []
      lines << 'const response = await vectorPro'
      lines << "    .#{method_chain}"

      args = []

      url_params.each_value do |value|
        args << quote_value(value)
      end

      params_hash = method == 'GET' ? query_params : body_params
      args << format_js_object(params_hash, 8) if params_hash.any?

      if args.any?
        lines << "    .#{http_method}(#{args.join(', ')});"
      else
        lines << "    .#{http_method}();"
      end

      lines.join("\n")
    end

    # =========================================================================
    # Utility Methods
    # =========================================================================

    def build_sdk_method_chain(uri)
      path = uri.sub(%r{^api/v1/vector/}, '')
      segments = path.split('/')

      chain_parts = []
      i = 0
      while i < segments.length
        segment = segments[i]

        if segment.start_with?('{') && segment.end_with?('}')
          i += 1
          next
        end

        chain_parts << camelize(segment)
        next_segment = segments[i + 1]
        i += next_segment&.start_with?('{') && next_segment&.end_with?('}') ? 2 : 1
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

      lines = ['[']
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

      lines = ['{']
      hash.each do |key, value|
        formatted_value = format_js_value(value, indent + 4)
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
      str.gsub(/[-_]([a-z])/) { ::Regexp.last_match(1).upcase }
    end
  end

  # Template context for ERB templates
  class TemplateContext
    attr_reader :method, :uri, :url_params, :query_params, :body_params

    def initialize(method, uri, url_params, query_params, body_params)
      @method = method
      @uri = uri
      @url_params = url_params
      @query_params = query_params
      @body_params = body_params
    end

    def get_binding
      binding
    end

    # Helper: Quote a string value for PHP/JS
    def quote(value)
      "'#{value}'"
    end

    # Helper: Format a hash as a PHP array
    def php_array(hash, indent = 0)
      return '[]' if hash.nil? || hash.empty?

      pad = ' ' * indent
      inner_pad = ' ' * (indent + 4)

      lines = ['[']
      hash.each do |key, value|
        formatted_value = php_value(value, indent + 4)
        lines << "#{inner_pad}'#{key}' => #{formatted_value},"
      end
      lines << "#{pad}]"

      lines.join("\n")
    end

    def php_value(value, indent = 0)
      case value
      when String then "'#{value}'"
      when Integer, Float then value.to_s
      when TrueClass then 'true'
      when FalseClass then 'false'
      when NilClass then 'null'
      when Array
        items = value.map { |v| php_value(v, indent) }
        "[#{items.join(', ')}]"
      when Hash
        php_array(value, indent)
      else
        "'#{value}'"
      end
    end

    # Helper: Format a hash as a JS object
    def js_object(hash, indent = 0)
      return '{}' if hash.nil? || hash.empty?

      pad = ' ' * indent
      inner_pad = ' ' * (indent + 4)

      lines = ['{']
      hash.each do |key, value|
        formatted_value = js_value(value, indent + 4)
        key_str = key.to_s.match?(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? key : "'#{key}'"
        lines << "#{inner_pad}#{key_str}: #{formatted_value},"
      end
      lines << "#{pad}}"

      lines.join("\n")
    end

    def js_value(value, indent = 0)
      case value
      when String then "'#{value}'"
      when Integer, Float then value.to_s
      when TrueClass then 'true'
      when FalseClass then 'false'
      when NilClass then 'null'
      when Array
        items = value.map { |v| js_value(v, indent) }
        "[#{items.join(', ')}]"
      when Hash
        js_object(value, indent)
      else
        "'#{value}'"
      end
    end

    # Helper: Return params if not empty, otherwise empty string
    def params_if_any(params)
      return '' if params.nil? || params.empty?

      php_array(params)
    end

    # Helper: Get first URL param value (for single-param endpoints)
    def first_url_param
      url_params.values.first
    end

    # Helper: Check if there are body params
    def has_body_params?
      !body_params.nil? && !body_params.empty?
    end

    # Helper: Check if there are query params
    def has_query_params?
      !query_params.nil? && !query_params.empty?
    end
  end
end
