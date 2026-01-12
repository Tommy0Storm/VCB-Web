/**
 * Cluster Builder Logic
 * Handles cluster configuration and visualization
 */

// State
let currentUseCase = 'fintech';
let currentModel = 70;
let currentScale = 1;
let pretoriaDCEnabled = false;

/**
 * Select a use case and update configuration
 */
function selectUseCase(useCase) {
    currentUseCase = useCase;
    
    // Update button states
    document.querySelectorAll('.use-case-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.case === useCase) {
            btn.classList.add('active');
        }
    });
    
    // Get recommended config for this use case
    const config = CONFIG.useCases[useCase];
    if (config) {
        // Optionally auto-set recommended model
        selectModel(config.recommendedModel, false);
        
        // Optionally auto-set recommended tier
        const slider = document.getElementById('cluster-scale');
        if (slider && config.recommendedTier) {
            slider.value = config.recommendedTier;
            updateClusterScale();
        }
    }
    
    renderRack();
}

/**
 * Select a use case and scroll to cluster builder
 */
function selectUseCaseAndScroll(useCase) {
    selectUseCase(useCase);
    scrollToSection('cluster-builder');
}

/**
 * Select a model size
 */
function selectModel(model, updateRack = true) {
    currentModel = model;
    
    // Update button states
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.model) === model) {
            btn.classList.add('active');
        }
    });
    
    // Ensure minimum CS-3 count for selected model
    const modelConfig = CONFIG.models[model];
    if (modelConfig) {
        const slider = document.getElementById('cluster-scale');
        const currentTier = parseInt(slider.value);
        const tierConfig = CONFIG.clusterTiers[currentTier];
        
        if (tierConfig.cs3 < modelConfig.minCS3) {
            // Find minimum tier that supports this model
            for (let tier = 1; tier <= 8; tier++) {
                if (CONFIG.clusterTiers[tier].cs3 >= modelConfig.minCS3) {
                    slider.value = tier;
                    break;
                }
            }
        }
    }
    
    if (updateRack) {
        updateClusterScale();
    }
}

// Component visibility state
let visioComponentState = {
    cs3: true,
    ddn: true,
    ddn1: true,
    ddn2: true
};

/**
 * Toggle visibility of a component in the Visio diagram
 */
function toggleVisioComponent(component) {
    const checkbox = document.getElementById(`show-${component}`);
    if (!checkbox) return;
    
    visioComponentState[component] = checkbox.checked;
    renderVisioDiagram();
}

/**
 * Update cluster scale from slider
 */
function updateClusterScale() {
    const slider = document.getElementById('cluster-scale');
    if (!slider) return;
    
    currentScale = parseInt(slider.value);
    
    if (!CONFIG || !CONFIG.clusterTiers || !CONFIG.clusterTiers[currentScale]) {
        console.error('Configuration not available for tier:', currentScale);
        return;
    }
    
    const tier = CONFIG.clusterTiers[currentScale];
    const model = CONFIG.models[currentModel];
    
    // Update counts with null checks
    const cs3Count = document.getElementById('cs3-count');
    const ddnCount = document.getElementById('ddn-count');
    const metricPower = document.getElementById('metric-power');
    const metricCooling = document.getElementById('metric-cooling');
    const metricPflops = document.getElementById('metric-pflops');
    const metricUsers = document.getElementById('metric-users');
    const metricTokens = document.getElementById('metric-tokens');
    const tierLabel = document.getElementById('tier-label');
    const tierDescription = document.getElementById('tier-description');
    
    if (cs3Count) cs3Count.textContent = tier.cs3;
    if (ddnCount) ddnCount.textContent = tier.ddn;
    if (metricPower) metricPower.textContent = tier.power;
    if (metricCooling) metricCooling.textContent = tier.cs3 * CONFIG.cerebras.cooling;
    if (metricPflops) metricPflops.textContent = tier.pflops;
    if (tierLabel) tierLabel.textContent = tier.label;
    if (tierDescription) tierDescription.textContent = tier.description;
    
    // Calculate and display user capacity
    if (model && CONFIG.calculateCapacity) {
        const capacity = CONFIG.calculateCapacity(tier.cs3, currentModel);
        if (metricUsers) metricUsers.textContent = formatNumber(capacity.users);
        if (metricTokens) metricTokens.textContent = formatNumber(capacity.tokensPerSec);
    } else {
        // Fallback to tier defaults
        if (metricUsers) metricUsers.textContent = formatNumber(tier.users || 0);
        if (metricTokens) metricTokens.textContent = model ? formatNumber(tier.cs3 * model.tokensPerSecond) : '—';
    }
    
    // Update slider fill if function exists
    if (typeof updateSliderFill === 'function') {
        updateSliderFill();
    }
    
    renderRack();
    renderVisioDiagram();
}

/**
 * Format large numbers with K, M suffixes
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Toggle Pretoria Datacenter option
 */
function togglePretoriaDC() {
    const checkbox = document.getElementById('pretoria-dc');
    pretoriaDCEnabled = checkbox.checked;
    
    const badge = document.getElementById('pretoria-badge');
    if (pretoriaDCEnabled) {
        badge.classList.remove('hidden');
        badge.classList.add('flex');
    } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
    }
    
    // Update Visio diagram to show/hide DC
    renderVisioDiagram();
}

/**
 * Render the rack visualization
 */
function renderRack() {
    const container = document.getElementById('rack-units');
    if (!container) return;
    
    const tier = CONFIG.clusterTiers[currentScale];
    const cs3Count = tier.cs3;
    const ddnCount = tier.ddn;
    
    // Calculate how many units to show (max visible)
    const maxVisible = {
        cs3: Math.min(cs3Count, 4),
        ddn: Math.min(ddnCount, 4)
    };
    
    let html = '';
    
    // DDN units
    for (let i = 0; i < maxVisible.ddn; i++) {
        html += createDDNUnit(i);
    }
    
    // Network fabric
    html += createNetworkUnit();
    
    // CS-3 units
    for (let i = 0; i < maxVisible.cs3; i++) {
        html += createCS3Unit(i);
    }
    
    // Overflow indicator
    if (cs3Count > maxVisible.cs3 || ddnCount > maxVisible.ddn) {
        html += createOverflowIndicator(cs3Count, ddnCount, maxVisible);
    }
    
    container.innerHTML = html;
    
    // Trigger animations
    setTimeout(() => {
        container.querySelectorAll('.rack-unit').forEach((unit, i) => {
            unit.style.animationDelay = `${i * 100}ms`;
        });
    }, 10);
}

/**
 * Create CS-3 rack unit HTML
 */
function createCS3Unit(index) {
    return `
        <div class="rack-unit rack-unit-cs3" style="animation-delay: ${index * 100}ms">
            <div class="flex flex-col gap-1">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full led-active"></span>
                <span class="w-1.5 h-1.5 bg-amber-400 rounded-full led-active" style="animation-delay: 0.5s"></span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-white tracking-wide">CS-3 SYSTEM</span>
                    <span class="text-[9px] text-slate-400 font-mono">WSE-3</span>
                </div>
                <div class="w-full h-6 opacity-30" style="background: repeating-linear-gradient(90deg, #334155 0px, #334155 2px, transparent 2px, transparent 4px);"></div>
            </div>
        </div>
    `;
}

/**
 * Create DDN rack unit HTML
 */
function createDDNUnit(index) {
    return `
        <div class="rack-unit rack-unit-ddn" style="animation-delay: ${index * 100}ms">
            <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full led-active"></span>
                <span class="text-[9px] font-bold text-red-400 tracking-wider">DDN AI400X2</span>
            </div>
            <div class="w-16 h-1.5 bg-gradient-to-r from-red-900 to-slate-700 rounded-full"></div>
        </div>
    `;
}

/**
 * Create network fabric unit HTML
 */
function createNetworkUnit() {
    return `
        <div class="rack-unit rack-unit-network">
            <span class="text-[8px] text-slate-500 tracking-[0.2em] uppercase">100GbE Fabric</span>
        </div>
    `;
}

/**
 * Create overflow indicator for larger clusters
 */
function createOverflowIndicator(totalCS3, totalDDN, visible) {
    const extraCS3 = totalCS3 - visible.cs3;
    const extraDDN = totalDDN - visible.ddn;
    
    return `
        <div class="rack-unit h-8 bg-slate-700/50 justify-center rounded-lg border border-dashed border-slate-600">
            <span class="text-[10px] text-slate-400">
                +${extraCS3 > 0 ? extraCS3 + ' CS-3' : ''} 
                ${extraCS3 > 0 && extraDDN > 0 ? '/ ' : ''}
                ${extraDDN > 0 ? extraDDN + ' DDN' : ''} 
                (additional racks)
            </span>
        </div>
    `;
}

/**
 * Request a quote
 */
function requestQuote() {
    const tier = CONFIG.clusterTiers[currentScale];
    const useCase = CONFIG.useCases[currentUseCase];
    const model = CONFIG.models[currentModel];
    
    const subject = encodeURIComponent(`Quote Request: ${tier.label} Sovereign AI Cluster`);
    const body = encodeURIComponent(`
Hi VCB-AI Infrastructure Team,

I'm interested in a quote for a sovereign AI cluster with the following configuration:

Use Case: ${useCase.name}
Model Scale: ${model.name} (${model.examples})

Cluster Configuration:
- Cerebras CS-3 Systems: ${tier.cs3}
- DDN AI400X2 Appliances: ${tier.ddn}
- Estimated Power: ${tier.power} kW
- Performance: ${tier.pflops} PFLOPS

Pretoria Datacenter: ${pretoriaDCEnabled ? 'Yes - deploy at PTA-DC1' : 'No - on-premise deployment'}

Please contact me to discuss requirements and pricing.

Best regards
    `);
    
    window.location.href = `mailto:infrastructure@vcb-ai.online?subject=${subject}&body=${body}`;
}

/**
 * Get current configuration summary
 */
function getCurrentConfig() {
    return {
        useCase: currentUseCase,
        model: currentModel,
        scale: currentScale,
        tier: CONFIG.clusterTiers[currentScale],
        pretoriaDC: pretoriaDCEnabled
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial state
    updateClusterScale();
    renderRack();
    renderVisioDiagram();
});

/**
 * Render the Visio-style architecture diagram
 */
function renderVisioDiagram() {
    const computeRow = document.getElementById('visio-compute-row');
    const storageRow = document.getElementById('visio-storage-row');
    const dcRow = document.getElementById('visio-dc-row');
    const connectionLayer = document.getElementById('connection-layer');
    
    if (!computeRow || !storageRow) return;
    
    const tier = CONFIG.clusterTiers[currentScale];
    const cs3Count = tier.cs3;
    const ddnCount = tier.ddn;
    
    // Limit visible nodes for cleaner visualization
    const maxVisible = {
        cs3: Math.min(cs3Count, 6),
        ddn: Math.min(ddnCount, 8)
    };
    
    // Render CS-3 compute nodes (respecting visibility toggle)
    let computeHtml = '';
    if (visioComponentState.cs3) {
        for (let i = 0; i < maxVisible.cs3; i++) {
            computeHtml += createVisioCS3Node(i);
        }
        if (cs3Count > maxVisible.cs3) {
            computeHtml += createVisioOverflowNode(cs3Count - maxVisible.cs3, 'cs3');
        }
    } else {
        computeHtml = '<div class="text-slate-500 text-sm italic p-4">CS-3 nodes hidden</div>';
    }
    computeRow.innerHTML = computeHtml;
    
    // Render DDN storage nodes (respecting visibility toggles)
    let storageHtml = '';
    if (visioComponentState.ddn) {
        for (let i = 0; i < maxVisible.ddn; i++) {
            // Check individual DDN visibility
            if (i === 0 && !visioComponentState.ddn1) continue;
            if (i === 1 && !visioComponentState.ddn2) continue;
            storageHtml += createVisioDDNNode(i);
        }
        if (ddnCount > maxVisible.ddn) {
            storageHtml += createVisioOverflowNode(ddnCount - maxVisible.ddn, 'ddn');
        }
    } else {
        storageHtml = '<div class="text-slate-500 text-sm italic p-4">DDN nodes hidden</div>';
    }
    storageRow.innerHTML = storageHtml;
    
    // Show/hide datacenter row
    if (pretoriaDCEnabled) {
        dcRow.classList.remove('hidden');
    } else {
        dcRow.classList.add('hidden');
    }
    
    // Update fabric stats
    const throughput = Math.min(ddnCount * CONFIG.ddn.readThroughput, 1000);
    document.getElementById('fabric-throughput').textContent = throughput >= 1000 ? '1+ TB/s' : throughput + ' GB/s';
    
    // Update summary (show actual counts regardless of visibility)
    document.getElementById('vs-cs3').textContent = cs3Count;
    document.getElementById('vs-ddn').textContent = ddnCount;
    document.getElementById('vs-pflops').textContent = tier.pflops >= 1000 ? (tier.pflops/1000).toFixed(1) + 'K' : tier.pflops;
    document.getElementById('vs-links').textContent = cs3Count + ddnCount + 2; // Compute + storage + 2 fabric
    
    // Render SVG connections after DOM update
    requestAnimationFrame(() => {
        renderVisioConnections();
    });
    
    // Trigger entrance animations
    computeRow.querySelectorAll('.visio-node').forEach((node, i) => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(20px)';
        setTimeout(() => {
            node.style.transition = 'all 0.4s ease';
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
        }, i * 80);
    });
    
    storageRow.querySelectorAll('.visio-node').forEach((node, i) => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(20px)';
        setTimeout(() => {
            node.style.transition = 'all 0.4s ease';
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
        }, (i + maxVisible.cs3) * 80);
    });
}

/**
 * Create a CS-3 node for the Visio diagram - DETAILED VERSION
 */
function createVisioCS3Node(index) {
    const specs = CONFIG.cerebras;
    const tier = CONFIG.clusterTiers[currentScale];
    const modelTokens = specs.tokensPerSecond[currentModel + 'b'] || specs.tokensPerSecond['70b'];
    
    return `
        <div class="visio-node visio-node-cs3 visio-node-detailed" data-node="cs3-${index}" role="button" tabindex="0" aria-label="Cerebras CS-3 System ${index + 1}">
            <div class="visio-node-glow visio-glow-amber"></div>
            <div class="visio-node-ring" style="border-color: rgba(245, 158, 11, 0.3);"></div>
            
            <!-- Premium Icon -->
            <div class="visio-node-icon-wrapper">
                <div class="visio-node-icon visio-icon-gradient-amber">
                    <svg viewBox="0 0 48 48" class="visio-cs3-icon" aria-hidden="true">
                        <defs>
                            <linearGradient id="cs3-grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#fbbf24"/>
                                <stop offset="50%" style="stop-color:#f59e0b"/>
                                <stop offset="100%" style="stop-color:#d97706"/>
                            </linearGradient>
                            <filter id="cs3-glow-${index}" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                            </filter>
                        </defs>
                        <!-- Main chip body -->
                        <rect x="6" y="6" width="36" height="36" rx="4" fill="url(#cs3-grad-${index})" filter="url(#cs3-glow-${index})"/>
                        <!-- Inner chip -->
                        <rect x="10" y="10" width="28" height="28" rx="2" fill="#0f172a"/>
                        <!-- WSE cores grid - 4x4 -->
                        <g fill="#f59e0b">
                            <rect x="12" y="12" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="${index * 0.2}s" repeatCount="indefinite"/></rect>
                            <rect x="18.5" y="12" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="0.8;1;0.8" dur="2s" begin="${index * 0.2 + 0.3}s" repeatCount="indefinite"/></rect>
                            <rect x="25" y="12" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="1;0.6;1" dur="2s" begin="${index * 0.2 + 0.6}s" repeatCount="indefinite"/></rect>
                            <rect x="31" y="12" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="${index * 0.2 + 0.9}s" repeatCount="indefinite"/></rect>
                            <rect x="12" y="18.5" width="5" height="5" rx="0.5" opacity="0.9"/>
                            <rect x="18.5" y="18.5" width="5" height="5" rx="0.5" opacity="0.85"/>
                            <rect x="25" y="18.5" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="1;0.7;1" dur="2s" begin="${index * 0.2 + 0.4}s" repeatCount="indefinite"/></rect>
                            <rect x="31" y="18.5" width="5" height="5" rx="0.5" opacity="0.8"/>
                            <rect x="12" y="25" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="0.8;1;0.8" dur="2s" begin="${index * 0.2 + 0.5}s" repeatCount="indefinite"/></rect>
                            <rect x="18.5" y="25" width="5" height="5" rx="0.5" opacity="0.9"/>
                            <rect x="25" y="25" width="5" height="5" rx="0.5" opacity="0.85"/>
                            <rect x="31" y="25" width="5" height="5" rx="0.5" opacity="0.8"/>
                            <rect x="12" y="31" width="5" height="5" rx="0.5" opacity="0.75"/>
                            <rect x="18.5" y="31" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="1;0.6;1" dur="2s" begin="${index * 0.2 + 0.8}s" repeatCount="indefinite"/></rect>
                            <rect x="25" y="31" width="5" height="5" rx="0.5" opacity="0.9"/>
                            <rect x="31" y="31" width="5" height="5" rx="0.5"><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="${index * 0.2 + 0.7}s" repeatCount="indefinite"/></rect>
                        </g>
                        <!-- Connection pins -->
                        <g fill="#f59e0b" opacity="0.6">
                            <rect x="3" y="14" width="3" height="2" rx="0.5"/>
                            <rect x="3" y="22" width="3" height="2" rx="0.5"/>
                            <rect x="3" y="30" width="3" height="2" rx="0.5"/>
                            <rect x="42" y="14" width="3" height="2" rx="0.5"/>
                            <rect x="42" y="22" width="3" height="2" rx="0.5"/>
                            <rect x="42" y="30" width="3" height="2" rx="0.5"/>
                        </g>
                    </svg>
                </div>
                <div class="visio-node-pulse" style="box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);"></div>
            </div>
            
            <!-- Detailed Specs Panel -->
            <div class="visio-node-details">
                <div class="visio-node-header">
                    <span class="visio-node-title">CS-3 #${index + 1}</span>
                    <span class="visio-node-chip">${specs.chip}</span>
                </div>
                
                <!-- Primary Metrics Row -->
                <div class="visio-metrics-row">
                    <div class="visio-metric">
                        <span class="visio-metric-value">${specs.pflops}</span>
                        <span class="visio-metric-label">PFLOPS</span>
                    </div>
                    <div class="visio-metric">
                        <span class="visio-metric-value">${specs.cores}</span>
                        <span class="visio-metric-label">Cores</span>
                    </div>
                    <div class="visio-metric">
                        <span class="visio-metric-value">${specs.onChipMemory}</span>
                        <span class="visio-metric-label">On-Chip</span>
                    </div>
                </div>
                
                <!-- Secondary Metrics Row -->
                <div class="visio-specs-grid">
                    <div class="visio-spec-item">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.5.5 0 0 1 .5.5v1.5H10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.5V1.5A.5.5 0 0 1 8 1zM6 4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6z"/><path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/></svg>
                        <span>${specs.power} kW</span>
                    </div>
                    <div class="visio-spec-item">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 16a6 6 0 0 0 6-6c0-1.655-1.122-2.904-2.432-4.362C10.254 4.176 8.75 2.503 8 0c0 0-6 5.686-6 10a6 6 0 0 0 6 6zM6.646 4.646l.708.708c-.29.29-.647.71-1.024 1.278-.35.53-.719 1.165-1.025 1.878-.529 1.234-.81 2.59-.81 4.49h-1c0-2.1.296-3.537.9-4.93.33-.77.752-1.468 1.142-2.052.39-.585.745-1.064 1.109-1.372z"/></svg>
                        <span>${specs.cooling} L/min</span>
                    </div>
                    <div class="visio-spec-item">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/></svg>
                        <span>${specs.formFactor}</span>
                    </div>
                    <div class="visio-spec-item visio-spec-highlight">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z"/><path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
                        <span>${modelTokens.toLocaleString()} tok/s</span>
                    </div>
                </div>
                
                <!-- Bandwidth Bar -->
                <div class="visio-bandwidth-bar">
                    <div class="visio-bandwidth-label">Memory BW</div>
                    <div class="visio-bandwidth-value">${specs.memoryBandwidth}</div>
                </div>
            </div>
            
            <span class="visio-node-badge" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.5);">WSE-3</span>
            <div class="visio-status-led">
                <span class="visio-led visio-led-green"></span>
                <span class="visio-status-text">Online</span>
            </div>
        </div>
    `;
}

/**
 * Create a DDN node for the Visio diagram - DETAILED VERSION
 */
function createVisioDDNNode(index) {
    const specs = CONFIG.ddn;
    const tier = CONFIG.clusterTiers[currentScale];
    const totalCapacity = specs.capacity ? specs.capacity : 500; // PB default
    
    return `
        <div class="visio-node visio-node-ddn visio-node-detailed" data-node="ddn-${index}" role="button" tabindex="0" aria-label="DDN Storage Appliance ${index + 1}">
            <div class="visio-node-glow visio-glow-red"></div>
            <div class="visio-node-ring" style="border-color: rgba(239, 68, 68, 0.3);"></div>
            
            <!-- Premium Icon -->
            <div class="visio-node-icon-wrapper">
                <div class="visio-node-icon visio-icon-gradient-red">
                    <svg viewBox="0 0 48 48" class="visio-ddn-icon" aria-hidden="true">
                        <defs>
                            <linearGradient id="ddn-grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#f87171"/>
                                <stop offset="50%" style="stop-color:#ef4444"/>
                                <stop offset="100%" style="stop-color:#dc2626"/>
                            </linearGradient>
                            <filter id="ddn-glow-${index}" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="1" result="blur"/>
                                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                            </filter>
                        </defs>
                        <!-- Storage rack frame -->
                        <rect x="4" y="4" width="40" height="40" rx="3" fill="#1e293b" stroke="url(#ddn-grad-${index})" stroke-width="2"/>
                        <!-- Disk slots - 4 rows -->
                        <g>
                            <rect x="7" y="7" width="34" height="7" rx="1.5" fill="url(#ddn-grad-${index})" filter="url(#ddn-glow-${index})"/>
                            <circle cx="11" cy="10.5" r="2" fill="#0f172a">
                                <animate attributeName="fill" values="#0f172a;#22c55e;#0f172a" dur="3s" begin="${index * 0.5}s" repeatCount="indefinite"/>
                            </circle>
                            <rect x="16" y="9" width="22" height="3" rx="0.5" fill="#0f172a" opacity="0.5"/>
                            
                            <rect x="7" y="16" width="34" height="7" rx="1.5" fill="url(#ddn-grad-${index})" opacity="0.9"/>
                            <circle cx="11" cy="19.5" r="2" fill="#0f172a">
                                <animate attributeName="fill" values="#0f172a;#22c55e;#0f172a" dur="3s" begin="${index * 0.5 + 0.3}s" repeatCount="indefinite"/>
                            </circle>
                            <rect x="16" y="18" width="22" height="3" rx="0.5" fill="#0f172a" opacity="0.5"/>
                            
                            <rect x="7" y="25" width="34" height="7" rx="1.5" fill="url(#ddn-grad-${index})" opacity="0.8"/>
                            <circle cx="11" cy="28.5" r="2" fill="#0f172a">
                                <animate attributeName="fill" values="#0f172a;#22c55e;#0f172a" dur="3s" begin="${index * 0.5 + 0.6}s" repeatCount="indefinite"/>
                            </circle>
                            <rect x="16" y="27" width="22" height="3" rx="0.5" fill="#0f172a" opacity="0.5"/>
                            
                            <rect x="7" y="34" width="34" height="7" rx="1.5" fill="url(#ddn-grad-${index})" opacity="0.7"/>
                            <circle cx="11" cy="37.5" r="2" fill="#0f172a">
                                <animate attributeName="fill" values="#0f172a;#22c55e;#0f172a" dur="3s" begin="${index * 0.5 + 0.9}s" repeatCount="indefinite"/>
                            </circle>
                            <rect x="16" y="36" width="22" height="3" rx="0.5" fill="#0f172a" opacity="0.5"/>
                        </g>
                        <!-- Activity indicators -->
                        <g fill="#fbbf24" opacity="0.8">
                            <circle cx="38" cy="10.5" r="1.5"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite"/></circle>
                            <circle cx="38" cy="19.5" r="1.5"><animate attributeName="opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite"/></circle>
                            <circle cx="38" cy="28.5" r="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite"/></circle>
                            <circle cx="38" cy="37.5" r="1.5"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.35s" repeatCount="indefinite"/></circle>
                        </g>
                    </svg>
                </div>
                <div class="visio-node-pulse" style="box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);"></div>
            </div>
            
            <!-- Detailed Specs Panel -->
            <div class="visio-node-details">
                <div class="visio-node-header">
                    <span class="visio-node-title">DDN #${index + 1}</span>
                    <span class="visio-node-chip">${specs.name}</span>
                </div>
                
                <!-- Primary Metrics Row -->
                <div class="visio-metrics-row">
                    <div class="visio-metric visio-metric-red">
                        <span class="visio-metric-value">${specs.readThroughput}</span>
                        <span class="visio-metric-label">GB/s Read</span>
                    </div>
                    <div class="visio-metric visio-metric-red">
                        <span class="visio-metric-value">${specs.writeThroughput}</span>
                        <span class="visio-metric-label">GB/s Write</span>
                    </div>
                    <div class="visio-metric visio-metric-red">
                        <span class="visio-metric-value">${(specs.iops / 1000000).toFixed(0)}M</span>
                        <span class="visio-metric-label">IOPS</span>
                    </div>
                </div>
                
                <!-- Secondary Metrics Row -->
                <div class="visio-specs-grid">
                    <div class="visio-spec-item visio-spec-red">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.5.5 0 0 1 .5.5v1.5H10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.5V1.5A.5.5 0 0 1 8 1z"/></svg>
                        <span>${specs.power} kW</span>
                    </div>
                    <div class="visio-spec-item visio-spec-red">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/></svg>
                        <span>${specs.formFactor}</span>
                    </div>
                    <div class="visio-spec-item visio-spec-red">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13zM1.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-13z"/><path d="M2 5.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/></svg>
                        <span>${specs.maxTenants} Tenants</span>
                    </div>
                    <div class="visio-spec-item visio-spec-highlight-red">
                        <svg class="visio-spec-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/><path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0z"/></svg>
                        <span>${specs.checkpointSpeed}</span>
                    </div>
                </div>
                
                <!-- Capacity Options -->
                <div class="visio-capacity-bar">
                    <div class="visio-capacity-label">Capacity Options</div>
                    <div class="visio-capacity-options">
                        ${specs.capacityOptions.map(cap => `<span class="visio-cap-chip">${cap}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <span class="visio-node-badge" style="color: #f87171; border-color: rgba(239, 68, 68, 0.5);">EXA5</span>
            <div class="visio-status-led">
                <span class="visio-led visio-led-green" style="animation-delay: ${index * 200}ms;"></span>
                <span class="visio-status-text">Online</span>
            </div>
        </div>
    `;
}

/**
 * Create overflow indicator node - PREMIUM VERSION
 */
function createVisioOverflowNode(count, type) {
    const isCS3 = type === 'cs3';
    const color = isCS3 ? 'amber' : 'red';
    const gradient = isCS3 ? '#f59e0b' : '#ef4444';
    const label = isCS3 ? 'CS-3 Systems' : 'DDN Appliances';
    
    return `
        <div class="visio-node" style="border: 2px dashed ${gradient}40; background: linear-gradient(135deg, ${gradient}08 0%, transparent 100%);">
            <div class="visio-node-icon-wrapper">
                <div class="visio-node-icon" style="background: ${gradient}15; border: 1px dashed ${gradient}40; border-radius: 0.75rem;">
                    <svg viewBox="0 0 48 48" class="w-10 h-10" aria-hidden="true">
                        <defs>
                            <linearGradient id="overflow-grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:${gradient}"/>
                                <stop offset="100%" style="stop-color:${gradient}80"/>
                            </linearGradient>
                        </defs>
                        <circle cx="24" cy="24" r="16" fill="none" stroke="url(#overflow-grad-${type})" stroke-width="2" stroke-dasharray="6 4">
                            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="20s" repeatCount="indefinite"/>
                        </circle>
                        <text x="24" y="30" text-anchor="middle" fill="${gradient}" font-size="16" font-weight="bold" font-family="ui-monospace, monospace">+${count}</text>
                    </svg>
                </div>
            </div>
            <div class="visio-node-label">
                <span class="visio-node-title" style="color: ${gradient};">+${count} More</span>
                <span class="visio-node-subtitle">${label}</span>
            </div>
        </div>
    `;
}

/**
 * Render SVG connection lines between nodes with labels and enhanced styling
 */
function renderVisioConnections() {
    const svg = document.getElementById('connection-layer');
    if (!svg) return;
    
    const container = document.getElementById('visio-diagram');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Get node positions
    const appNode = document.getElementById('vnode-app');
    const fabricNode = document.getElementById('vnode-fabric');
    const storageFabric = document.getElementById('vnode-storage-fabric');
    const computeNodes = document.querySelectorAll('#visio-compute-row .visio-node');
    const storageNodes = document.querySelectorAll('#visio-storage-row .visio-node');
    
    // Get current tier config for dynamic labels
    const tierConfig = CONFIG.tiers[currentScale];
    const model = CONFIG.models[currentModel + 'b'] || CONFIG.models['70b'];
    const tokensPerSec = tierConfig.cs3 * (model ? model.tokensPerSecond : 2100);
    
    let content = `
        <defs>
            <!-- Gradient definitions -->
            <linearGradient id="conn-grad-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:0.8"/>
                <stop offset="50%" style="stop-color:#0ea5e9;stop-opacity:1"/>
                <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:0.8"/>
            </linearGradient>
            <linearGradient id="conn-grad-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.8"/>
                <stop offset="50%" style="stop-color:#f59e0b;stop-opacity:1"/>
                <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:0.8"/>
            </linearGradient>
            <linearGradient id="conn-grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#f87171;stop-opacity:0.8"/>
                <stop offset="50%" style="stop-color:#ef4444;stop-opacity:1"/>
                <stop offset="100%" style="stop-color:#f87171;stop-opacity:0.8"/>
            </linearGradient>
            
            <!-- Arrow markers -->
            <marker id="arrow-sky" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0,0 8,3 0,6" fill="#38bdf8"/>
            </marker>
            <marker id="arrow-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0,0 8,3 0,6" fill="#f59e0b"/>
            </marker>
            <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0,0 8,3 0,6" fill="#ef4444"/>
            </marker>
            
            <!-- Glow filters -->
            <filter id="glow-sky" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feFlood flood-color="#0ea5e9" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feFlood flood-color="#f59e0b" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feFlood flood-color="#ef4444" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
    `;
    
    // Connection from app to fabric (API requests)
    if (appNode && fabricNode) {
        const appRect = appNode.getBoundingClientRect();
        const fabRect = fabricNode.getBoundingClientRect();
        
        const x1 = appRect.left + appRect.width / 2 - containerRect.left;
        const y1 = appRect.bottom - containerRect.top;
        const x2 = fabRect.left + fabRect.width / 2 - containerRect.left;
        const y2 = fabRect.top - containerRect.top;
        const midY = (y1 + y2) / 2;
        
        content += `
            <path class="visio-connection-line visio-connection-animated" 
                  d="M${x1},${y1} C${x1},${y1 + 25} ${x2},${y2 - 25} ${x2},${y2}" 
                  stroke="url(#conn-grad-sky)" 
                  stroke-width="2.5"
                  filter="url(#glow-sky)"
                  marker-end="url(#arrow-sky)"
                  opacity="0.8"/>
            <g class="connection-label" transform="translate(${x1 + 15}, ${midY})">
                <rect x="-40" y="-12" width="80" height="24" rx="4" 
                      fill="rgba(15,23,42,0.9)" stroke="#0ea5e9" stroke-width="1" opacity="0.9"/>
                <text x="0" y="4" text-anchor="middle" fill="#38bdf8" 
                      font-size="10" font-weight="600" font-family="ui-monospace, monospace">
                    REST/gRPC
                </text>
            </g>
        `;
    }
    
    // Connections from fabric to compute nodes (inference requests)
    const computeCount = computeNodes.length;
    computeNodes.forEach((node, i) => {
        if (!fabricNode) return;
        const nodeRect = node.getBoundingClientRect();
        const fabRect = fabricNode.getBoundingClientRect();
        
        const x1 = fabRect.left + (fabRect.width / (computeCount + 1)) * (i + 1) - containerRect.left;
        const y1 = fabRect.bottom - containerRect.top;
        const x2 = nodeRect.left + nodeRect.width / 2 - containerRect.left;
        const y2 = nodeRect.top - containerRect.top;
        
        content += `
            <path class="visio-connection-line visio-connection-animated" 
                  d="M${x1},${y1} C${x1},${y1 + 30} ${x2},${y2 - 30} ${x2},${y2}" 
                  stroke="url(#conn-grad-amber)" 
                  stroke-width="2"
                  filter="url(#glow-amber)"
                  marker-end="url(#arrow-amber)"
                  opacity="0.7"
                  style="animation-delay: ${i * 100}ms"/>
        `;
        
        // Add label on middle connection only
        if (i === Math.floor(computeCount / 2)) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - 5;
            content += `
                <g class="connection-label" transform="translate(${midX + 50}, ${midY})">
                    <rect x="-45" y="-12" width="90" height="24" rx="4" 
                          fill="rgba(15,23,42,0.9)" stroke="#f59e0b" stroke-width="1" opacity="0.9"/>
                    <text x="0" y="4" text-anchor="middle" fill="#fbbf24" 
                          font-size="10" font-weight="600" font-family="ui-monospace, monospace">
                        SwarmX™ 400G
                    </text>
                </g>
            `;
        }
    });
    
    // Connections from compute to storage fabric
    computeNodes.forEach((node, i) => {
        if (!storageFabric) return;
        const nodeRect = node.getBoundingClientRect();
        const fabRect = storageFabric.getBoundingClientRect();
        
        const x1 = nodeRect.left + nodeRect.width / 2 - containerRect.left;
        const y1 = nodeRect.bottom - containerRect.top;
        const x2 = fabRect.left + (fabRect.width / (computeCount + 1)) * (i + 1) - containerRect.left;
        const y2 = fabRect.top - containerRect.top;
        
        content += `
            <path class="visio-connection-line visio-connection-animated" 
                  d="M${x1},${y1} C${x1},${y1 + 20} ${x2},${y2 - 20} ${x2},${y2}" 
                  stroke="url(#conn-grad-red)" 
                  stroke-width="1.5"
                  filter="url(#glow-red)"
                  opacity="0.6"
                  style="animation-delay: ${i * 100 + 50}ms"/>
        `;
    });
    
    // Connections from storage fabric to DDN nodes
    const storageCount = storageNodes.length;
    storageNodes.forEach((node, i) => {
        if (!storageFabric) return;
        const nodeRect = node.getBoundingClientRect();
        const fabRect = storageFabric.getBoundingClientRect();
        
        const x1 = fabRect.left + (fabRect.width / (storageCount + 1)) * (i + 1) - containerRect.left;
        const y1 = fabRect.bottom - containerRect.top;
        const x2 = nodeRect.left + nodeRect.width / 2 - containerRect.left;
        const y2 = nodeRect.top - containerRect.top;
        
        content += `
            <path class="visio-connection-line visio-connection-animated" 
                  d="M${x1},${y1} C${x1},${y1 + 20} ${x2},${y2 - 20} ${x2},${y2}" 
                  stroke="url(#conn-grad-red)" 
                  stroke-width="2"
                  filter="url(#glow-red)"
                  marker-end="url(#arrow-red)"
                  opacity="0.7"
                  style="animation-delay: ${i * 80}ms"/>
        `;
        
        // Add throughput label on middle connection
        if (i === Math.floor(storageCount / 2)) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            content += `
                <g class="connection-label" transform="translate(${midX + 55}, ${midY})">
                    <rect x="-50" y="-12" width="100" height="24" rx="4" 
                          fill="rgba(15,23,42,0.9)" stroke="#ef4444" stroke-width="1" opacity="0.9"/>
                    <text x="0" y="4" text-anchor="middle" fill="#f87171" 
                          font-size="10" font-weight="600" font-family="ui-monospace, monospace">
                        ${CONFIG.ddn.readThroughput} R/W
                    </text>
                </g>
            `;
        }
    });
    
    // Add aggregate throughput indicator at top
    if (appNode) {
        const appRect = appNode.getBoundingClientRect();
        const x = appRect.left + appRect.width / 2 - containerRect.left;
        const y = appRect.top - containerRect.top - 15;
        
        content += `
            <g class="throughput-badge" transform="translate(${x}, ${y})">
                <rect x="-70" y="-14" width="140" height="28" rx="14" 
                      fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1.5"/>
                <text x="0" y="5" text-anchor="middle" fill="#34d399" 
                      font-size="11" font-weight="700" font-family="ui-monospace, monospace">
                    ⚡ ${formatNumber(tokensPerSec)} tok/sec
                </text>
            </g>
        `;
    }
    
    svg.innerHTML = content;
}

// Re-render connections on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderVisioConnections();
    }, 250);
});

/**
 * Calculate sizing based on user input
 * Helps sales teams quickly size configurations
 */
function calculateSizing() {
    const usersInput = document.getElementById('calc-users');
    const modelSelect = document.getElementById('calc-model');
    
    if (!usersInput || !modelSelect || !CONFIG || !CONFIG.getSizingRecommendation) {
        return;
    }
    
    const users = parseInt(usersInput.value) || 1000;
    const modelSize = parseInt(modelSelect.value) || 70;
    
    const recommendation = CONFIG.getSizingRecommendation(users, modelSize);
    
    if (!recommendation) return;
    
    // Get model for token calculation
    const model = CONFIG.models[modelSize];
    const tokensPerSec = model ? recommendation.tierConfig.cs3 * model.tokensPerSecond : 0;
    
    // Update display with animation
    const tierLabel = document.getElementById('sizing-tier');
    const cs3Display = document.getElementById('sizing-cs3');
    const ddnDisplay = document.getElementById('sizing-ddn');
    const powerDisplay = document.getElementById('sizing-power');
    const tokensDisplay = document.getElementById('sizing-tokens');
    const resultCard = document.getElementById('sizing-result');
    
    // Animate the result card
    if (resultCard) {
        resultCard.classList.add('highlight');
        setTimeout(() => resultCard.classList.remove('highlight'), 500);
    }
    
    if (tierLabel) tierLabel.textContent = recommendation.tierConfig.label;
    if (cs3Display) cs3Display.textContent = recommendation.tierConfig.cs3;
    if (ddnDisplay) ddnDisplay.textContent = recommendation.tierConfig.ddn;
    if (powerDisplay) powerDisplay.textContent = recommendation.tierConfig.power;
    if (tokensDisplay) tokensDisplay.textContent = formatNumber(tokensPerSec);
    
    // Optionally sync with main cluster builder
    const slider = document.getElementById('cluster-scale');
    if (slider) {
        slider.value = recommendation.recommendedTier;
        updateClusterScale();
    }
    
    // Select the model
    selectModel(modelSize, false);
}

/**
 * Apply a preset configuration
 */
function applyPreset(users, modelSize) {
    const usersInput = document.getElementById('calc-users');
    const modelSelect = document.getElementById('calc-model');
    
    if (usersInput) usersInput.value = users;
    if (modelSelect) modelSelect.value = modelSize;
    
    calculateSizing();
}

/**
 * Initialize sizing calculator with default values
 */
function initSizingCalculator() {
    // Trigger initial calculation
    setTimeout(calculateSizing, 500);
}

// ========================================
// ADVANCED TOOLTIP & INTERACTIVE SYSTEM
// ========================================

/**
 * Create and show a detailed tooltip for diagram nodes
 */
function showNodeTooltip(event, nodeType, nodeData) {
    // Remove existing tooltip
    hideNodeTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'visio-tooltip';
    tooltip.className = 'visio-tooltip';
    
    let content = '';
    
    switch (nodeType) {
        case 'cs3':
            const specs = CONFIG.cerebras;
            const model = CONFIG.models[currentModel + 'b'] || CONFIG.models['70b'];
            content = `
                <div class="tooltip-header tooltip-header-amber">
                    <span class="tooltip-icon">⚡</span>
                    <span class="tooltip-title">Cerebras CS-3 Wafer-Scale Engine</span>
                </div>
                <div class="tooltip-body">
                    <div class="tooltip-section">
                        <span class="tooltip-label">Processing Power</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat"><strong>${specs.pflops}</strong> PFLOPS</span>
                            <span class="tooltip-stat"><strong>${specs.cores}</strong> Cores</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Memory Architecture</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat"><strong>${specs.onChipMemory}</strong> On-Chip</span>
                            <span class="tooltip-stat"><strong>${specs.memoryBandwidth}</strong> Bandwidth</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Current Model Performance</span>
                        <div class="tooltip-highlight">
                            <strong>${formatNumber(specs.tokensPerSecond[currentModel + 'b'] || 2100)}</strong> tokens/sec 
                            <span class="tooltip-dim">(${currentModel}B model)</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Infrastructure</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat">🔌 ${specs.power} kW</span>
                            <span class="tooltip-stat">❄️ ${specs.cooling} L/min</span>
                            <span class="tooltip-stat">📐 ${specs.formFactor}</span>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'ddn':
            const ddn = CONFIG.ddn;
            content = `
                <div class="tooltip-header tooltip-header-red">
                    <span class="tooltip-icon">💾</span>
                    <span class="tooltip-title">DDN AI400X² Storage System</span>
                </div>
                <div class="tooltip-body">
                    <div class="tooltip-section">
                        <span class="tooltip-label">I/O Performance</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat"><strong>${ddn.readThroughput}</strong> Read</span>
                            <span class="tooltip-stat"><strong>${ddn.writeThroughput}</strong> Write</span>
                            <span class="tooltip-stat"><strong>${formatNumber(ddn.iops)}</strong> IOPS</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Capacity Options</span>
                        <div class="tooltip-chips">
                            ${ddn.capacityOptions.map(cap => `<span class="tooltip-chip">${cap}</span>`).join('')}
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Key Features</span>
                        <div class="tooltip-highlight">
                            <strong>${ddn.checkpointSpeed}</strong> checkpoint speed
                        </div>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat">👥 ${ddn.maxTenants} Tenants</span>
                            <span class="tooltip-stat">🔌 ${ddn.power} kW</span>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'app':
            const tierConfig = CONFIG.tiers[currentScale];
            content = `
                <div class="tooltip-header tooltip-header-sky">
                    <span class="tooltip-icon">☁️</span>
                    <span class="tooltip-title">AI Application Layer</span>
                </div>
                <div class="tooltip-body">
                    <div class="tooltip-section">
                        <span class="tooltip-label">Supported Workloads</span>
                        <div class="tooltip-list">
                            <span>✓ Real-time inference</span>
                            <span>✓ RAG pipelines</span>
                            <span>✓ Fine-tuning & training</span>
                            <span>✓ Batch processing</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">API Endpoints</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat">REST /v1/completions</span>
                            <span class="tooltip-stat">gRPC streaming</span>
                            <span class="tooltip-stat">WebSocket real-time</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Current Configuration</span>
                        <div class="tooltip-highlight">
                            <strong>${tierConfig.label}</strong> cluster active
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'fabric':
            content = `
                <div class="tooltip-header tooltip-header-slate">
                    <span class="tooltip-icon">🔗</span>
                    <span class="tooltip-title">Cerebras SwarmX™ Interconnect</span>
                </div>
                <div class="tooltip-body">
                    <div class="tooltip-section">
                        <span class="tooltip-label">Network Performance</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat"><strong>400</strong> GbE</span>
                            <span class="tooltip-stat"><strong>&lt;1 μs</strong> latency</span>
                            <span class="tooltip-stat"><strong>214 PB/s</strong> aggregate</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Technologies</span>
                        <div class="tooltip-chips">
                            <span class="tooltip-chip">RDMA</span>
                            <span class="tooltip-chip">RoCE v2</span>
                            <span class="tooltip-chip">Zero-Copy</span>
                            <span class="tooltip-chip">NCCL</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Key Benefit</span>
                        <div class="tooltip-highlight">
                            Enables <strong>linear scaling</strong> of model inference across all CS-3 units
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'storage-fabric':
            const ddnSpecs = CONFIG.ddn;
            content = `
                <div class="tooltip-header tooltip-header-red">
                    <span class="tooltip-icon">📊</span>
                    <span class="tooltip-title">DDN EXAScaler / Lustre</span>
                </div>
                <div class="tooltip-body">
                    <div class="tooltip-section">
                        <span class="tooltip-label">Storage Throughput</span>
                        <div class="tooltip-stats">
                            <span class="tooltip-stat"><strong>${ddnSpecs.readThroughput}</strong> Read</span>
                            <span class="tooltip-stat"><strong>${ddnSpecs.writeThroughput}</strong> Write</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">I/O Technologies</span>
                        <div class="tooltip-chips">
                            <span class="tooltip-chip">GPUDirect Storage</span>
                            <span class="tooltip-chip">RDMA</span>
                            <span class="tooltip-chip">Parallel FS</span>
                        </div>
                    </div>
                    <div class="tooltip-section">
                        <span class="tooltip-label">Key Benefit</span>
                        <div class="tooltip-highlight">
                            <strong>${ddnSpecs.checkpointSpeed}</strong> faster model checkpointing
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    tooltip.innerHTML = content;
    document.body.appendChild(tooltip);
    
    // Position tooltip near the element
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 12;
    
    // Keep on screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
        top = rect.bottom + 12;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('visible');
}

/**
 * Hide node tooltip
 */
function hideNodeTooltip() {
    const tooltip = document.getElementById('visio-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
        setTimeout(() => tooltip.remove(), 200);
    }
}

/**
 * Initialize tooltip handlers for all diagram nodes
 */
function initDiagramTooltips() {
    // CS-3 nodes
    document.querySelectorAll('.visio-node-cs3').forEach(node => {
        node.addEventListener('mouseenter', (e) => showNodeTooltip(e, 'cs3'));
        node.addEventListener('mouseleave', hideNodeTooltip);
        node.addEventListener('focus', (e) => showNodeTooltip(e, 'cs3'));
        node.addEventListener('blur', hideNodeTooltip);
    });
    
    // DDN nodes
    document.querySelectorAll('.visio-node-ddn').forEach(node => {
        node.addEventListener('mouseenter', (e) => showNodeTooltip(e, 'ddn'));
        node.addEventListener('mouseleave', hideNodeTooltip);
        node.addEventListener('focus', (e) => showNodeTooltip(e, 'ddn'));
        node.addEventListener('blur', hideNodeTooltip);
    });
    
    // App node
    const appNode = document.getElementById('vnode-app');
    if (appNode) {
        appNode.addEventListener('mouseenter', (e) => showNodeTooltip(e, 'app'));
        appNode.addEventListener('mouseleave', hideNodeTooltip);
    }
    
    // Network fabric
    const fabricNode = document.getElementById('vnode-fabric');
    if (fabricNode) {
        fabricNode.addEventListener('mouseenter', (e) => showNodeTooltip(e, 'fabric'));
        fabricNode.addEventListener('mouseleave', hideNodeTooltip);
    }
    
    // Storage fabric
    const storageFabric = document.getElementById('vnode-storage-fabric');
    if (storageFabric) {
        storageFabric.addEventListener('mouseenter', (e) => showNodeTooltip(e, 'storage-fabric'));
        storageFabric.addEventListener('mouseleave', hideNodeTooltip);
    }
}

/**
 * Add click-to-expand detail panel for nodes
 */
function initNodeDetailPanels() {
    // Add click handler to show expanded info in sidebar or modal
    document.querySelectorAll('.visio-node').forEach(node => {
        node.addEventListener('click', function() {
            // Add active state
            document.querySelectorAll('.visio-node').forEach(n => n.classList.remove('visio-node-active'));
            this.classList.add('visio-node-active');
            
            // Trigger pulse animation
            this.classList.add('visio-node-clicked');
            setTimeout(() => this.classList.remove('visio-node-clicked'), 600);
        });
    });
}

// Initialize tooltips after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for diagram to be rendered
    setTimeout(() => {
        initDiagramTooltips();
        initNodeDetailPanels();
    }, 1000);
});
