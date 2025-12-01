import Dexie, { type EntityTable } from 'dexie';

// ============================================================
// SARAH MEMORY - DEXIE DATABASE WRAPPER
// Stores conversation history, user preferences, and context
// ============================================================

// --- TYPES ---
export interface Conversation {
  id?: number;
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  topics: string[];
  summary?: string;
}

export interface ChatMessage {
  id?: number;
  conversationId: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice: boolean;
  topics?: string[];
}

export interface UserContext {
  id?: number;
  key: string;
  value: string;
  learnedAt: Date;
  source: 'explicit' | 'inferred';
  confidence: number;
}

export interface UserPreference {
  id?: number;
  key: string;
  value: string;
  updatedAt: Date;
}

export interface InteractionStat {
  id?: number;
  date: string; // YYYY-MM-DD format
  messageCount: number;
  voiceMessageCount: number;
  topicsDiscussed: string[];
  averageResponseLength: number;
}

// --- DATABASE CLASS ---
class SarahMemoryDB extends Dexie {
  conversations!: EntityTable<Conversation, 'id'>;
  messages!: EntityTable<ChatMessage, 'id'>;
  userContext!: EntityTable<UserContext, 'id'>;
  preferences!: EntityTable<UserPreference, 'id'>;
  stats!: EntityTable<InteractionStat, 'id'>;

  constructor() {
    super('SarahMemoryDB');
    
    this.version(1).stores({
      conversations: '++id, sessionId, startedAt, endedAt',
      messages: '++id, conversationId, sessionId, role, timestamp, *topics',
      userContext: '++id, key, learnedAt, source',
      preferences: '++id, &key, updatedAt',
      stats: '++id, &date',
    });
  }
}

// Singleton instance
const db = new SarahMemoryDB();

// --- HELPER FUNCTIONS ---

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Extract topics from message content
export const extractTopics = (content: string): string[] => {
  const topics: string[] = [];
  const lowerContent = content.toLowerCase();
  
  const topicKeywords: Record<string, string[]> = {
    'vcb': ['vcb', 'viable core', 'company'],
    'founder': ['founder', 'tommy', 'storm', 'ceo'],
    'products': ['product', 'sarah', 'agentic', 'llm', 'sales agent'],
    'sovereign-ai': ['sovereign', 'localized', 'local ai', 'data sovereignty'],
    'languages': ['language', 'zulu', 'xhosa', 'afrikaans', 'multilingual', 'south african'],
    'security': ['security', 'compliance', 'popia', 'soc', 'encrypt', 'privacy'],
    'pricing': ['price', 'cost', 'pricing', 'plan', 'subscription'],
    'demo': ['demo', 'try', 'test', 'trial'],
    'contact': ['contact', 'email', 'reach', 'talk'],
    'support': ['support', 'help', 'issue', 'problem'],
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      topics.push(topic);
    }
  }
  
  return topics;
};

// --- CONVERSATION MANAGEMENT ---

export const startConversation = async (sessionId: string): Promise<number> => {
  const id = await db.conversations.add({
    sessionId,
    startedAt: new Date(),
    messageCount: 0,
    topics: [],
  });
  return id as number;
};

export const endConversation = async (conversationId: number): Promise<void> => {
  const messages = await db.messages.where('conversationId').equals(conversationId).toArray();
  const allTopics = [...new Set(messages.flatMap(m => m.topics || []))];
  
  await db.conversations.update(conversationId, {
    endedAt: new Date(),
    messageCount: messages.length,
    topics: allTopics,
  });
};

export const getCurrentConversation = async (sessionId: string): Promise<Conversation | undefined> => {
  return db.conversations
    .where('sessionId')
    .equals(sessionId)
    .and(c => !c.endedAt)
    .first();
};

// --- MESSAGE MANAGEMENT ---

export const saveMessage = async (
  conversationId: number,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  isVoice: boolean = false
): Promise<number> => {
  const topics = extractTopics(content);
  
  const id = await db.messages.add({
    conversationId,
    sessionId,
    role,
    content,
    timestamp: new Date(),
    isVoice,
    topics,
  });
  
  // Update conversation message count
  await db.conversations.where('id').equals(conversationId).modify(conv => {
    conv.messageCount = (conv.messageCount || 0) + 1;
    conv.topics = [...new Set([...(conv.topics || []), ...topics])];
  });
  
  // Update daily stats
  await updateDailyStats(role, isVoice, topics, content.length);
  
  return id as number;
};

export const getConversationMessages = async (conversationId: number): Promise<ChatMessage[]> => {
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp');
};

export const getRecentMessages = async (limit: number = 50): Promise<ChatMessage[]> => {
  return db.messages
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
};

// --- USER CONTEXT MANAGEMENT ---

export const learnAboutUser = async (
  key: string,
  value: string,
  source: 'explicit' | 'inferred' = 'inferred',
  confidence: number = 0.8
): Promise<void> => {
  const existing = await db.userContext.where('key').equals(key).first();
  
  if (existing) {
    // Update if new info has higher confidence
    if (confidence >= existing.confidence) {
      await db.userContext.update(existing.id!, {
        value,
        learnedAt: new Date(),
        source,
        confidence,
      });
    }
  } else {
    await db.userContext.add({
      key,
      value,
      learnedAt: new Date(),
      source,
      confidence,
    });
  }
};

export const getUserContext = async (key: string): Promise<UserContext | undefined> => {
  return db.userContext.where('key').equals(key).first();
};

export const getAllUserContext = async (): Promise<UserContext[]> => {
  return db.userContext.toArray();
};

// --- PREFERENCES ---

export const setPreference = async (key: string, value: string): Promise<void> => {
  const existing = await db.preferences.where('key').equals(key).first();
  
  if (existing) {
    await db.preferences.update(existing.id!, {
      value,
      updatedAt: new Date(),
    });
  } else {
    await db.preferences.add({
      key,
      value,
      updatedAt: new Date(),
    });
  }
};

export const getPreference = async (key: string): Promise<string | undefined> => {
  const pref = await db.preferences.where('key').equals(key).first();
  return pref?.value;
};

// --- STATISTICS ---

const updateDailyStats = async (
  role: 'user' | 'assistant',
  isVoice: boolean,
  topics: string[],
  contentLength: number
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const existing = await db.stats.where('date').equals(today).first();
  
  if (existing) {
    await db.stats.update(existing.id!, {
      messageCount: existing.messageCount + 1,
      voiceMessageCount: existing.voiceMessageCount + (isVoice ? 1 : 0),
      topicsDiscussed: [...new Set([...existing.topicsDiscussed, ...topics])],
      averageResponseLength: role === 'assistant' 
        ? Math.round((existing.averageResponseLength + contentLength) / 2)
        : existing.averageResponseLength,
    });
  } else {
    await db.stats.add({
      date: today,
      messageCount: 1,
      voiceMessageCount: isVoice ? 1 : 0,
      topicsDiscussed: topics,
      averageResponseLength: role === 'assistant' ? contentLength : 0,
    });
  }
};

export const getStats = async (days: number = 7): Promise<InteractionStat[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  return db.stats
    .where('date')
    .aboveOrEqual(startDateStr)
    .toArray();
};

// --- MEMORY RECALL ---

export const getMemorySummary = async (): Promise<{
  totalConversations: number;
  totalMessages: number;
  firstInteraction: Date | null;
  lastInteraction: Date | null;
  topTopics: string[];
  userFacts: UserContext[];
}> => {
  const conversations = await db.conversations.count();
  const messages = await db.messages.count();
  
  const firstMessage = await db.messages.orderBy('timestamp').first();
  const lastMessage = await db.messages.orderBy('timestamp').last();
  
  // Get top topics from recent conversations
  const recentConvs = await db.conversations
    .orderBy('startedAt')
    .reverse()
    .limit(10)
    .toArray();
  
  const topicCounts: Record<string, number> = {};
  recentConvs.forEach(conv => {
    conv.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
  
  const userFacts = await db.userContext.toArray();
  
  return {
    totalConversations: conversations,
    totalMessages: messages,
    firstInteraction: firstMessage?.timestamp || null,
    lastInteraction: lastMessage?.timestamp || null,
    topTopics,
    userFacts,
  };
};

// --- SEARCH ---

export const searchMessages = async (query: string, limit: number = 20): Promise<ChatMessage[]> => {
  const allMessages = await db.messages.toArray();
  const lowerQuery = query.toLowerCase();
  
  return allMessages
    .filter(m => m.content.toLowerCase().includes(lowerQuery))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

// --- CLEANUP ---

export const clearOldData = async (daysToKeep: number = 30): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  // Delete old messages
  await db.messages.where('timestamp').below(cutoffDate).delete();
  
  // Delete old conversations
  await db.conversations.where('startedAt').below(cutoffDate).delete();
  
  // Delete old stats
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
  await db.stats.where('date').below(cutoffDateStr).delete();
};

export const clearAllData = async (): Promise<void> => {
  await db.messages.clear();
  await db.conversations.clear();
  await db.userContext.clear();
  await db.preferences.clear();
  await db.stats.clear();
};

// --- EXPORT ---

export const exportAllData = async (): Promise<{
  conversations: Conversation[];
  messages: ChatMessage[];
  userContext: UserContext[];
  preferences: UserPreference[];
  stats: InteractionStat[];
}> => {
  return {
    conversations: await db.conversations.toArray(),
    messages: await db.messages.toArray(),
    userContext: await db.userContext.toArray(),
    preferences: await db.preferences.toArray(),
    stats: await db.stats.toArray(),
  };
};

export default db;
