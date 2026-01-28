/**
 * Table of Contents Component
 *
 * Alpine.js component that auto-generates a TOC from headings in .prose content.
 * Features:
 * - Scroll-spy highlighting
 * - Smooth scroll to sections
 *
 * Usage:
 *   <nav x-data="tocComponent()" data-levels="h2,h3">
 *     <ul x-ref="tocList"></ul>
 *   </nav>
 */
function tocComponent() {
  return {
    headings: [],
    activeId: null,

    init() {
      // Get heading levels from data attribute or use default
      const selector = this.$el.dataset.levels || 'h2,h3';
      const proseEl = document.querySelector('.prose');
      if (!proseEl) return;

      this.headings = Array.from(proseEl.querySelectorAll(selector))
        .filter(h => h.id); // Only headings with IDs

      if (this.headings.length === 0) return;

      // Build TOC list
      this.buildToc();

      // Set up scroll spy
      this.setupScrollSpy();
    },

    buildToc() {
      const list = this.$refs.tocList;
      if (!list) return;

      list.innerHTML = '';

      this.headings.forEach(heading => {
        const li = document.createElement('li');
        li.className = 'toc-item toc-' + heading.tagName.toLowerCase();

        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        a.className = 'toc-link';
        a.dataset.id = heading.id;

        // Smooth scroll on click
        a.addEventListener('click', (e) => {
          e.preventDefault();
          heading.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', '#' + heading.id);
        });

        li.appendChild(a);
        list.appendChild(li);
      });
    },

    setupScrollSpy() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.setActive(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-80px 0px -80% 0px',
          threshold: 0
        }
      );

      this.headings.forEach(heading => observer.observe(heading));
    },

    setActive(id) {
      this.activeId = id;

      // Update active class on links
      const links = this.$refs.tocList.querySelectorAll('.toc-link');
      links.forEach(link => {
        if (link.dataset.id === id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };
}
