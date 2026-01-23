// Toggle sidebar group expansion
function toggleSidebarGroup(group) {
    group.classList.toggle('expanded');

    // Save state to localStorage
    const groupId = group.dataset.group;
    const expandedGroups = JSON.parse(localStorage.getItem('scribe-expanded-groups') || '{}');
    expandedGroups[groupId] = group.classList.contains('expanded');
    localStorage.setItem('scribe-expanded-groups', JSON.stringify(expandedGroups));
}

// Restore expanded state from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const expandedGroups = JSON.parse(localStorage.getItem('scribe-expanded-groups') || '{}');

    document.querySelectorAll('.sidebar-group[data-group]').forEach(group => {
        const groupId = group.dataset.group;
        if (expandedGroups[groupId]) {
            group.classList.add('expanded');
        }
    });

    // Expand group containing current hash
    if (window.location.hash) {
        const targetLink = document.querySelector(`.sidebar-item[href="${window.location.hash}"]`);
        if (targetLink) {
            const parentGroup = targetLink.closest('.sidebar-group');
            if (parentGroup) {
                parentGroup.classList.add('expanded');
            }
            targetLink.classList.add('active');
        }
    }
});

// Track scroll position and highlight current section
function updateActiveSidebarItem() {
    const sections = document.querySelectorAll('.endpoint-group[id], .subgroup[id], .endpoint[id]');
    const sidebarLinks = document.querySelectorAll('.sidebar-item[href^="#"], .sidebar-group-link[href^="#"], .sidebar-subgroup-label[href^="#"]');

    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
        if (section.offsetTop <= scrollPos) {
            currentId = section.id;
        }
    });

    if (currentId) {
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
                link.classList.add('active');
                // Expand parent group
                const parentGroup = link.closest('.sidebar-group');
                if (parentGroup) {
                    parentGroup.classList.add('expanded');
                }
            }
        });
    }
}

// Throttled scroll handler
let sidebarScrollTimeout;
window.addEventListener('scroll', function() {
    if (sidebarScrollTimeout) {
        window.cancelAnimationFrame(sidebarScrollTimeout);
    }
    sidebarScrollTimeout = window.requestAnimationFrame(updateActiveSidebarItem);
});

// Handle hash changes
window.addEventListener('hashchange', function() {
    const targetLink = document.querySelector(`.sidebar-item[href="${window.location.hash}"]`);
    if (targetLink) {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        targetLink.classList.add('active');

        const parentGroup = targetLink.closest('.sidebar-group');
        if (parentGroup) {
            parentGroup.classList.add('expanded');
        }
    }
});

// Initialize highlight.js
document.addEventListener('DOMContentLoaded', function() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
});

// Initialize Jets.js for sidebar search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('sidebar-search');
    if (searchInput && typeof Jets !== 'undefined') {
        const jets = new Jets({
            searchTag: '#sidebar-search',
            contentTag: '.api-sidebar-nav',
            didSearch: function(searchPhrase) {
                const groups = document.querySelectorAll('.sidebar-group');
                groups.forEach(group => {
                    if (searchPhrase.length > 0) {
                        group.classList.add('expanded');
                    } else {
                        const groupId = group.dataset.group;
                        const savedGroups = JSON.parse(localStorage.getItem('scribe-expanded-groups') || '{}');
                        if (savedGroups[groupId]) {
                            group.classList.add('expanded');
                        } else {
                            group.classList.remove('expanded');
                        }
                    }
                });
            }
        });
    }
});

// Endpoint code block functions
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const visibleExample = codeBlock.querySelector('.example-code:not([style*="display: none"])')
                        || codeBlock.querySelector('.example-code');

    if (!visibleExample) return;

    const code = visibleExample.querySelector('code');
    if (!code) return;

    const text = code.textContent;

    navigator.clipboard.writeText(text).then(() => {
        button.classList.add('copied');
        const copyIcon = button.querySelector('.copy-icon');
        const checkIcon = button.querySelector('.check-icon');
        
        if (copyIcon) copyIcon.style.display = 'none';
        if (checkIcon) checkIcon.style.display = 'block';

        setTimeout(() => {
            button.classList.remove('copied');
            if (copyIcon) copyIcon.style.display = 'block';
            if (checkIcon) checkIcon.style.display = 'none';
        }, 2000);
    });
}

function copyResponse(button) {
    const codeBlock = button.closest('.code-block');
    const visibleResponse = codeBlock.querySelector('.response-code:not([style*="display: none"])')
                        || codeBlock.querySelector('.response-code');

    if (!visibleResponse) return;

    const code = visibleResponse.querySelector('.response-body code');
    if (!code) return;

    const text = code.textContent;

    navigator.clipboard.writeText(text).then(() => {
        button.classList.add('copied');
        const copyIcon = button.querySelector('.copy-icon');
        const checkIcon = button.querySelector('.check-icon');
        
        if (copyIcon) copyIcon.style.display = 'none';
        if (checkIcon) checkIcon.style.display = 'block';

        setTimeout(() => {
            button.classList.remove('copied');
            if (copyIcon) copyIcon.style.display = 'block';
            if (checkIcon) checkIcon.style.display = 'none';
        }, 2000);
    });
}

function switchResponse(select) {
    const index = select.value;
    const container = select.closest('.code-block');
    const responses = container.querySelectorAll('.response-code');

    responses.forEach(response => {
        response.style.display = response.dataset.responseIndex === index ? 'block' : 'none';
    });

    if (typeof hljs !== 'undefined') {
        container.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
    }
}

function switchLanguage(select) {
    const lang = select.value;
    const container = select.closest('.code-block');
    const examples = container.querySelectorAll('.example-code');

    examples.forEach(example => {
        example.style.display = example.dataset.lang === lang ? 'block' : 'none';
    });

    localStorage.setItem('scribe-preferred-lang', lang);

    // Sync all dropdowns
    document.querySelectorAll('.lang-dropdown:not(.response-dropdown)').forEach(dropdown => {
        if (dropdown !== select) {
            const option = dropdown.querySelector(`option[value="${lang}"]`);
            if (option) {
                dropdown.value = lang;
                const otherContainer = dropdown.closest('.code-block');
                if (otherContainer) {
                    otherContainer.querySelectorAll('.example-code').forEach(example => {
                        example.style.display = example.dataset.lang === lang ? 'block' : 'none';
                    });
                }
            }
        }
    });

    if (typeof hljs !== 'undefined') {
        container.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
    }
}

// Initialize preferred language and tab switching
document.addEventListener('DOMContentLoaded', function() {
    const preferredLang = localStorage.getItem('scribe-preferred-lang');
    if (preferredLang) {
        document.querySelectorAll('.lang-dropdown:not(.response-dropdown)').forEach(dropdown => {
            const option = dropdown.querySelector(`option[value="${preferredLang}"]`);
            if (option) {
                dropdown.value = preferredLang;
                switchLanguage(dropdown);
            }
        });
    }

    // Tab switching
    document.querySelectorAll('.param-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabsContainer = this.closest('.param-tabs');
            const tabName = this.dataset.tab;

            tabsContainer.querySelectorAll('.param-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            tabsContainer.querySelectorAll('.param-tab-panel').forEach(p => p.classList.remove('active'));
            tabsContainer.querySelector(`[data-panel="${tabName}"]`).classList.add('active');
        });
    });
});
