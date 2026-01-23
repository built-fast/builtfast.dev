# frozen_string_literal: true

module Jekyll
  module OrderedDataFilter
    # Sorts a data hash according to configured ordering (Scribe-style).
    #
    # Config in _config.yml:
    #   ordered_data:
    #     vector_pro_endpoints:
    #       key: name           # field to match against (default: name)
    #       order:              # use * for "everything else alphabetically"
    #         - Sites
    #         - Environments
    #         - Deployments
    #         - "*"
    #         - API Keys
    #
    # Usage in Liquid:
    #   {% assign sorted = site.data.vector_pro_endpoints | ordered_data: "vector_pro_endpoints" %}
    #
    def ordered_data(data, config_key)
      return [] if data.nil?

      site_config = @context.registers[:site].config
      ordering = site_config.dig("ordered_data", config_key) || {}

      key_field = ordering["key"] || "name"
      order_list = ordering["order"] || ["*"]

      # Find wildcard position
      wildcard_idx = order_list.index("*")
      if wildcard_idx
        before_wildcard = order_list[0...wildcard_idx]
        after_wildcard = order_list[(wildcard_idx + 1)..]
      else
        before_wildcard = order_list
        after_wildcard = []
      end

      # Convert hash to array of [filename, data] pairs if needed
      items = data.is_a?(Hash) ? data.to_a : data

      # Partition into before, middle, after
      before = []
      after = []
      middle = []

      items.each do |item|
        # item is [filename, data_hash] from Jekyll data files
        item_data = item.is_a?(Array) ? item[1] : item

        # Skip non-hash data (e.g., .filehashes metadata)
        next unless item_data.is_a?(Hash) && item_data[key_field]

        item_key = item_data[key_field].to_s

        if (idx = before_wildcard.index(item_key))
          before[idx] = item
        elsif (idx = after_wildcard.index(item_key))
          after[idx] = item
        else
          middle << item
        end
      end

      # Sort middle alphabetically by key field
      middle.sort_by! do |item|
        item_data = item.is_a?(Array) ? item[1] : item
        item_data[key_field].to_s.downcase
      end

      # Compact to remove nil gaps from sparse array assignment
      before.compact + middle + after.compact
    end
  end
end

Liquid::Template.register_filter(Jekyll::OrderedDataFilter)
