/**
 * API Documentation JavaScript
 * Handles scroll-spy, URL hash updates, and search
 */

(function() {
  'use strict';

  let currentEndpoint = null;
  let isScrolling = false;
  let scrollTimeout = null;
  let isInitialLoad = true;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initSearch();
    handleInitialHash();

    // Delay scroll-spy to avoid interfering with page load animations
    setTimeout(() => {
      isInitialLoad = false;
      initScrollSpy();
    }, 2000);
  }

  /**
   * Handle initial URL hash - scroll to endpoint on page load
   */
  function handleInitialHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Small delay to ensure Alpine has initialized
    setTimeout(() => {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setActiveEndpoint(hash);
      }
    }, 100);
  }

  /**
   * Scroll spy - updates sidebar active state and URL hash based on scroll position
   */
  function initScrollSpy() {
    const sections = document.querySelectorAll('[data-scroll-spy]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Don't update during programmatic scrolling
        if (isScrolling) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && id !== currentEndpoint) {
              currentEndpoint = id;
              setActiveEndpoint(id);
              updateUrlHash(id);
            }
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    // Handle manual link clicks - set flag to prevent scroll-spy interference
    document.querySelectorAll('.api-sidebar a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href').slice(1);
        isScrolling = true;
        setActiveEndpoint(hash);

        // Clear scrolling flag after animation completes
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 1000);
      });
    });
  }

  /**
   * Update the active endpoint in Alpine state
   */
  function setActiveEndpoint(id) {
    // Dispatch custom event for Alpine to listen to
    window.dispatchEvent(new CustomEvent('endpoint-change', { detail: { id } }));

    // Also update directly if Alpine data is accessible
    const container = document.querySelector('[x-data]');
    if (container && container._x_dataStack) {
      const data = container._x_dataStack[0];
      if (data && 'activeEndpoint' in data) {
        data.activeEndpoint = id;
      }
    }
  }

  /**
   * Update URL hash without triggering scroll
   */
  function updateUrlHash(id) {
    if (history.replaceState) {
      history.replaceState(null, null, '#' + id);
    }
  }

  /**
   * Search functionality - filters sidebar links
   */
  function initSearch() {
    const searchInput = document.querySelector('.api-search input');
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        filterEndpoints(e.target.value.toLowerCase().trim());
      }, 150);
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        filterEndpoints('');
        searchInput.blur();
      }
    });
  }

  /**
   * Filter sidebar endpoints based on search query
   */
  function filterEndpoints(query) {
    const sidebar = document.querySelector('.api-sidebar nav');
    if (!sidebar) return;

    const groups = sidebar.querySelectorAll('.api-sidebar-group');

    groups.forEach((group) => {
      const header = group.querySelector('.api-sidebar-group-header');
      const links = group.querySelectorAll('.api-sidebar-link');
      const subgroups = group.querySelectorAll('.api-sidebar-subgroup');

      // Skip Introduction and Resources groups (no expandable content)
      if (!header) {
        // For simple links like Introduction
        const link = group.querySelector('.api-sidebar-link');
        if (link) {
          const text = link.textContent.toLowerCase();
          link.closest('.api-sidebar-group').style.display =
            !query || text.includes(query) ? '' : 'none';
        }
        return;
      }

      let hasVisibleLinks = false;

      links.forEach((link) => {
        const text = link.textContent.toLowerCase();
        const matches = !query || text.includes(query);
        link.style.display = matches ? '' : 'none';
        if (matches) hasVisibleLinks = true;
      });

      // Hide subgroup headers if no visible links follow them
      subgroups.forEach((subgroup) => {
        let nextEl = subgroup.nextElementSibling;
        let hasVisibleInSubgroup = false;

        while (nextEl && !nextEl.classList.contains('api-sidebar-subgroup')) {
          if (nextEl.classList.contains('api-sidebar-link') && nextEl.style.display !== 'none') {
            hasVisibleInSubgroup = true;
            break;
          }
          nextEl = nextEl.nextElementSibling;
        }

        subgroup.style.display = hasVisibleInSubgroup ? '' : 'none';
      });

      // Show/hide entire group
      group.style.display = hasVisibleLinks || !query ? '' : 'none';

      // Expand groups with matches when searching
      if (query && hasVisibleLinks && header) {
        const expandable = group.querySelector('[x-collapse]');
        if (expandable && expandable._x_dataStack) {
          // Trigger Alpine to open the group
          const groupData = group._x_dataStack?.[0];
          if (groupData && 'open' in groupData) {
            groupData.open = true;
          }
        }
      }
    });
  }

})();
