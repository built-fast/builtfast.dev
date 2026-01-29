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
    selectedIndex: 0,
    gPrefixActive: false,
    gPrefixTimeout: null,
    shortcutsOpen: false,

    get commands() {
      return commands;
    },

    get filteredCommands() {
      if (!this.query) {
        return commands;
      }

      const q = this.query.toLowerCase();
      return commands.filter(cmd => {
        const titleMatch = cmd.title.toLowerCase().includes(q);
        const categoryMatch = cmd.category.toLowerCase().includes(q);
        const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(q));
        return titleMatch || categoryMatch || keywordMatch;
      });
    },

    get groupedCommands() {
      const groups = {};
      this.filteredCommands.forEach(cmd => {
        if (!groups[cmd.category]) {
          groups[cmd.category] = [];
        }
        groups[cmd.category].push(cmd);
      });
      return groups;
    },

    get flatFilteredCommands() {
      return this.filteredCommands;
    },

    toggle() {
      this.open = !this.open;
      if (this.open) {
        this.query = '';
        this.selectedIndex = 0;
      }
    },

    show() {
      this.open = true;
      this.query = '';
      this.selectedIndex = 0;
    },

    hide() {
      this.open = false;
      this.query = '';
    },

    selectNext() {
      const max = this.flatFilteredCommands.length - 1;
      this.selectedIndex = this.selectedIndex >= max ? 0 : this.selectedIndex + 1;
    },

    selectPrev() {
      const max = this.flatFilteredCommands.length - 1;
      this.selectedIndex = this.selectedIndex <= 0 ? max : this.selectedIndex - 1;
    },

    executeSelected() {
      const cmd = this.flatFilteredCommands[this.selectedIndex];
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
      this.shortcutsOpen = false;
    },
  });

  // Global keyboard handler
  document.addEventListener('keydown', (e) => {
    const store = Alpine.store('commandPalette');

    // Ignore when typing in inputs (except our palette input)
    const isInput = e.target.matches('input, textarea, select, [contenteditable]');
    const isPaletteInput = e.target.matches('.cmd-palette-input');

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
