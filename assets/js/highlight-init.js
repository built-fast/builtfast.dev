/**
 * Highlight.js Initialization
 *
 * Applies syntax highlighting to code blocks in:
 * - Blog posts, docs, OSS pages (Rouge-generated blocks in .prose)
 * - API documentation code examples
 */

(function() {
  'use strict';

  // Language mapping for Rouge class names to highlight.js
  const langMap = {
    'shell': 'bash',
    'sh': 'bash',
    'zsh': 'bash',
    'console': 'bash',
    'terminal': 'bash'
  };

  function highlightCodeBlocks() {
    if (typeof hljs === 'undefined') return;

    // Rouge-generated blocks in prose content (blog, docs, oss, changelog)
    const rougeBlocks = document.querySelectorAll('.prose div.highlighter-rouge, .api-prose div.highlighter-rouge');

    rougeBlocks.forEach(block => {
      const codeEl = block.querySelector('pre code');
      if (!codeEl || codeEl.dataset.highlighted) return;

      // Extract language from parent div class
      const langClass = Array.from(block.classList).find(c => c.startsWith('language-'));
      let lang = langClass ? langClass.replace('language-', '') : null;

      // Map language aliases
      if (lang && langMap[lang]) {
        lang = langMap[lang];
      }

      // Clear existing Rouge highlighting spans and get raw text
      const rawCode = codeEl.textContent;
      codeEl.textContent = rawCode;

      // Set language class for highlight.js
      if (lang) {
        codeEl.className = `language-${lang}`;
      }

      // Apply highlight.js
      hljs.highlightElement(codeEl);
    });

    // API documentation code blocks
    const apiBlocks = document.querySelectorAll('.code-block-body pre');

    apiBlocks.forEach(pre => {
      if (pre.dataset.highlighted) return;

      // Determine language from Alpine x-show attribute
      const xShow = pre.getAttribute('x-show') || '';
      let lang = null;

      if (xShow.includes('curl')) {
        lang = 'bash';
      } else if (xShow.includes('php')) {
        lang = 'php';
      } else if (xShow.includes('js')) {
        lang = 'javascript';
      }

      // Wrap content in code element if not already
      let codeEl = pre.querySelector('code');
      if (!codeEl) {
        codeEl = document.createElement('code');
        codeEl.textContent = pre.textContent;
        pre.textContent = '';
        pre.appendChild(codeEl);
      }

      if (lang) {
        codeEl.className = `language-${lang}`;
      }

      hljs.highlightElement(codeEl);
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightCodeBlocks);
  } else {
    highlightCodeBlocks();
  }

  // Support Turbo navigation
  document.addEventListener('turbo:load', highlightCodeBlocks);
})();
