/**
 * Infrastructure UI Interactions
 * Handles navigation, scrolling, and component info display
 */

/**
 * Smooth scroll to a section
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Show component information in the info panel
 */
function showComponentInfo(component) {
    const panel = document.getElementById('component-info');
    const info = CONFIG.componentInfo[component];
    
    if (!panel || !info) return;
    
    // Color mapping
    const colorMap = {
        sky: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
        amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
        red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    
    const colors = colorMap[info.color] || colorMap.sky;
    
    let specsHtml = info.specs.map(spec => `
        <div class="flex justify-between py-2 border-b border-slate-700/50">
            <span class="text-slate-400 text-sm">${spec.label}</span>
            <span class="text-white font-mono text-sm font-medium">${spec.value}</span>
        </div>
    `).join('');
    
    // Generate advantages section if available
    let advantagesHtml = '';
    if (info.advantages && info.advantages.length > 0) {
        advantagesHtml = `
            <div class="mt-6 pt-4 border-t border-slate-600">
                <h4 class="text-sm font-bold ${colors.text} uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span class="material-symbols-sharp text-base">verified</span>
                    Why ${component === 'cerebras' ? 'Cerebras' : 'DDN'}?
                </h4>
                <ul class="space-y-2">
                    ${info.advantages.map(adv => `
                        <li class="flex items-start gap-2 text-sm text-slate-300">
                            <span class="material-symbols-sharp ${colors.text} text-sm mt-0.5 flex-shrink-0">check_circle</span>
                            <span>${adv}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    panel.innerHTML = `
        <div class="info-active">
            <div class="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                <div class="${colors.bg} p-3 rounded-lg">
                    <span class="material-symbols-sharp text-3xl ${colors.text}">${info.icon}</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white">${info.title}</h3>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors.bg} ${colors.text} ${colors.border} border">${component === 'cerebras' ? 'Compute' : component === 'ddn' ? 'Storage' : 'Application'}</span>
                </div>
            </div>
            
            <p class="text-slate-300 text-sm mb-6 leading-relaxed">${info.description}</p>
            
            <div class="space-y-0">
                ${specsHtml}
            </div>
            
            ${advantagesHtml}
        </div>
    `;
    
    // Highlight the selected node
    document.querySelectorAll('.arch-node').forEach(node => {
        node.style.borderColor = '';
    });
    
    const selectedNode = event.currentTarget;
    if (selectedNode) {
        const borderColors = {
            sky: '#0ea5e9',
            amber: '#f59e0b',
            red: '#ef4444'
        };
        selectedNode.style.borderColor = borderColors[info.color] || borderColors.sky;
    }
}

/**
 * Reset component info to default state
 */
function resetComponentInfo() {
    const panel = document.getElementById('component-info');
    if (!panel) return;
    
    panel.innerHTML = `
        <div class="info-default">
            <span class="material-symbols-sharp text-6xl text-slate-500 mb-4">touch_app</span>
            <h3 class="text-xl font-bold text-white mb-2">Interactive Specs</h3>
            <p class="text-slate-400 text-sm">Select a component to view detailed specifications.</p>
        </div>
    `;
}

/**
 * Navigation scroll effect
 */
function handleNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    if (window.scrollY > 100) {
        nav.classList.add('bg-slate-950/95', 'shadow-lg');
        nav.classList.remove('bg-slate-950/90');
    } else {
        nav.classList.remove('bg-slate-950/95', 'shadow-lg');
        nav.classList.add('bg-slate-950/90');
    }
}

/**
 * Scroll reveal animations
 */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
}

/**
 * Mobile menu toggle
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    const icon = document.getElementById('mobile-menu-icon');
    
    if (!menu || !btn || !icon) return;
    
    const isOpen = !menu.classList.contains('hidden');
    
    if (isOpen) {
        menu.classList.add('hidden');
        icon.textContent = 'menu';
        btn.setAttribute('aria-expanded', 'false');
    } else {
        menu.classList.remove('hidden');
        icon.textContent = 'close';
        btn.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Close mobile menu on outside click
 */
document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    
    if (!menu || !btn) return;
    
    if (!menu.contains(e.target) && !btn.contains(e.target) && !menu.classList.contains('hidden')) {
        toggleMobileMenu();
    }
});

/**
 * Update slider fill track and tooltip
 */
function updateSliderFill() {
    const slider = document.getElementById('cluster-scale');
    const fill = document.getElementById('slider-fill');
    const tooltip = document.getElementById('slider-tooltip');
    
    if (!slider || !fill) return;
    
    const value = parseInt(slider.value);
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    const percentage = ((value - min) / (max - min)) * 100;
    
    fill.style.width = percentage + '%';
    
    if (tooltip) {
        tooltip.textContent = 'Tier ' + value;
        // Position tooltip over thumb
        tooltip.style.left = percentage + '%';
    }
    
    // Update ARIA
    const tier = CONFIG?.clusterTiers?.[value];
    if (tier) {
        slider.setAttribute('aria-valuenow', value);
        slider.setAttribute('aria-valuetext', `${tier.cs3} CS-3 systems, ${tier.ddn} DDN appliances`);
    }
}

/**
 * Form submission handler
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('lead-form');
    const success = document.getElementById('form-success');
    
    if (!form || !success) return;
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add cluster config to form data
    if (typeof getCurrentConfig === 'function') {
        data.clusterConfig = getCurrentConfig();
    }
    
    // Log for now (replace with actual API call)
    console.log('Lead form submitted:', data);
    
    // Track event
    trackEvent('Lead', 'Submit', data.usecase || 'Not specified');
    
    // Show success message
    form.classList.add('hidden');
    success.classList.remove('hidden');
    
    // In production, send to backend:
    // fetch('/api/leads', { method: 'POST', body: JSON.stringify(data) })
}

/**
 * Highlight use case card on hover
 */
function initUseCaseHighlights() {
    const cards = document.querySelectorAll('.use-case-card');
    
    if (!cards.length) return;
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add subtle highlight
            card.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = '';
        });
    });
}

/**
 * Keyboard navigation support
 */
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        // ESC to reset component info or close mobile menu
        if (e.key === 'Escape') {
            resetComponentInfo();
            const menu = document.getElementById('mobile-menu');
            if (menu && !menu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        }
    });
}

/**
 * Add visual feedback to interactive elements
 */
function initInteractiveFeedback() {
    // Architecture nodes - make focusable
    document.querySelectorAll('.arch-node').forEach(node => {
        node.addEventListener('mouseenter', () => {
            node.style.cursor = 'pointer';
        });
    });
    
    // Buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.classList.add('btn-press');
    });
}

/**
 * Initialize slider fill on load
 */
function initSliderFill() {
    const slider = document.getElementById('cluster-scale');
    if (slider) {
        slider.addEventListener('input', updateSliderFill);
        updateSliderFill(); // Initial fill
    }
}

/**
 * Auto-highlight Cerebras node on page load for engagement
 */
function initAutoHighlight() {
    setTimeout(() => {
        const cerebrasNode = document.querySelector('.arch-node-amber');
        if (cerebrasNode) {
            cerebrasNode.style.animation = 'pulseHighlight 2s ease-in-out';
            cerebrasNode.addEventListener('animationend', () => {
                cerebrasNode.style.animation = '';
            });
        }
    }, 2000);
}

/**
 * Initialize analytics tracking (placeholder)
 */
function trackEvent(category, action, label) {
    // Placeholder for analytics integration
    if (typeof console !== 'undefined') {
        console.log(`Event: ${category} / ${action} / ${label}`);
    }
}

/**
 * Copy configuration to clipboard
 */
async function copyConfigToClipboard() {
    if (typeof getCurrentConfig !== 'function' || typeof CONFIG === 'undefined') {
        console.error('Configuration not available');
        return;
    }
    
    const config = getCurrentConfig();
    const tier = config.tier;
    
    const text = `VCB Sovereign AI Cluster Configuration
=====================================
Use Case: ${CONFIG.useCases[config.useCase]?.name || 'Custom'}
Model: ${CONFIG.models[config.model]?.name || 'Custom'}
CS-3 Systems: ${tier.cs3}
DDN Appliances: ${tier.ddn}
Power: ${tier.power} kW
Performance: ${tier.pflops} PFLOPS
Pretoria DC: ${config.pretoriaDC ? 'Yes' : 'No'}`;
    
    try {
        await navigator.clipboard.writeText(text);
        alert('Configuration copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll listener
    window.addEventListener('scroll', handleNavScroll);
    
    // Initialize features
    initScrollReveal();
    initUseCaseHighlights();
    initKeyboardNav();
    initInteractiveFeedback();
    initSliderFill();
    initAutoHighlight();
    
    // Initialize sizing calculator
    if (typeof initSizingCalculator === 'function') {
        initSizingCalculator();
    }
    
    // Log page view
    trackEvent('Page', 'View', 'Infrastructure');
});

// Smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
