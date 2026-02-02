# frozen_string_literal: true

require_relative 'endpoint_normalizer'
require_relative 'code_examples'
require_relative 'openapi_builder'

module Scribe
  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      return unless site.data['vector_pro_endpoints']

      config = site.config['api_docs'] || {}
      order = config['order'] || []
      subgroup_orders = config['subgroups'] || {}

      @code_examples = CodeExamples.new(site.source)
      @openapi_builder = OpenApiBuilder.new
      @normalizer = EndpointNormalizer.new(@code_examples, @openapi_builder)

      groups = build_groups(site.data['vector_pro_endpoints'], subgroup_orders)
      sorted_groups = sort_by_order(groups, order)

      site.data['api_groups'] = sorted_groups
    end

    private

    def build_groups(endpoints_data, subgroup_orders)
      groups = {}

      sorted_files = endpoints_data.sort_by { |key, _| key }

      sorted_files.each do |_filename, file_data|
        next unless file_data.is_a?(Hash) && file_data['endpoints']

        group_name = file_data['name']
        next unless group_name

        group_desc = file_data['description'] || ''

        if groups[group_name]
          existing_desc = groups[group_name]['description']
          if group_desc != '' && existing_desc != '' && group_desc != existing_desc
            raise <<~ERROR
              Conflicting group descriptions for "#{group_name}":
                Existing: #{existing_desc.inspect}
                New:      #{group_desc.inspect}
              Fix: Use the same description in all controllers, or leave all but one blank.
            ERROR
          end

          groups[group_name]['description'] = group_desc if existing_desc == '' && group_desc != ''
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
            existing_desc = groups[group_name]['subgroups'][subgroup_name]['description']
            if subgroup_desc != '' && existing_desc != '' && subgroup_desc != existing_desc
              raise <<~ERROR
                Conflicting subgroup descriptions for "#{subgroup_name}" in group "#{group_name}":
                  Existing: #{existing_desc.inspect}
                  New:      #{subgroup_desc.inspect}
                Fix: Use the same description in all controllers, or leave all but one blank.
              ERROR
            end

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

          groups[group_name]['subgroups'][subgroup_name]['endpoints'] << @normalizer.normalize(endpoint, group_name)
        end
      end

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
        subgroups.sort_by { |sg| [sg['name'].empty? ? 0 : 1, sg['name'].downcase] }
      else
        sort_by_order(subgroups, order, name_key: 'name')
      end
    end

    def sort_endpoints(endpoints)
      method_priority = { 'GET' => 0, 'POST' => 1, 'PUT' => 2, 'PATCH' => 3, 'DELETE' => 4 }

      endpoints.sort_by do |endpoint|
        base_uri = normalize_uri_for_sort(endpoint['uri'])
        method_order = method_priority[endpoint['method']] || 99
        [base_uri, method_order]
      end
    end

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
          [index, '']
        elsif wildcard_index
          [wildcard_index, name.downcase]
        else
          [order.size, name.downcase]
        end
      end
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
