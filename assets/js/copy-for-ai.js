/**
 * Copy for AI - Copies an AI-friendly representation of an API endpoint
 * Includes documentation index reference, endpoint details, and OpenAPI spec
 */

(function() {
  'use strict';

  /**
   * Assemble the AI-friendly markdown content for an endpoint
   */
  function assembleAIContent(button) {
    const title = button.dataset.endpointTitle || 'Untitled Endpoint';
    const method = button.dataset.endpointMethod || 'GET';
    const uri = button.dataset.endpointUri || '';

    // Find hidden content in the same endpoint section
    const section = button.closest('.endpoint-section');
    const descriptionEl = section?.querySelector('.endpoint-description-text');
    const description = descriptionEl?.textContent?.trim() || '';
    const yamlScript = section?.querySelector('.endpoint-openapi-yaml');
    const openapiYaml = yamlScript?.textContent?.trim() || '';

    // Build the markdown content following Axiom's format
    const lines = [];

    // Documentation index reference
    lines.push('> ## Documentation Index');
    lines.push('> Fetch the complete documentation index at: https://builtfast.dev/docs/llms.txt');
    lines.push('> Use this file to discover all available pages before exploring further.');
    lines.push('');

    // Endpoint title and description
    lines.push(`# ${title}`);
    lines.push('');

    if (description) {
      lines.push(description);
      lines.push('');
    }

    // OpenAPI spec
    if (openapiYaml) {
      lines.push('## OpenAPI');
      lines.push('');
      lines.push(`\`\`\`yaml ${method.toLowerCase()} ${uri}`);
      lines.push(openapiYaml);
      lines.push('```');
    }

    return lines.join('\n');
  }

  /**
   * Initialize copy-for-ai buttons
   */
  function initCopyForAI() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copy-ai]');
      if (!btn) return;

      const content = assembleAIContent(btn);

      // Use the global copyToClipboard function from copy.js
      if (window.copyToClipboard) {
        window.copyToClipboard(content, btn);
      } else {
        // Fallback if copy.js hasn't loaded
        navigator.clipboard.writeText(content).then(() => {
          console.log('Copied for AI');
        }).catch((err) => {
          console.error('Failed to copy:', err);
        });
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyForAI);
  } else {
    initCopyForAI();
  }
})();
