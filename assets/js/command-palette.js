/**
 * Command Palette
 * Power-user navigation with Cmd+K and vim-style g-prefix shortcuts
 */

document.addEventListener('alpine:init', () => {
  // Command definitions
  const commands = [
    // Navigation - with g-prefix shortcuts
    { id: 'home', title: 'Home', url: '/', shortcut: 'gh', category: 'Navigation', keywords: ['index', 'main'] },
    { id: 'docs', title: 'Documentation', url: '/docs/', shortcut: 'gd', category: 'Navigation', keywords: ['guides', 'help'] },
    { id: 'api', title: 'API Reference', url: '/api/', shortcut: 'ga', category: 'Navigation', keywords: ['endpoints', 'rest'] },
    { id: 'blog', title: 'Blog', url: '/blog/', shortcut: 'gb', category: 'Navigation', keywords: ['posts', 'articles', 'news'] },
    { id: 'oss', title: 'Open Source', url: '/oss/', shortcut: 'go', category: 'Navigation', keywords: ['projects', 'github'] },
    { id: 'team', title: 'Team', url: '/team/', shortcut: 'gt', category: 'Navigation', keywords: ['about', 'people', 'us'] },
    { id: 'contact', title: 'Contact', url: '/contact/', shortcut: 'gc', category: 'Navigation', keywords: ['support', 'email', 'help'] },
    { id: 'security', title: 'Security', url: '/security/', shortcut: 'gs', category: 'Navigation', keywords: ['vulnerabilities', 'disclosure'] },

    // API Endpoints
    { id: 'api-account', title: 'Account API', url: '/api/#account', category: 'API Endpoints', keywords: ['api', 'user', 'profile', 'keys'] },
    { id: 'api-sites', title: 'Sites API', url: '/api/#sites', category: 'API Endpoints', keywords: ['api', 'endpoints', 'create', 'list'] },
    { id: 'api-environments', title: 'Environments API', url: '/api/#environments', category: 'API Endpoints', keywords: ['api', 'staging', 'production', 'deploy'] },
    { id: 'api-events', title: 'Events API', url: '/api/#events', category: 'API Endpoints', keywords: ['api', 'logs', 'activity', 'audit'] },
    { id: 'api-webhooks', title: 'Webhooks API', url: '/api/#webhooks', category: 'API Endpoints', keywords: ['api', 'callbacks', 'notifications'] },
    { id: 'api-php', title: 'PHP Versions API', url: '/api/#php-versions', category: 'API Endpoints', keywords: ['api', 'runtime', 'version'] },

    // Resources
    { id: 'openapi', title: 'OpenAPI Spec', url: '/api/openapi/', category: 'Resources', keywords: ['swagger', 'spec', 'schema'] },
    { id: 'postman', title: 'Postman Collection', url: '/api/postman/', category: 'Resources', keywords: ['api', 'testing'] },

    // Actions
    { id: 'theme-dark', title: 'Switch to Dark Mode', action: 'theme:dark', category: 'Actions', keywords: ['theme', 'appearance'] },
    { id: 'theme-light', title: 'Switch to Light Mode', action: 'theme:light', category: 'Actions', keywords: ['theme', 'appearance'] },
    { id: 'shortcuts', title: 'Keyboard Shortcuts', action: 'shortcuts', shortcut: 'g?', category: 'Actions', keywords: ['help', 'keys', 'bindings'] },
  ];

  // G-prefix shortcut map
  const gPrefixMap = {
    'h': 'home',
    'd': 'docs',
    'a': 'api',
    'b': 'blog',
    'o': 'oss',
    't': 'team',
    'c': 'contact',
    's': 'security',
    '?': 'shortcuts',
  };

  // Command Palette Store
  Alpine.store('commandPalette', {
    open: false,
    query: '',
    selectedId: null,
    gPrefixActive: false,
    gPrefixTimeout: null,
    shortcutsOpen: false,
    _cachedQuery: null,
    _cachedFiltered: null,

    getFilteredCommands() {
      if (this._cachedQuery === this.query) {
        return this._cachedFiltered;
      }

      let filtered;
      if (!this.query) {
        filtered = commands;
      } else {
        const q = this.query.toLowerCase();
        filtered = commands.filter(cmd => {
          if (cmd.title.toLowerCase().includes(q)) return true;
          if (cmd.keywords?.some(k => k.toLowerCase().includes(q))) return true;
          return false;
        });
      }

      this._cachedQuery = this.query;
      this._cachedFiltered = filtered;
      return filtered;
    },

    getSelectedIndex() {
      const filtered = this.getFilteredCommands();
      const idx = filtered.findIndex(cmd => cmd.id === this.selectedId);
      return idx >= 0 ? idx : 0;
    },

    selectFirst() {
      const filtered = this.getFilteredCommands();
      this.selectedId = filtered.length > 0 ? filtered[0].id : null;
    },

    getGroupedCommands() {
      const filtered = this.getFilteredCommands();
      const groups = {};
      filtered.forEach(cmd => {
        if (!groups[cmd.category]) {
          groups[cmd.category] = [];
        }
        groups[cmd.category].push(cmd);
      });
      return groups;
    },

    toggle() {
      this.open = !this.open;
      if (this.open) {
        this.query = '';
        this.selectFirst();
      }
    },

    show() {
      this.open = true;
      this.query = '';
      this.selectFirst();
    },

    hide() {
      document.activeElement?.blur();
      this.open = false;
      this.query = '';
    },

    selectNext() {
      const filtered = this.getFilteredCommands();
      const currentIdx = this.getSelectedIndex();
      const nextIdx = currentIdx >= filtered.length - 1 ? 0 : currentIdx + 1;
      this.selectedId = filtered[nextIdx]?.id;
      this.scrollToSelected();
    },

    selectPrev() {
      const filtered = this.getFilteredCommands();
      const currentIdx = this.getSelectedIndex();
      const prevIdx = currentIdx <= 0 ? filtered.length - 1 : currentIdx - 1;
      this.selectedId = filtered[prevIdx]?.id;
      this.scrollToSelected();
    },

    scrollToSelected() {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-cmd-id="${this.selectedId}"]`);
        if (el) {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    },

    executeSelected() {
      const cmd = this.getFilteredCommands().find(c => c.id === this.selectedId);
      if (cmd) {
        this.execute(cmd);
      }
    },

    execute(cmd) {
      this.hide();

      if (cmd.action) {
        this.handleAction(cmd.action);
      } else if (cmd.url) {
        if (cmd.external) {
          window.open(cmd.url, '_blank', 'noopener');
        } else {
          window.location.href = cmd.url;
        }
      }
    },

    handleAction(action) {
      switch (action) {
        case 'theme:dark':
          Alpine.store('theme').set('dark');
          break;
        case 'theme:light':
          Alpine.store('theme').set('light');
          break;
        case 'shortcuts':
          this.shortcutsOpen = true;
          break;
      }
    },

    startGPrefix() {
      this.gPrefixActive = true;
      this.clearGPrefixTimeout();
      this.gPrefixTimeout = setTimeout(() => {
        this.gPrefixActive = false;
      }, 500);
    },

    clearGPrefixTimeout() {
      if (this.gPrefixTimeout) {
        clearTimeout(this.gPrefixTimeout);
        this.gPrefixTimeout = null;
      }
    },

    handleGSequence(key) {
      this.clearGPrefixTimeout();
      this.gPrefixActive = false;

      const cmdId = gPrefixMap[key];
      if (cmdId) {
        const cmd = commands.find(c => c.id === cmdId);
        if (cmd) {
          this.execute(cmd);
        }
      }
    },

    showShortcuts() {
      this.shortcutsOpen = true;
    },

    hideShortcuts() {
      document.activeElement?.blur();
      this.shortcutsOpen = false;
    },
  });

  // Global keyboard handler
  document.addEventListener('keydown', (e) => {
    const store = Alpine.store('commandPalette');

    // Ignore when typing in inputs
    const isInput = e.target.matches('input, textarea, select, [contenteditable]');

    // Cmd/Ctrl+K to open palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      store.toggle();
      return;
    }

    // Shortcuts modal handling
    if (store.shortcutsOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        store.hideShortcuts();
      }
      return;
    }

    // Palette-specific handlers
    if (store.open) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          store.hide();
          break;
        case 'ArrowDown':
          e.preventDefault();
          store.selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          store.selectPrev();
          break;
        case 'Enter':
          e.preventDefault();
          store.executeSelected();
          break;
      }
      return;
    }

    // Global shortcuts (when palette is closed)
    if (isInput) return;

    // / to open palette
    if (e.key === '/') {
      e.preventDefault();
      store.show();
      return;
    }

    // G-prefix handling
    if (store.gPrefixActive) {
      // Ignore modifier-only keypresses (Shift, etc.)
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }
      e.preventDefault();
      store.handleGSequence(e.key);
      return;
    }

    // Start g-prefix sequence
    if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      store.startGPrefix();
      return;
    }
  });
});
