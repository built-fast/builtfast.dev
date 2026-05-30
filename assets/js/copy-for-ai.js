/**
 * Copy for AI - Copies an AI-friendly representation of an API endpoint
 * Includes documentation index reference, endpoint details, and OpenAPI spec
 */

(function() {
  'use strict';

  /**
   * Assemble the AI-friendly markdown content for an endpoint.
   * The endpoint body is pre-rendered at build time and shared with the
   * /docs/llms/api/<slug>.txt files (see _plugins/scribe/llm_document.rb); here we
   * just prepend the documentation-index discovery header.
   */
  function assembleAIContent(button) {
    const section = button.closest('.endpoint-section');
    const documentEl = section?.querySelector('.endpoint-llm-document');
    const document = documentEl?.textContent?.trim() || '';

    const lines = [];

    // Documentation index reference
    lines.push('> ## Documentation Index');
    lines.push('> Fetch the complete documentation index at: https://builtfast.dev/docs/llms.txt');
    lines.push('> Use this file to discover all available pages before exploring further.');
    lines.push('');

    lines.push(document);

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
