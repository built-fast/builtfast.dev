/**
 * Copy to Clipboard Utility
 * Shared copy functionality with tooltip feedback
 */

(function() {
  'use strict';

  /**
   * Copy text to clipboard and show feedback tooltip
   */
  async function copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text.trim());
      showTooltip(button, 'Copied!');
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      showTooltip(button, 'Failed');
      return false;
    }
  }

  /**
   * Show tooltip on button
   */
  function showTooltip(button, message) {
    // Remove any existing tooltip
    const existing = button.querySelector('.copy-tooltip');
    if (existing) existing.remove();

    // Create tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'copy-tooltip';
    tooltip.textContent = message;
    button.appendChild(tooltip);

    // Trigger animation
    requestAnimationFrame(() => {
      tooltip.classList.add('show');
    });

    // Remove tooltip after delay
    setTimeout(() => {
      tooltip.classList.remove('show');
      setTimeout(() => tooltip.remove(), 150);
    }, 1500);
  }

  /**
   * Initialize copy buttons with data-copy attribute
   */
  function initCopyButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (!btn) return;

      // Check for data-copy attribute first
      const copyText = btn.dataset.copy;
      if (copyText) {
        copyToClipboard(copyText, btn);
        return;
      }

      // Otherwise, find the code block content
      const codeBlock = btn.closest('.code-block');
      if (!codeBlock) return;

      // Find the visible pre element
      const allPres = codeBlock.querySelectorAll('.code-block-body pre');
      let visiblePre = null;

      allPres.forEach((pre) => {
        if (pre.offsetParent !== null && !pre.style.display?.includes('none')) {
          visiblePre = pre;
        }
      });

      if (visiblePre) {
        copyToClipboard(visiblePre.textContent, btn);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButtons);
  } else {
    initCopyButtons();
  }

  // Expose for external use
  window.copyToClipboard = copyToClipboard;
})();
