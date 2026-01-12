/**
 * Infrastructure AI Chat Assistant
 * Focused on architecture, sizing, and application questions
 */

// AI Knowledge Base for Infrastructure
const INFRA_KNOWLEDGE = {
    // CS-3 Information
    cs3: {
        name: 'Cerebras CS-3 Wafer-Scale Engine',
        pflops: 125,
        cores: '900,000 AI-optimized cores',
        memory: '44 GB on-chip SRAM',
        bandwidth: '21 PB/sec memory bandwidth',
        power: '23 kW per unit',
        formFactor: '15U rack height',
        cooling: '100 L/min liquid cooling',
        description: 'The CS-3 is the world\'s largest and fastest AI chip. A single wafer-scale engine contains 900,000 AI-optimized cores with 44GB of on-chip SRAM memory, delivering 125 PFLOPS of AI compute. Unlike GPU clusters, the entire model fits on-chip, eliminating memory bottlenecks.',
        benefits: [
            'Single chip runs entire model - no model parallelism needed',
            'Instant inference with sub-1μs latency',
            'Linear scaling with SwarmX™ interconnect',
            'No GPU memory limits or batch size constraints'
        ]
    },
    
    // DDN Information
    ddn: {
        name: 'DDN AI400X² Storage',
        readThroughput: '90 GB/s',
        writeThroughput: '65 GB/s',
        iops: '3,000,000 IOPS',
        capacity: ['120 TB', '250 TB', '500 TB'],
        power: '2.2 kW per unit',
        formFactor: '2U rack height',
        checkpointSpeed: '15x faster than alternatives',
        maxTenants: 128,
        description: 'DDN AI400X² provides enterprise-grade parallel storage optimized for AI workloads. With Lustre/EXAScaler file system, it delivers up to 90 GB/s read throughput and supports GPUDirect Storage for zero-copy data transfer.',
        benefits: [
            'GPUDirect Storage for zero-copy transfers',
            '15x faster model checkpointing',
            'Multi-tenant with 128 isolated namespaces',
            'RDMA-enabled for lowest latency'
        ]
    },
    
    // Tier configurations
    tiers: {
        1: {
            name: 'Tier 1 - Starter',
            cs3: 2,
            ddn: 1,
            power: '48 kW',
            users: 'Up to 500 concurrent',
            tokensPerSec: '4,200 - 8,800',
            useCases: ['Development', 'Testing', 'Small-scale inference']
        },
        2: {
            name: 'Tier 2 - Growth',
            cs3: 4,
            ddn: 2,
            power: '96 kW',
            users: '500 - 2,500 concurrent',
            tokensPerSec: '8,400 - 17,600',
            useCases: ['Production workloads', 'RAG pipelines', 'Fine-tuning']
        },
        3: {
            name: 'Tier 3 - Enterprise',
            cs3: 8,
            ddn: 4,
            power: '192 kW',
            users: '2,500+ concurrent',
            tokensPerSec: '16,800 - 35,200',
            useCases: ['Large-scale production', 'Training', 'Multi-tenant SaaS']
        }
    },
    
    // Model support
    models: {
        '8B': { name: 'Llama 3 8B', tokensPerSec: 4400, useCases: ['Chatbots', 'Simple Q&A'] },
        '70B': { name: 'Llama 3 70B', tokensPerSec: 2100, useCases: ['Complex reasoning', 'Code generation'] },
        '111B': { name: 'Llama 3 111B', tokensPerSec: 1150, useCases: ['Advanced analysis', 'Multimodal'] },
        '405B': { name: 'Llama 3 405B', tokensPerSec: 969, useCases: ['Frontier tasks', 'Research'] }
    },
    
    // Use cases
    useCases: {
        fintech: 'Real-time fraud detection, risk analysis, trading algorithms',
        healthcare: 'Medical imaging, clinical NLP, drug discovery',
        legal: 'Contract analysis, case research, compliance automation',
        retail: 'Recommendation engines, demand forecasting, pricing optimization',
        government: 'Citizen services, document processing, security analytics',
        telecom: 'Network optimization, customer service, predictive maintenance'
    }
};

// Generate AI response based on question
function generateResponse(question) {
    const q = question.toLowerCase();
    
    // CS-3 questions
    if (q.includes('cs-3') || q.includes('cs3') || q.includes('wafer') || q.includes('cerebras')) {
        const cs3 = INFRA_KNOWLEDGE.cs3;
        return `
            <p><strong>${cs3.name}</strong></p>
            <p>${cs3.description}</p>
            <p><strong>Key Specifications:</strong></p>
            <ul>
                <li>⚡ <strong>${cs3.pflops} PFLOPS</strong> of AI compute</li>
                <li>🧠 <strong>${cs3.cores}</strong></li>
                <li>💾 <strong>${cs3.memory}</strong> on-chip SRAM</li>
                <li>🔗 <strong>${cs3.bandwidth}</strong> memory bandwidth</li>
                <li>🔌 ${cs3.power} power consumption</li>
            </ul>
            <p><strong>Key Benefits:</strong></p>
            <ul>
                ${cs3.benefits.map(b => `<li>✓ ${b}</li>`).join('')}
            </ul>
        `;
    }
    
    // DDN/Storage questions
    if (q.includes('ddn') || q.includes('storage') || q.includes('ai400')) {
        const ddn = INFRA_KNOWLEDGE.ddn;
        return `
            <p><strong>${ddn.name}</strong></p>
            <p>${ddn.description}</p>
            <p><strong>Performance:</strong></p>
            <ul>
                <li>📖 Read: <strong>${ddn.readThroughput}</strong></li>
                <li>✏️ Write: <strong>${ddn.writeThroughput}</strong></li>
                <li>⚡ <strong>${ddn.iops}</strong></li>
                <li>🚀 <strong>${ddn.checkpointSpeed}</strong> checkpointing</li>
            </ul>
            <p><strong>Capacity Options:</strong> ${ddn.capacity.join(', ')}</p>
        `;
    }
    
    // Sizing questions
    if (q.includes('siz') || q.includes('users') || q.includes('concurrent') || q.includes('recommend')) {
        const usersMatch = q.match(/(\d+)\s*(k|thousand)?/);
        let users = usersMatch ? parseInt(usersMatch[1]) * (usersMatch[2] ? 1000 : 1) : 1000;
        
        let tier;
        if (users <= 500) tier = INFRA_KNOWLEDGE.tiers[1];
        else if (users <= 2500) tier = INFRA_KNOWLEDGE.tiers[2];
        else tier = INFRA_KNOWLEDGE.tiers[3];
        
        return `
            <p><strong>Sizing Recommendation for ${users.toLocaleString()} users:</strong></p>
            <p>I recommend <strong>${tier.name}</strong></p>
            <ul>
                <li>🖥️ <strong>${tier.cs3}x CS-3</strong> compute units</li>
                <li>💾 <strong>${tier.ddn}x DDN</strong> storage units</li>
                <li>🔌 Total power: <strong>${tier.power}</strong></li>
                <li>⚡ Throughput: <strong>${tier.tokensPerSec}</strong> tokens/sec</li>
            </ul>
            <p><strong>Best for:</strong> ${tier.useCases.join(', ')}</p>
            <p>Use the <strong>Sizing Calculator</strong> above for precise configurations based on your model choice.</p>
        `;
    }
    
    // Model questions
    if (q.includes('model') || q.includes('llama') || q.includes('run') || q.includes('support')) {
        const models = INFRA_KNOWLEDGE.models;
        return `
            <p><strong>Supported Models:</strong></p>
            <p>Our infrastructure supports all major open-source LLMs:</p>
            <ul>
                ${Object.entries(models).map(([size, m]) => 
                    `<li><strong>${m.name}</strong> - ${m.tokensPerSec.toLocaleString()} tok/sec<br/>
                     <small>Use cases: ${m.useCases.join(', ')}</small></li>`
                ).join('')}
            </ul>
            <p>The CS-3's on-chip memory means even 405B parameter models run without model parallelism or memory constraints.</p>
        `;
    }
    
    // Tier comparison
    if (q.includes('tier') || q.includes('compare')) {
        const tiers = INFRA_KNOWLEDGE.tiers;
        return `
            <p><strong>Configuration Tiers Comparison:</strong></p>
            <table style="width:100%; font-size: 0.85rem; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid rgba(148,163,184,0.3);">
                    <th style="text-align:left; padding: 0.5rem 0;">Tier</th>
                    <th>CS-3</th>
                    <th>DDN</th>
                    <th>Power</th>
                    <th>Users</th>
                </tr>
                ${Object.entries(tiers).map(([num, t]) => `
                    <tr style="border-bottom: 1px solid rgba(148,163,184,0.15);">
                        <td style="padding: 0.5rem 0;"><strong>${t.name}</strong></td>
                        <td style="text-align:center;">${t.cs3}</td>
                        <td style="text-align:center;">${t.ddn}</td>
                        <td style="text-align:center;">${t.power}</td>
                        <td>${t.users}</td>
                    </tr>
                `).join('')}
            </table>
            <p style="margin-top: 1rem;">Each tier is designed for specific scale requirements. Start with Tier 1 for development, scale to Tier 3 for enterprise production.</p>
        `;
    }
    
    // Use case questions
    if (q.includes('use case') || q.includes('fintech') || q.includes('healthcare') || q.includes('legal') || q.includes('retail')) {
        const useCases = INFRA_KNOWLEDGE.useCases;
        return `
            <p><strong>Industry Use Cases:</strong></p>
            <ul>
                ${Object.entries(useCases).map(([industry, desc]) => 
                    `<li><strong>${industry.charAt(0).toUpperCase() + industry.slice(1)}:</strong> ${desc}</li>`
                ).join('')}
            </ul>
            <p>Each use case can be optimized with the right tier and model combination. Would you like a specific recommendation?</p>
        `;
    }
    
    // Architecture overview
    if (q.includes('architecture') || q.includes('how does') || q.includes('overview')) {
        return `
            <p><strong>VCB-AI Infrastructure Architecture:</strong></p>
            <p>Our stack consists of four integrated layers:</p>
            <ol>
                <li><strong>Application Layer</strong> - REST/gRPC APIs for inference, RAG, and fine-tuning</li>
                <li><strong>SwarmX™ Network Fabric</strong> - 400 GbE, sub-microsecond latency interconnect</li>
                <li><strong>Compute Layer</strong> - Cerebras CS-3 wafer-scale engines (125 PFLOPS each)</li>
                <li><strong>Storage Layer</strong> - DDN AI400X² with Lustre parallel file system</li>
            </ol>
            <p>The diagram above shows the complete data flow from application requests through compute to storage.</p>
        `;
    }
    
    // Power/datacenter questions
    if (q.includes('power') || q.includes('datacenter') || q.includes('pretoria')) {
        return `
            <p><strong>Datacenter & Power:</strong></p>
            <p>Our Pretoria datacenter provides sovereign AI infrastructure for South Africa:</p>
            <ul>
                <li>🏢 <strong>POPIA Compliant</strong> - Data stays in South Africa</li>
                <li>⚡ <strong>N+1 Power</strong> - Redundant power systems</li>
                <li>❄️ <strong>Liquid Cooling</strong> - 100 L/min per CS-3</li>
                <li>🔒 <strong>ISO 27001</strong> - Security certified</li>
            </ul>
            <p>Power consumption scales with configuration:</p>
            <ul>
                <li>Tier 1: ~48 kW</li>
                <li>Tier 2: ~96 kW</li>
                <li>Tier 3: ~192 kW</li>
            </ul>
        `;
    }
    
    // Default response
    return `
        <p>I can help you with questions about:</p>
        <ul>
            <li>🔥 <strong>CS-3</strong> - Cerebras wafer-scale compute</li>
            <li>💾 <strong>DDN</strong> - AI-optimized storage</li>
            <li>📏 <strong>Sizing</strong> - Cluster recommendations for your users</li>
            <li>🤖 <strong>Models</strong> - Supported LLMs and performance</li>
            <li>🏗️ <strong>Architecture</strong> - How the stack works together</li>
            <li>💼 <strong>Use cases</strong> - Industry-specific applications</li>
        </ul>
        <p>Try asking something like "What is CS-3?" or "How do I size for 1000 users?"</p>
    `;
}

// Add message to chat
function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${isUser ? 'ai-message-user' : 'ai-message-assistant'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'ai-message-bubble';
    
    if (isUser) {
        bubble.textContent = content;
    } else {
        bubble.innerHTML = content;
    }
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Animate in
    setTimeout(() => messageDiv.classList.add('visible'), 10);
}

// Show typing indicator
function showTyping() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'ai-typing';
    typingDiv.className = 'ai-message ai-message-assistant';
    typingDiv.innerHTML = `
        <div class="ai-typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
    const typing = document.getElementById('ai-typing');
    if (typing) typing.remove();
}

// Handle user input
function handleUserInput() {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    
    const question = input.value.trim();
    if (!question) return;
    
    // Add user message
    addMessage(question, true);
    
    // Clear input
    input.value = '';
    
    // Show typing
    showTyping();
    
    // Hide quick actions after first question
    const quickActions = document.querySelector('.ai-quick-actions');
    if (quickActions) quickActions.style.display = 'none';
    
    // Generate response after delay
    setTimeout(() => {
        hideTyping();
        const response = generateResponse(question);
        addMessage(response, false);
    }, 800 + Math.random() * 400);
}

// Initialize chat
function initAIChat() {
    const toggle = document.getElementById('ai-chat-toggle');
    const panel = document.getElementById('ai-chat-panel');
    const closeBtn = document.getElementById('ai-chat-close');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const quickBtns = document.querySelectorAll('.ai-quick-btn');
    
    if (!toggle || !panel) return;
    
    // Toggle panel
    toggle.addEventListener('click', () => {
        const isOpen = panel.classList.contains('open');
        panel.classList.toggle('open');
        panel.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        toggle.setAttribute('aria-expanded', !isOpen);
        
        if (!isOpen && input) {
            setTimeout(() => input.focus(), 300);
        }
    });
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
        });
    }
    
    // Send message
    if (sendBtn) {
        sendBtn.addEventListener('click', handleUserInput);
    }
    
    // Enter key
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserInput();
        });
    }
    
    // Quick action buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            if (question && input) {
                input.value = question;
                handleUserInput();
            }
        });
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initAIChat);
