/**
 * Code Block Enhancement
 *
 * Enhances Rouge-generated code blocks with:
 * - Language label header
 * - Copy to clipboard button (uses shared copy.js utility)
 */

(function() {
  'use strict';

  // SVG icon for copy button
  const copyIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

  // Language display names (optional prettification)
  const langNames = {
    'js': 'javascript',
    'ts': 'typescript',
    'rb': 'ruby',
    'py': 'python',
    'sh': 'shell',
    'yml': 'yaml',
    'md': 'markdown'
  };

  function enhanceCodeBlocks() {
    // Find all Rouge code blocks (in prose and api-prose)
    const codeBlocks = document.querySelectorAll('.prose div.highlighter-rouge, .api-prose div.highlighter-rouge');

    codeBlocks.forEach(block => {
      // Skip if already enhanced
      if (block.querySelector('.code-header')) return;

      // Extract language from class (e.g., "language-javascript" -> "javascript")
      const langClass = Array.from(block.classList).find(c => c.startsWith('language-'));
      let lang = langClass ? langClass.replace('language-', '') : '';

      // Prettify language name
      lang = langNames[lang] || lang;

      // Get the code element for copying
      const codeEl = block.querySelector('code');
      if (!codeEl) return;

      // Create header
      const header = document.createElement('div');
      header.className = 'code-header';

      // Language label
      const langLabel = document.createElement('span');
      langLabel.className = 'code-lang';
      langLabel.textContent = lang || 'code';

      // Copy button - uses shared copy.js via data-copy attribute
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.setAttribute('aria-label', 'Copy code');
      copyBtn.setAttribute('data-copy', codeEl.textContent);
      copyBtn.innerHTML = copyIcon;

      // Assemble header
      header.appendChild(langLabel);
      header.appendChild(copyBtn);

      // Insert header at the beginning of the block
      block.insertBefore(header, block.firstChild);
    });

  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);
  } else {
    enhanceCodeBlocks();
  }

  // Also run after Turbo navigation (if using Turbo)
  document.addEventListener('turbo:load', enhanceCodeBlocks);
})();
