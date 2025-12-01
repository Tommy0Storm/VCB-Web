import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  RiRobot2Line, 
  RiCloseLine, 
  RiSendPlaneFill,
  RiMicLine,
  RiMicOffLine,
  RiMailSendLine,
  RiVolumeUpLine,
  RiVolumeMuteLine,
  RiUserLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiHistoryLine,
  RiDeleteBinLine,
  RiPhoneLine,
} from 'react-icons/ri';
import './SarahChat.css';
import { useSarahMemory } from '../../lib/useSarahMemory';
import { clearAllData, exportAllData } from '../../lib/sarahMemory';
import { GeminiVoiceModal } from './GeminiVoiceModal';

// Web Speech API type definitions
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
  }
}

// ============================================================
// SARAH AI - VCB KNOWLEDGE BASE
// ============================================================
const VCB_KNOWLEDGE = {
  company: {
    name: "Viable Core Business (VCB)",
    tagline: "The First AI That Talks, Hears & Sees in All 11 Official South African Languages",
    mission: "Human-first AI agents for revenue & support. Production-ready conversational agents built with enterprise-grade security.",
    focus: "AI-first venture builder focused on making artificial intelligence useful, secure, and compliant for African enterprise.",
    location: "South Africa",
    email: "info@vcb-ai.online",
    languages: ["Zulu", "Xhosa", "Afrikaans", "English", "Sotho", "Tswana", "Venda", "Tsonga", "Swati", "Ndebele", "Pedi"],
  },
  leadership: {
    ceo: {
      name: "Dawn Beech",
      role: "CEO & Co-founder",
      description: "A seasoned technology professional with extensive experience delivering solutions across industries in South Africa. Dawn is driving the creation of an AI-native business designed to operate across multiple sectors of the economy, built on Advisory Services, Project Delivery Services, and Product Development.",
      vision: "To establish one of Africa's leading AI services and product development companies, with capabilities spanning the full AI value chain—from strategy to execution.",
      linkedIn: "https://za.linkedin.com/in/dawnbeech",
    },
    clo: {
      name: "Advocate Nandi Basson",
      role: "Chief Legal Officer & Co-founder",
      description: "An advocate dedicated to navigating complexity to find just outcomes. From labour disputes and civil claims to corporate litigation and constitutional challenges, her work has always been at the intersection of systems and people.",
      vision: "To ensure AI innovations are built with empathy and foresight. Embedding compliance into products from the outset, upholding POPIA, and ensuring responsible innovation.",
      linkedIn: "https://za.linkedin.com/in/nandi-basson",
    },
    cto: {
      name: "Tommy Ferreira",
      role: "CTO & Co-founder",
      description: "A builder of systems and strategist of transformation with three decades of experience, from mainframes to AI. He brings together advisory insight, delivery execution, and product innovation into a single continuum.",
      vision: "AI can be more than a tool of efficiency—it can be a national enabler that streamlines systems, empowers businesses, and uplifts communities.",
      linkedIn: "https://za.linkedin.com/in/tommy-ferreira-cissp",
    },
  },
  products: {
    sarah: {
      name: "Sarah Voice Agent",
      description: "Production-ready multilingual voice AI for customer service and sales automation. Natural speech recognition and synthesis across all 11 official South African languages.",
    },
    agenticAI: {
      name: "Agentic AI Platform",
      description: "Build, deploy and orchestrate autonomous AI agents for complex enterprise workflows.",
    },
    llmEnterprise: {
      name: "LLM Enterprise",
      description: "Fine-tuned large language models for legal, finance, and regulated industries.",
    },
    salesAgent: {
      name: "Sales Agent",
      description: "AI-powered sales automation with multilingual support for African markets.",
    },
  },
  sovereignAI: {
    definition: "Sovereign AI refers to artificial intelligence systems that are developed, deployed, and controlled within a nation's borders, ensuring data sovereignty and compliance with local regulations.",
    vcbApproach: "VCB builds sovereign localized AI that keeps data in Africa, respects POPIA regulations, and understands the cultural and linguistic nuances of Southern African communities.",
    benefits: [
      "Data stays within South African borders",
      "POPIA and local regulatory compliance",
      "Cultural and linguistic accuracy",
      "Reduced latency for local users",
      "Support for local economic development",
      "Protection against foreign data exploitation",
    ],
  },
  security: {
    compliance: ["SOC 2 Compliant", "POPIA Ready", "End-to-End Encrypted"],
    features: ["Zero-trust architecture", "Comprehensive audit trails", "Enterprise-grade encryption"],
  },
  stats: {
    languages: 11,
    uptime: "99.7%",
    responseTime: "50ms",
    support: "24/7",
  },
};

// Simple response generator based on keywords
const generateResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();
  
  // Greetings
  if (msg.match(/^(hi|hello|hey|howzit|good morning|good afternoon|good evening)/)) {
    return `Hello! I'm Sarah, VCB's AI assistant. I can help you learn about Viable Core Business, our products, our founder Tommy Storm, or sovereign localized AI. What would you like to know?`;
  }
  
  // About VCB
  if (msg.includes('vcb') || msg.includes('viable core') || msg.includes('company') || msg.includes('about')) {
    return `${VCB_KNOWLEDGE.company.name} is ${VCB_KNOWLEDGE.company.focus}\n\nOur tagline: "${VCB_KNOWLEDGE.company.tagline}"\n\nWe support all 11 official South African languages: ${VCB_KNOWLEDGE.company.languages.join(', ')}.`;
  }
  
  // Founder / Leadership
  if (msg.includes('founder') || msg.includes('ceo') || msg.includes('who started') || msg.includes('who created') || msg.includes('dawn') || msg.includes('leadership') || msg.includes('team')) {
    return `VCB was co-founded by three leaders:\n\n**${VCB_KNOWLEDGE.leadership.ceo.name}** - ${VCB_KNOWLEDGE.leadership.ceo.role}\n${VCB_KNOWLEDGE.leadership.ceo.description}\n\n**${VCB_KNOWLEDGE.leadership.clo.name}** - ${VCB_KNOWLEDGE.leadership.clo.role}\n${VCB_KNOWLEDGE.leadership.clo.description}\n\n**${VCB_KNOWLEDGE.leadership.cto.name}** - ${VCB_KNOWLEDGE.leadership.cto.role}\n${VCB_KNOWLEDGE.leadership.cto.description}`;
  }
  
  // CTO / Tommy
  if (msg.includes('tommy') || msg.includes('cto') || msg.includes('chief technology')) {
    return `**${VCB_KNOWLEDGE.leadership.cto.name}** is the ${VCB_KNOWLEDGE.leadership.cto.role} of VCB.\n\n${VCB_KNOWLEDGE.leadership.cto.description}\n\nHis vision: "${VCB_KNOWLEDGE.leadership.cto.vision}"`;
  }
  
  // CLO / Legal / Advocate Basson
  if (msg.includes('advocate') || msg.includes('basson') || msg.includes('nandi') || msg.includes('clo') || msg.includes('legal') || msg.includes('chief legal')) {
    return `**${VCB_KNOWLEDGE.leadership.clo.name}** is the ${VCB_KNOWLEDGE.leadership.clo.role} of VCB.\n\n${VCB_KNOWLEDGE.leadership.clo.description}\n\nHer vision: "${VCB_KNOWLEDGE.leadership.clo.vision}"`;
  }
  
  // Sovereign AI
  if (msg.includes('sovereign') || msg.includes('locali') || msg.includes('local ai') || msg.includes('data sovereignty')) {
    return `**Sovereign AI**: ${VCB_KNOWLEDGE.sovereignAI.definition}\n\n**VCB's Approach**: ${VCB_KNOWLEDGE.sovereignAI.vcbApproach}\n\n**Key Benefits**:\n${VCB_KNOWLEDGE.sovereignAI.benefits.map(b => `• ${b}`).join('\n')}`;
  }
  
  // Products - Sarah
  if (msg.includes('sarah') || msg.includes('voice agent') || msg.includes('voice ai')) {
    return `**${VCB_KNOWLEDGE.products.sarah.name}**: ${VCB_KNOWLEDGE.products.sarah.description}\n\nI'm Sarah! I'm designed to handle customer service and sales conversations naturally in all South African languages.`;
  }
  
  // Products - Agentic AI
  if (msg.includes('agentic') || msg.includes('autonomous') || msg.includes('workflow')) {
    return `**${VCB_KNOWLEDGE.products.agenticAI.name}**: ${VCB_KNOWLEDGE.products.agenticAI.description}`;
  }
  
  // Products - LLM
  if (msg.includes('llm') || msg.includes('language model') || msg.includes('enterprise ai')) {
    return `**${VCB_KNOWLEDGE.products.llmEnterprise.name}**: ${VCB_KNOWLEDGE.products.llmEnterprise.description}`;
  }
  
  // Products - Sales Agent
  if (msg.includes('sales') || msg.includes('sales agent')) {
    return `**${VCB_KNOWLEDGE.products.salesAgent.name}**: ${VCB_KNOWLEDGE.products.salesAgent.description}`;
  }
  
  // All products
  if (msg.includes('product') || msg.includes('service') || msg.includes('what do you offer') || msg.includes('solutions')) {
    return `VCB offers several AI products:\n\n• **Sarah Voice Agent**: ${VCB_KNOWLEDGE.products.sarah.description}\n\n• **Agentic AI Platform**: ${VCB_KNOWLEDGE.products.agenticAI.description}\n\n• **LLM Enterprise**: ${VCB_KNOWLEDGE.products.llmEnterprise.description}\n\n• **Sales Agent**: ${VCB_KNOWLEDGE.products.salesAgent.description}`;
  }
  
  // Languages
  if (msg.includes('language') || msg.includes('zulu') || msg.includes('xhosa') || msg.includes('afrikaans') || msg.includes('multilingual')) {
    return `VCB supports all 11 official South African languages:\n\n${VCB_KNOWLEDGE.company.languages.map(l => `• ${l}`).join('\n')}\n\nThis makes us unique—we're building AI that truly understands and speaks to all South Africans.`;
  }
  
  // Security & Compliance
  if (msg.includes('security') || msg.includes('compliance') || msg.includes('popia') || msg.includes('soc') || msg.includes('encrypt') || msg.includes('safe')) {
    return `VCB takes security seriously:\n\n**Compliance**: ${VCB_KNOWLEDGE.security.compliance.join(', ')}\n\n**Security Features**:\n${VCB_KNOWLEDGE.security.features.map(f => `• ${f}`).join('\n')}`;
  }
  
  // Stats
  if (msg.includes('stat') || msg.includes('uptime') || msg.includes('performance') || msg.includes('reliable')) {
    return `VCB Performance Stats:\n\n• **Languages Supported**: ${VCB_KNOWLEDGE.stats.languages}\n• **Uptime SLA**: ${VCB_KNOWLEDGE.stats.uptime}\n• **Response Time**: ${VCB_KNOWLEDGE.stats.responseTime}\n• **Support**: ${VCB_KNOWLEDGE.stats.support}`;
  }
  
  // Contact
  if (msg.includes('contact') || msg.includes('email') || msg.includes('reach') || msg.includes('talk to')) {
    return `You can reach VCB at: **${VCB_KNOWLEDGE.company.email}**\n\nWould you like me to send you a transcript of our conversation?`;
  }
  
  // Help
  if (msg.includes('help') || msg.includes('what can you')) {
    return `I can help you with:\n\n• Information about VCB and our mission\n• Our leadership team (Dawn Beech - CEO, Advocate Nandi Basson - CLO, Tommy Ferreira - CTO)\n• Our products (Sarah, Agentic AI, LLM Enterprise, Sales Agent)\n• Sovereign localized AI\n• Security and compliance\n• Languages we support\n• Contact information\n\nJust ask me anything!`;
  }
  
  // Thank you
  if (msg.includes('thank') || msg.includes('thanks')) {
    return `You're welcome! Is there anything else you'd like to know about VCB? If you're done, I can send you a transcript of our conversation.`;
  }
  
  // Goodbye
  if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('see you')) {
    return `Goodbye! Thank you for chatting with me. Would you like me to email you a transcript of our conversation before you go?`;
  }
  
  // Default response
  return `I'm not sure I understood that. I can tell you about:\n\n• VCB and our mission\n• Our founder Tommy Storm\n• Our AI products\n• Sovereign localized AI\n• Languages we support\n• Security & compliance\n\nWhat would you like to know?`;
};

// ============================================================
// TYPES
// ============================================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

// ============================================================
// SARAH CHAT COMPONENT
// ============================================================
const SarahChat: React.FC = () => {
  // Memory hook for persistent storage
  const memory = useSarahMemory();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [pendingVoiceTranscript, setPendingVoiceTranscript] = useState<string | null>(null);
  const [showMemoryInfo, setShowMemoryInfo] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const greetingSetRef = useRef(false);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Set personalized greeting when memory loads
  useEffect(() => {
    if (memory.state.isLoaded && !greetingSetRef.current) {
      greetingSetRef.current = true;
      const greeting = memory.getGreeting();
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: greeting,
          timestamp: new Date(),
        }]);
      }, 0);
    }
  }, [memory.state.isLoaded, memory]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !voiceEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/•/g, ''));
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-ZA';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Generate response with memory context
  const generateContextualResponse = useCallback((content: string): string => {
    // Check for memory-related queries
    const lowerContent = content.toLowerCase();
    
    // If user asks about what Sarah remembers
    if (lowerContent.includes('remember') || lowerContent.includes('memory') || lowerContent.includes('what do you know about me')) {
      const { memorySummary, userContext } = memory.state;
      const userName = userContext.find(c => c.key === 'userName')?.value;
      const userCompany = userContext.find(c => c.key === 'userCompany')?.value;
      
      let memoryResponse = "Here's what I remember:\n\n";
      
      if (userName) memoryResponse += `• Your name is **${userName}**\n`;
      if (userCompany) memoryResponse += `• You work at **${userCompany}**\n`;
      
      if (memorySummary) {
        memoryResponse += `• We've had **${memorySummary.totalConversations}** conversations\n`;
        memoryResponse += `• With **${memorySummary.totalMessages}** total messages\n`;
        
        if (memorySummary.firstInteraction) {
          memoryResponse += `• Our first chat was on **${new Date(memorySummary.firstInteraction).toLocaleDateString()}**\n`;
        }
        
        if (memorySummary.topTopics.length > 0) {
          memoryResponse += `• Topics you're interested in: **${memorySummary.topTopics.join(', ')}**\n`;
        }
      }
      
      memoryResponse += "\nI save our conversations locally on your device to provide a better experience!";
      return memoryResponse;
    }
    
    // Check for contextual enhancement
    const contextualNote = memory.getContextualResponse('demo') || 
                          memory.getContextualResponse('pricing') || 
                          memory.getContextualResponse('sovereign-ai');
    
    // Get base response
    let response = generateResponse(content);
    
    // Add contextual note if relevant
    if (contextualNote && Math.random() > 0.5) {
      response = contextualNote + "\n\n" + response;
    }
    
    return response;
  }, [memory]);

  // Send message handler
  const handleSendMessage = useCallback((content: string, isVoice = false) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      isVoice,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Save user message to memory
    memory.saveUserMessage(content.trim(), isVoice);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateContextualResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Save assistant response to memory
      memory.saveAssistantMessage(response);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(response);
      }
    }, 800 + Math.random() * 700);
  }, [speak, voiceEnabled, memory, generateContextualResponse]);

  // Handle clearing memory
  const handleClearMemory = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
      await clearAllData();
      await memory.refreshMemory();
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've cleared my memory. It's like we're meeting for the first time! How can I help you today?",
        timestamp: new Date(),
      }]);
      setShowMemoryInfo(false);
    }
  }, [memory]);

  // Handle exporting memory
  const handleExportMemory = useCallback(async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sarah-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Process pending voice transcript - use setTimeout to avoid cascading renders
  useEffect(() => {
    if (pendingVoiceTranscript) {
      const timer = setTimeout(() => {
        handleSendMessage(pendingVoiceTranscript, true);
        setPendingVoiceTranscript(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pendingVoiceTranscript, handleSendMessage]);

  // Speech recognition setup
  const startListening = useCallback(() => {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-ZA';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: ISpeechRecognitionEvent) => {
      const { transcript } = event.results[0][0];
      setPendingVoiceTranscript(transcript);
    };

    recognitionRef.current.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Email transcript handler
  const handleSendTranscript = useCallback(async () => {
    if (!userEmail.trim()) return;
    
    setEmailStatus('sending');
    
    // Format transcript
    const transcript = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'You' : 'Sarah'}: ${m.content}`
    ).join('\n\n');
    
    // In production, this would send to a backend API
    // For now, we'll simulate the email send and use mailto as fallback
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mailto link as backup
      const subject = encodeURIComponent('VCB Sarah Chat Transcript');
      const body = encodeURIComponent(`Chat Transcript with Sarah AI\nDate: ${new Date().toLocaleString()}\n\n${transcript}\n\n---\nViable Core Business\ninfo@vcb-ai.online`);
      
      // Open mail client for user
      window.open(`mailto:${userEmail}?cc=info@vcb-ai.online&subject=${subject}&body=${body}`, '_blank');
      
      setEmailStatus('sent');
      
      // Add confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've prepared the transcript to be sent to ${userEmail} and info@vcb-ai.online. Your email client should open with the transcript ready to send. Thank you for chatting with VCB!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMessage]);
      
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus('idle');
        setUserEmail('');
      }, 2000);
      
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  }, [userEmail, messages]);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`sarah-chat-toggle ${isOpen ? 'open' : ''}`}
        aria-label={isOpen ? 'Close Sarah chat' : 'Open Sarah chat'}
      >
        {isOpen ? (
          <RiCloseLine className="w-7 h-7" />
        ) : (
          <>
            <RiRobot2Line className="w-7 h-7" />
            <span className="sarah-chat-pulse" />
          </>
        )}
      </button>

      {/* Chat Window */}
      <div className={`sarah-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sarah-chat-header">
          <div className="sarah-chat-header-info">
            <div className="sarah-avatar">
              <RiRobot2Line className="w-6 h-6" />
              <span className="sarah-status" />
            </div>
            <div>
              <h3>Sarah</h3>
              <p>VCB AI Assistant {memory.state.memorySummary?.totalMessages ? `• ${memory.state.memorySummary.totalMessages} msgs` : ''}</p>
            </div>
          </div>
          <div className="sarah-chat-header-actions">
            <button 
              onClick={() => setShowVoiceModal(true)}
              className="sarah-header-btn voice-call"
              title="Voice call with Sarah"
            >
              <RiPhoneLine className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowMemoryInfo(!showMemoryInfo)}
              className={`sarah-header-btn ${showMemoryInfo ? 'active' : ''}`}
              title="Memory info"
            >
              <RiHistoryLine className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`sarah-header-btn ${voiceEnabled ? 'active' : ''}`}
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? <RiVolumeUpLine className="w-5 h-5" /> : <RiVolumeMuteLine className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowEmailModal(true)}
              className="sarah-header-btn"
              title="Email transcript"
            >
              <RiMailSendLine className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="sarah-header-btn close"
              title="Close chat"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Memory Info Panel */}
        {showMemoryInfo && (
          <div className="sarah-memory-panel">
            <div className="sarah-memory-stats">
              <div className="sarah-memory-stat">
                <span className="stat-value">{memory.state.memorySummary?.totalConversations || 0}</span>
                <span className="stat-label">Conversations</span>
              </div>
              <div className="sarah-memory-stat">
                <span className="stat-value">{memory.state.memorySummary?.totalMessages || 0}</span>
                <span className="stat-label">Messages</span>
              </div>
              <div className="sarah-memory-stat">
                <span className="stat-value">
                  {memory.state.memorySummary?.firstInteraction 
                    ? new Date(memory.state.memorySummary.firstInteraction).toLocaleDateString() 
                    : 'Today'}
                </span>
                <span className="stat-label">First Chat</span>
              </div>
            </div>
            {memory.state.memorySummary?.topTopics && memory.state.memorySummary.topTopics.length > 0 && (
              <div className="sarah-memory-topics">
                <span className="topics-label">Your interests:</span>
                <div className="topics-list">
                  {memory.state.memorySummary.topTopics.map((topic, i) => (
                    <span key={i} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="sarah-memory-actions">
              <button onClick={handleExportMemory} className="memory-action-btn">
                Export Data
              </button>
              <button onClick={handleClearMemory} className="memory-action-btn danger">
                <RiDeleteBinLine className="w-4 h-4" />
                Clear Memory
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="sarah-chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`sarah-message ${message.role}`}>
              <div className="sarah-message-avatar">
                {message.role === 'assistant' ? (
                  <RiRobot2Line className="w-4 h-4" />
                ) : (
                  <RiUserLine className="w-4 h-4" />
                )}
              </div>
              <div className="sarah-message-content">
                <p>{message.content}</p>
                <span className="sarah-message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.isVoice && ' 🎤'}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="sarah-message assistant">
              <div className="sarah-message-avatar">
                <RiRobot2Line className="w-4 h-4" />
              </div>
              <div className="sarah-message-content typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sarah-chat-input">
          <div className="sarah-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about VCB, our products, or sovereign AI..."
              disabled={isListening}
            />
            <button
              onClick={() => isListening ? stopListening() : startListening()}
              className={`sarah-voice-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <RiMicOffLine className="w-5 h-5" />
              ) : (
                <RiMicLine className="w-5 h-5" />
              )}
              {isListening && <span className="sarah-voice-pulse" />}
            </button>
          </div>
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isListening}
            className="sarah-send-btn"
          >
            <RiSendPlaneFill className="w-5 h-5" />
          </button>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="sarah-speaking-indicator" onClick={stopSpeaking}>
            <RiVolumeUpLine className="w-4 h-4" />
            <span>Sarah is speaking... (click to stop)</span>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="sarah-email-modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="sarah-email-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Send Transcript</h3>
            <p>Enter your email to receive a copy of this conversation. A copy will also be sent to VCB.</p>
            
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={emailStatus === 'sending' || emailStatus === 'sent'}
            />
            
            <div className="sarah-email-modal-actions">
              <button 
                onClick={() => setShowEmailModal(false)}
                className="sarah-email-cancel"
                disabled={emailStatus === 'sending'}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendTranscript}
                className="sarah-email-send"
                disabled={!userEmail.trim() || emailStatus === 'sending' || emailStatus === 'sent'}
              >
                {emailStatus === 'idle' && (
                  <>
                    <RiMailSendLine className="w-4 h-4" />
                    Send Transcript
                  </>
                )}
                {emailStatus === 'sending' && (
                  <>
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                )}
                {emailStatus === 'sent' && (
                  <>
                    <RiCheckboxCircleLine className="w-4 h-4" />
                    Sent!
                  </>
                )}
                {emailStatus === 'error' && 'Error - Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Voice Modal */}
      <GeminiVoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTranscript={(userText, assistantText) => {
          // Add voice conversation to chat history
          const newMessages: Message[] = [
            ...messages,
            {
              id: Date.now().toString(),
              role: 'user',
              content: userText,
              timestamp: new Date(),
              isVoice: true,
            },
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: assistantText,
              timestamp: new Date(),
              isVoice: true,
            },
          ];
          setMessages(newMessages);
          // Save to memory
          memory.saveUserMessage(userText);
          memory.saveAssistantMessage(assistantText);
        }}
      />
    </>
  );
};

export default SarahChat;
