import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generateSessionId,
  startConversation,
  endConversation,
  saveMessage,
  getRecentMessages,
  learnAboutUser,
  getAllUserContext,
  getMemorySummary,
  setPreference,
  getPreference,
  type ChatMessage,
  type UserContext,
} from './sarahMemory';

// ============================================================
// SARAH MEMORY HOOK
// React hook for managing Sarah's persistent memory
// ============================================================

export interface MemoryState {
  sessionId: string;
  conversationId: number | null;
  isLoaded: boolean;
  messageHistory: ChatMessage[];
  userContext: UserContext[];
  memorySummary: {
    totalConversations: number;
    totalMessages: number;
    firstInteraction: Date | null;
    lastInteraction: Date | null;
    topTopics: string[];
  } | null;
}

export interface UseSarahMemoryReturn {
  state: MemoryState;
  saveUserMessage: (content: string, isVoice?: boolean) => Promise<void>;
  saveAssistantMessage: (content: string) => Promise<void>;
  loadRecentHistory: (limit?: number) => Promise<ChatMessage[]>;
  learnFact: (key: string, value: string, source?: 'explicit' | 'inferred') => Promise<void>;
  getGreeting: () => string;
  getContextualResponse: (topic: string) => string | null;
  endSession: () => Promise<void>;
  refreshMemory: () => Promise<void>;
  setUserPreference: (key: string, value: string) => Promise<void>;
  getUserPreference: (key: string) => Promise<string | undefined>;
}

export const useSarahMemory = (): UseSarahMemoryReturn => {
  const [state, setState] = useState<MemoryState>({
    sessionId: '',
    conversationId: null,
    isLoaded: false,
    messageHistory: [],
    userContext: [],
    memorySummary: null,
  });
  
  const initializingRef = useRef(false);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;
      
      try {
        const sessionId = generateSessionId();
        const conversationId = await startConversation(sessionId);
        
        // Load existing context
        const userContext = await getAllUserContext();
        const memorySummary = await getMemorySummary();
        const recentMessages = await getRecentMessages(20);
        
        setState({
          sessionId,
          conversationId,
          isLoaded: true,
          messageHistory: recentMessages,
          userContext,
          memorySummary: {
            totalConversations: memorySummary.totalConversations,
            totalMessages: memorySummary.totalMessages,
            firstInteraction: memorySummary.firstInteraction,
            lastInteraction: memorySummary.lastInteraction,
            topTopics: memorySummary.topTopics,
          },
        });
      } catch (error) {
        console.error('Failed to initialize Sarah memory:', error);
        // Still set isLoaded to true so the chat works even without memory
        setState(prev => ({ ...prev, isLoaded: true }));
      }
    };
    
    initSession();
    
    // Cleanup on unmount - using a ref to avoid dependency issues
    const convId = state.conversationId;
    return () => {
      if (convId) {
        endConversation(convId).catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract and learn user info from messages
  const extractUserInfo = useCallback(async (content: string) => {
    const lowerContent = content.toLowerCase();
    
    // Try to extract name
    const nameMatch = content.match(/(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+)/i);
    if (nameMatch) {
      await learnAboutUser('userName', nameMatch[1], 'explicit', 0.95);
    }
    
    // Try to extract company
    const companyMatch = content.match(/(?:work at|work for|from|at)\s+([A-Z][A-Za-z\s]+?)(?:\.|,|$)/i);
    if (companyMatch && !companyMatch[1].toLowerCase().includes('vcb')) {
      await learnAboutUser('userCompany', companyMatch[1].trim(), 'explicit', 0.85);
    }
    
    // Try to extract role/job
    const roleMatch = content.match(/(?:i'm a|i am a|work as|role is)\s+([A-Za-z\s]+?)(?:\.|,|at|$)/i);
    if (roleMatch) {
      await learnAboutUser('userRole', roleMatch[1].trim(), 'explicit', 0.85);
    }
    
    // Track interests based on topics asked about
    if (lowerContent.includes('sovereign') || lowerContent.includes('local')) {
      await learnAboutUser('interestedIn_sovereignAI', 'true', 'inferred', 0.7);
    }
    if (lowerContent.includes('price') || lowerContent.includes('cost')) {
      await learnAboutUser('interestedIn_pricing', 'true', 'inferred', 0.8);
    }
    if (lowerContent.includes('demo') || lowerContent.includes('trial')) {
      await learnAboutUser('interestedIn_demo', 'true', 'inferred', 0.9);
    }
  }, []);

  // Save user message
  const saveUserMessage = useCallback(async (content: string, isVoice: boolean = false) => {
    if (!state.conversationId) return;
    
    try {
      await saveMessage(
        state.conversationId,
        state.sessionId,
        'user',
        content,
        isVoice
      );
      
      // Try to extract user info from message
      await extractUserInfo(content);
    } catch (error) {
      console.error('Failed to save user message:', error);
    }
  }, [state.conversationId, state.sessionId, extractUserInfo]);

  // Save assistant message
  const saveAssistantMessage = useCallback(async (content: string) => {
    if (!state.conversationId) return;
    
    try {
      await saveMessage(
        state.conversationId,
        state.sessionId,
        'assistant',
        content,
        false
      );
    } catch (error) {
      console.error('Failed to save assistant message:', error);
    }
  }, [state.conversationId, state.sessionId]);

  // Load recent history
  const loadRecentHistory = useCallback(async (limit: number = 50): Promise<ChatMessage[]> => {
    try {
      const messages = await getRecentMessages(limit);
      setState(prev => ({ ...prev, messageHistory: messages }));
      return messages;
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }, []);

  // Learn a fact about the user
  const learnFact = useCallback(async (
    key: string,
    value: string,
    source: 'explicit' | 'inferred' = 'inferred'
  ) => {
    try {
      await learnAboutUser(key, value, source, source === 'explicit' ? 0.95 : 0.7);
      const updatedContext = await getAllUserContext();
      setState(prev => ({ ...prev, userContext: updatedContext }));
    } catch (error) {
      console.error('Failed to learn fact:', error);
    }
  }, []);

  // Generate contextual greeting based on memory
  const getGreeting = useCallback((): string => {
    const { memorySummary, userContext } = state;
    
    // Find user's name if known
    const userName = userContext.find(c => c.key === 'userName')?.value;
    const lastInteraction = memorySummary?.lastInteraction;
    
    // Determine time-based greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    // Build personalized greeting
    if (userName && lastInteraction) {
      const daysSince = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince === 0) {
        return `${timeGreeting}, ${userName}! Nice to chat with you again today. How can I help?`;
      } else if (daysSince === 1) {
        return `${timeGreeting}, ${userName}! Good to see you back. What can I help you with today?`;
      } else if (daysSince < 7) {
        return `${timeGreeting}, ${userName}! It's been a few days. What brings you back to VCB?`;
      } else {
        return `${timeGreeting}, ${userName}! It's been a while since we last chatted. How can I assist you today?`;
      }
    } else if (userName) {
      return `${timeGreeting}, ${userName}! How can I help you today?`;
    } else if (memorySummary && memorySummary.totalMessages > 0) {
      return `${timeGreeting}! Welcome back to VCB. I'm Sarah, your AI assistant. What can I help you with?`;
    }
    
    return `${timeGreeting}! I'm Sarah, VCB's AI assistant. I know everything about Viable Core Business, our founder Tommy Storm, and sovereign localized AI. How can I help you today?`;
  }, [state]);

  // Get contextual response based on user's history
  const getContextualResponse = useCallback((topic: string): string | null => {
    const userContext = state.userContext;
    const memorySummary = state.memorySummary;
    
    // Check if user has shown interest in this topic before
    const topicInterest = userContext.find(c => c.key === `interestedIn_${topic}`);
    const userName = userContext.find(c => c.key === 'userName')?.value;
    const userCompany = userContext.find(c => c.key === 'userCompany')?.value;
    
    if (topic === 'demo' && topicInterest) {
      return userName 
        ? `${userName}, I see you've been interested in trying our demo before. Would you like me to help you schedule one?`
        : `I notice you've been interested in our demos. Ready to take the next step?`;
    }
    
    if (topic === 'pricing' && userCompany) {
      return `Since you're with ${userCompany}, we might have enterprise pricing options that could work well for your team.`;
    }
    
    if (memorySummary?.topTopics.includes(topic)) {
      return `I see ${topic} has been a topic of interest for you. Let me give you some more detailed information.`;
    }
    
    return null;
  }, [state]);

  // End the current session
  const endSession = useCallback(async () => {
    if (state.conversationId) {
      try {
        await endConversation(state.conversationId);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  }, [state.conversationId]);

  // Refresh memory data
  const refreshMemory = useCallback(async () => {
    try {
      const userContext = await getAllUserContext();
      const memorySummary = await getMemorySummary();
      const recentMessages = await getRecentMessages(20);
      
      setState(prev => ({
        ...prev,
        userContext,
        messageHistory: recentMessages,
        memorySummary: {
          totalConversations: memorySummary.totalConversations,
          totalMessages: memorySummary.totalMessages,
          firstInteraction: memorySummary.firstInteraction,
          lastInteraction: memorySummary.lastInteraction,
          topTopics: memorySummary.topTopics,
        },
      }));
    } catch (error) {
      console.error('Failed to refresh memory:', error);
    }
  }, []);

  // Set user preference
  const setUserPreference = useCallback(async (key: string, value: string) => {
    try {
      await setPreference(key, value);
    } catch (error) {
      console.error('Failed to set preference:', error);
    }
  }, []);

  // Get user preference
  const getUserPreference = useCallback(async (key: string): Promise<string | undefined> => {
    try {
      return await getPreference(key);
    } catch (error) {
      console.error('Failed to get preference:', error);
      return undefined;
    }
  }, []);

  return {
    state,
    saveUserMessage,
    saveAssistantMessage,
    loadRecentHistory,
    learnFact,
    getGreeting,
    getContextualResponse,
    endSession,
    refreshMemory,
    setUserPreference,
    getUserPreference,
  };
};

export default useSarahMemory;
