/**
 * Infrastructure Configuration Data
 * Real specs from Cerebras and DDN documentation
 * Data source: CerebrasDDN.json - January 2026
 */

const CONFIG = {
    // Cerebras CS-3 Specifications (from official documentation)
    cerebras: {
        name: "Cerebras CS-3",
        chip: "Wafer Scale Engine 3 (WSE-3)",
        power: 23, // kW per system (Up to 23 kW per CS-3 system)
        rackPower: 34, // kW provisioned per rack with 4x 60A/208V power drops
        cooling: 100, // L/min water flow rate (100 ± 10 l/min)
        coolingTemp: 20, // °C (20 ± 2°C)
        airflow: 1800, // CFM (liquid-cooled), 2800 CFM air-cooled
        pflops: 125, // PetaFLOPS per WSE-3
        transistors: "4 Trillion",
        cores: "900,000",
        onChipMemory: "44 GB",
        memoryBandwidth: "21 PB/sec",
        coreToCoresBandwidth: "214 PB/sec",
        formFactor: "15U",
        // Real-world inference performance (from Cerebras documentation)
        tokensPerSecond: {
            "8b": 2200,   // Llama 3.1 8B - ~2,200 tokens/s
            "12b": 1900,  // Mistral NeMO 12B
            "70b": 2100,  // Llama 3.3 70B - ~2,100 tokens/s (sustained for 1-10 users)
            "120b": 3045, // OpenAI GPT OSS 120B - 3,045 tokens/s (15x faster than GPU cloud)
            "405b": 450   // Llama 3.1 405B
        },
        maxSystems: 2048,
        maxParams: "24 Trillion",
        aggregateExaflops: 256, // 2048-system cluster
        memoryXRange: { min: 12, max: 1200 }, // TB off-chip MemoryX storage per system
        // User capacity: Cerebras sustains ~2,700 tokens/s for 1 or 10 users
        sustainedTokensPerSec: 2700,
        userCapacityNote: "Performance maintained as workload scales - no GPU memory bottlenecks"
    },

    // DDN AI400X2 Specifications (from official documentation)
    ddn: {
        name: "DDN AI400X2",
        readThroughput: 90, // GB/s per appliance (peak 110 GB/s for Turbo)
        writeThroughput: 65, // GB/s per appliance
        iops: 3000000, // 3 Million IOPS
        power: 2.2, // kW per appliance
        turboPower: 25, // kW nominal for AI400X2 Turbo configuration
        cooling: 7.4, // kBTU/hr per appliance
        turboCooling: 87, // kBTU/hr for 127 HGX H100 systems
        formFactor: "2U",
        capacityOptions: ["120 TB", "250 TB", "500 TB"],
        maxAppliances: 76, // 64 data + 12 metadata
        maxGPUs: 2048,
        maxTenants: 128,
        scalingRatio: "1 MDS : 6 OSS", // Metadata to Data appliance ratio
        checkpointSpeed: "15x faster",
        dataLoadSpeed: "4x faster",
        gpuProductivityBoost: "25%",
        // Aggregate performance at scale
        maxReadThroughput: 17.6, // TB/s (2047 HGX systems)
        maxWriteThroughput: 11.2, // TB/s (2047 HGX systems)
        perGpuTarget: { read: 1.1, write: 0.7 } // GB/s per H100 GPU target
    },

    // Cluster Scaling Configurations with real power/cooling data
    clusterTiers: {
        1: { 
            cs3: 1, ddn: 2, power: 27, cooling: 100, pflops: 125, 
            label: "Starter",
            users: 50,
            description: "Entry-level sovereign AI for small teams"
        },
        2: { 
            cs3: 2, ddn: 4, power: 55, cooling: 200, pflops: 250, 
            label: "Team",
            users: 100,
            description: "Production workloads for development teams"
        },
        3: { 
            cs3: 4, ddn: 6, power: 105, cooling: 400, pflops: 500, 
            label: "Department",
            users: 250,
            description: "Multi-team deployment with high availability"
        },
        4: { 
            cs3: 8, ddn: 12, power: 210, cooling: 800, pflops: 1000, 
            label: "Enterprise",
            users: 500,
            description: "Enterprise-wide AI platform"
        },
        5: { 
            cs3: 16, ddn: 20, power: 415, cooling: 1600, pflops: 2000, 
            label: "Large Enterprise",
            users: 1000,
            description: "Multi-division enterprise deployment"
        },
        6: { 
            cs3: 32, ddn: 38, power: 820, cooling: 3200, pflops: 4000, 
            label: "Regional",
            users: 2500,
            description: "Regional hub serving multiple enterprises"
        },
        7: { 
            cs3: 64, ddn: 64, power: 1550, cooling: 6400, pflops: 8000, 
            label: "National",
            users: 5000,
            description: "National-scale sovereign AI infrastructure"
        },
        8: { 
            cs3: 128, ddn: 128, power: 3100, cooling: 12800, pflops: 16000, 
            label: "Sovereign",
            users: 10000,
            description: "Maximum sovereign scale for nation-states"
        }
    },

    // Use Case Configurations (from real customer deployments)
    useCases: {
        fintech: {
            name: "Financial Services",
            icon: "account_balance",
            color: "emerald",
            description: "Trading, fraud detection, and financial forecasting",
            citation: "https://www.cerebras.ai/industry-financial-services",
            recommendedTier: 3,
            recommendedModel: 70,
            typicalUsers: 500,
            features: [
                "NLP model training with domain-specific financial datasets",
                "Real-time fraud detection via transaction data analysis",
                "Algorithmic trading with sub-millisecond inference",
                "Portfolio management and financial forecasting",
                "60% lower latency vs cloud alternatives"
            ],
            metrics: {
                latencyReduction: "60%",
                complianceCoverage: "100%",
                trainingSpeedup: "20x"
            }
        },
        insurance: {
            name: "Insurance",
            icon: "shield",
            color: "blue",
            description: "Claims processing, risk assessment, and document AI",
            citation: "https://www.cerebras.ai/industry-financial-services",
            recommendedTier: 2,
            recommendedModel: 70,
            typicalUsers: 200,
            features: [
                "Automated claims processing and fraud management",
                "Risk assessment using domain-specific NLP models",
                "Document analysis of policy records and databases",
                "Transaction data analysis for fraud detection",
                "Significantly reduced time-to-insight"
            ],
            metrics: {
                fraudDetection: "Real-time",
                documentProcessing: "10x faster",
                claimsAutomation: "80%"
            }
        },
        banking: {
            name: "Banking & Customer Service",
            icon: "account_balance_wallet",
            color: "indigo",
            description: "AI agents for customer support, sales, and compliance",
            citation: "https://www.cerebras.ai/blog/sei-ai-revolutionizing-financial-services-support-with-cerebras-powered-agents",
            recommendedTier: 4,
            recommendedModel: 70,
            typicalUsers: 1000,
            features: [
                "Automated 24/7 customer support, sales, and activation calls",
                "Real-time compliance monitoring and risk identification",
                "Human agent scoring, coaching, and complaint monitoring",
                "100% conversation coverage (vs 5% manual sampling)",
                "40% reduction in serverless container runtimes"
            ],
            metrics: {
                latencyReduction: "60%",
                coverageIncrease: "20x",
                runtimeReduction: "40%"
            }
        },
        telco: {
            name: "Telecommunications",
            icon: "cell_tower",
            color: "purple",
            description: "Network optimization, customer AI, and GPUaaS",
            citation: "https://www.ddn.com/resources/success-stories/ddn-powers-gpuaas-innovation-with-exascaler-for-sk-telecoms-petasus-ai-cloud/",
            recommendedTier: 5,
            recommendedModel: 405,
            typicalUsers: 2000,
            features: [
                "GPU-as-a-Service (GPUaaS) for enterprises and research",
                "Network optimization & predictive maintenance",
                "24/7 AI customer service automation",
                "Multi-tenant isolation with integrated orchestration",
                "Hybrid cloud-bursting capabilities"
            ],
            metrics: {
                gpuUtilization: "95%+",
                checkpointSpeed: "15x faster",
                dataMovement: "100x faster"
            },
            deployments: ["SK Telecom Petasus AI Cloud", "Enterprise service providers"]
        },
        research: {
            name: "Research & HPC",
            icon: "science",
            color: "orange",
            description: "Model training, simulation, and sovereign AI development",
            citation: "https://www.ddn.com/customers/",
            recommendedTier: 6,
            recommendedModel: 1000,
            typicalUsers: 500,
            features: [
                "Train LLMs from scratch on local infrastructure",
                "Large-scale time series and graph model training",
                "100+ PB storage for massive research datasets",
                "15x faster checkpoints eliminate training interruptions",
                "No complex multi-GPU parallel programming required"
            ],
            metrics: {
                storageScale: "100+ PB",
                checkpointSpeed: "15x faster",
                programmingOverhead: "Eliminated"
            },
            deployments: ["U.S. Department of Energy", "Purdue University", "NCSA", "Helmholtz Munich"]
        },
        healthcare: {
            name: "Healthcare & Pharma",
            icon: "medical_services",
            color: "teal",
            description: "Medical AI, drug discovery, and biotech research",
            citation: "https://www.ddn.com/customers/",
            recommendedTier: 4,
            recommendedModel: 405,
            typicalUsers: 300,
            features: [
                "Medical imaging AI and oncology insights",
                "Drug discovery and compound analysis",
                "Biotech research with sovereign data handling",
                "HPCSA-compliant patient data processing",
                "Local dialect LLM training for accessibility"
            ],
            metrics: {
                dataCompliance: "HPCSA/POPIA",
                imagingSpeed: "Real-time",
                dataSovereignty: "100%"
            },
            deployments: ["UTSW Medical Center", "Scripps Research"]
        },
        government: {
            name: "Government & Defence",
            icon: "assured_workload",
            color: "slate",
            description: "Sovereign AI with air-gapped deployment options",
            recommendedTier: 7,
            recommendedModel: 405,
            typicalUsers: 1000,
            features: [
                "100% data sovereignty — no cloud exposure",
                "Air-gapped deployment options available",
                "Secure document processing & intelligence",
                "POPIA and national security compliance",
                "On-soil processing for classified workloads"
            ],
            metrics: {
                dataSovereignty: "100%",
                cloudExposure: "Zero",
                compliance: "Full"
            }
        },
        energy: {
            name: "Energy & Mining",
            icon: "bolt",
            color: "yellow",
            description: "Exploration, optimization, and safety AI",
            recommendedTier: 5,
            recommendedModel: 405,
            typicalUsers: 500,
            features: [
                "Seismic data processing & geological modeling",
                "Predictive maintenance for critical assets",
                "Safety monitoring & anomaly detection",
                "Real-time analytics for operations",
                "Massive dataset processing capabilities"
            ],
            metrics: {
                dataProcessing: "Petabyte-scale",
                maintenancePrediction: "Predictive",
                safetyMonitoring: "Real-time"
            }
        }
    },

    // Model Configurations with real performance data
    models: {
        8: {
            name: "8 Billion",
            examples: "Llama 3.1 8B",
            tokensPerSecond: 2200,
            minCS3: 1,
            maxSequenceLength: "128K",
            usersPerCS3: 100, // Estimated concurrent users per CS-3
            description: "Fast inference for chatbots and lightweight tasks"
        },
        12: {
            name: "12 Billion",
            examples: "Mistral NeMO 12B",
            tokensPerSecond: 1900,
            minCS3: 1,
            maxSequenceLength: "128K",
            usersPerCS3: 80,
            description: "Balanced performance for instruction following and coding"
        },
        70: {
            name: "70 Billion",
            examples: "Llama 3.3 70B / DeepSeek",
            tokensPerSecond: 2100,
            minCS3: 1,
            maxSequenceLength: "128K",
            usersPerCS3: 50, // Sustained ~2,700 tok/s for 1-10 users, scales linearly
            description: "Production-ready for most enterprise use cases"
        },
        120: {
            name: "120 Billion",
            examples: "OpenAI GPT OSS 120B",
            tokensPerSecond: 3045,
            minCS3: 2,
            maxSequenceLength: "128K",
            usersPerCS3: 40,
            description: "15x faster than leading GPU cloud providers"
        },
        405: {
            name: "405 Billion",
            examples: "Llama 3.1 405B",
            tokensPerSecond: 450,
            minCS3: 2,
            maxSequenceLength: "128K",
            usersPerCS3: 20,
            description: "Frontier-class reasoning, analysis, and complex tasks"
        },
        1000: {
            name: "1 Trillion+",
            examples: "Custom MoE / Multi-expert",
            tokensPerSecond: 200,
            minCS3: 4,
            maxSequenceLength: "128K+",
            usersPerCS3: 10,
            description: "Maximum capability with up to 24T parameters"
        }
    },

    // User Capacity Calculator
    calculateCapacity: function(cs3Count, modelSize) {
        const model = this.models[modelSize];
        if (!model) return { users: 0, tokensPerSec: 0 };
        
        const usersPerCS3 = model.usersPerCS3 || 50;
        const totalUsers = cs3Count * usersPerCS3;
        const totalTokens = cs3Count * model.tokensPerSecond;
        
        return {
            users: totalUsers,
            tokensPerSec: totalTokens,
            responseTime: Math.round(100 / model.tokensPerSecond * 1000), // ms per 100 tokens
            note: `Sustained performance for ${totalUsers} concurrent users`
        };
    },

    // Sizing Recommendations
    getSizingRecommendation: function(users, modelSize) {
        const model = this.models[modelSize];
        if (!model) return null;
        
        const usersPerCS3 = model.usersPerCS3 || 50;
        const requiredCS3 = Math.ceil(users / usersPerCS3);
        const requiredDDN = Math.ceil(requiredCS3 * 1.5); // DDN scaling ratio
        
        // Find matching tier
        let recommendedTier = 1;
        for (let tier = 1; tier <= 8; tier++) {
            if (this.clusterTiers[tier].cs3 >= requiredCS3) {
                recommendedTier = tier;
                break;
            }
        }
        
        return {
            requiredCS3: requiredCS3,
            requiredDDN: requiredDDN,
            recommendedTier: recommendedTier,
            tierConfig: this.clusterTiers[recommendedTier],
            estimatedPower: requiredCS3 * this.cerebras.power + requiredDDN * this.ddn.power,
            estimatedCooling: requiredCS3 * this.cerebras.cooling
        };
    },

    // Component Info Templates
    componentInfo: {
        app: {
            title: "Application Layer",
            icon: "terminal",
            color: "sky",
            specs: [
                { label: "Inference API", value: "REST / gRPC" },
                { label: "RAG Support", value: "Built-in" },
                { label: "Fine-Tuning", value: "LoRA / Full" },
                { label: "Frameworks", value: "PyTorch, JAX" },
                { label: "Max Sequence", value: "128K tokens" }
            ],
            description: "Deploy your AI applications with enterprise-grade APIs. Full support for inference, RAG pipelines, and fine-tuning workflows. Supports Llama, Mistral, and custom models."
        },
        cerebras: {
            title: "Cerebras CS-3",
            icon: "memory",
            color: "amber",
            specs: [
                { label: "Performance", value: "125 PetaFLOPS" },
                { label: "Transistors", value: "4 Trillion" },
                { label: "AI Cores", value: "900,000" },
                { label: "On-Chip Memory", value: "44 GB SRAM" },
                { label: "Memory BW", value: "21 PB/sec" },
                { label: "Core-to-Core BW", value: "214 PB/sec" },
                { label: "Power", value: "23 kW" },
                { label: "Cooling", value: "100 L/min @ 20°C" },
                { label: "Form Factor", value: "15U" },
                { label: "Llama 70B", value: "2,100 tok/s" },
                { label: "Max Cluster", value: "2,048 systems" }
            ],
            description: "The world's largest and fastest AI chip. Single chip runs entire 70B+ models without sharding.",
            advantages: [
                "20x faster inference than GPU clusters for large models",
                "Sustained ~2,700 tokens/s for 1-10 users without degradation",
                "Single chip runs entire 70B model - no model sharding",
                "No complex multi-GPU parallelism or NCCL overhead",
                "56x lower memory latency vs. HBM-based solutions",
                "Scales to 256 exaflops with 2,048 systems via SwarmX",
                "50% lower TCO than equivalent GPU infrastructure"
            ]
        },
        ddn: {
            title: "DDN AI400X2",
            icon: "dns",
            color: "red",
            specs: [
                { label: "Read Throughput", value: "90-110 GB/s" },
                { label: "Write Throughput", value: "65 GB/s" },
                { label: "IOPS", value: "3 Million" },
                { label: "Capacity Options", value: "120-500 TB" },
                { label: "Max Scale", value: "17.6 TB/s read" },
                { label: "Power", value: "2.2 kW" },
                { label: "Form Factor", value: "2U" },
                { label: "Checkpoints", value: "15x faster" },
                { label: "Data Loading", value: "4x faster" },
                { label: "GPU Boost", value: "+25% productivity" }
            ],
            description: "Enterprise-grade parallel file storage (Lustre) purpose-built for AI/ML workloads. Validated with NVIDIA SuperPOD.",
            advantages: [
                "15x faster checkpoint saves vs. enterprise flash arrays",
                "4x faster data loading - eliminates GPU starvation",
                "25% improvement in GPU productivity",
                "100x faster data movement vs. traditional storage",
                "Scales to 100+ PB with linear performance",
                "True parallel file system (Lustre) vs. block storage",
                "Deploys in hours with 4x less rack space",
                "60% lower storage TCO than all-flash arrays"
            ]
        }
    },

    // Pretoria Datacenter
    pretoriaDC: {
        name: "Pretoria Datacenter (PTA-DC1)",
        tier: "Tier 3+",
        features: [
            "POPIA Compliant",
            "99.99% SLA",
            "Liquid Cooling Ready",
            "Redundant Power (2N)",
            "24/7 NOC Support",
            "Physical Security",
            "Fiber Connectivity"
        ],
        address: "Pretoria, Gauteng, South Africa",
        supportedConfigurations: "All tiers from Starter to Sovereign"
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
