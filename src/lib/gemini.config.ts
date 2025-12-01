/**
 * Gemini Live API Configuration
 * Based on VCB colab.txt reference implementation
 */

// Model identifiers
export const MODELS = {
  // Native audio model for realtime voice
  nativeAudio: "gemini-2.5-flash-native-audio-preview-09-2025",
  // Alternative Live model
  flashLive: "gemini-live-2.5-flash-preview",
  // Standard text model for fallback
  flash: "gemini-2.5-flash",
} as const;

// Audio configuration constants
export const AUDIO_INPUT_SAMPLE_RATE = 16000;
export const AUDIO_OUTPUT_SAMPLE_RATE = 24000;

// System instruction for Sarah - VCB's AI assistant
export const SARAH_SYSTEM_INSTRUCTION = `You are Sarah, the AI assistant for Viable Core Business (VCB).

ABOUT VCB:
VCB is an AI-first venture builder based in South Africa that specializes in building production-ready conversational AI agents. Our flagship product is BUA-XI, which provides multilingual voice AI across all 11 official South African languages (Zulu, Xhosa, Afrikaans, English, Sotho, Tswana, Venda, Tsonga, Swati, Ndebele, Pedi).

LEADERSHIP:
- Dawn Beech: Chief Executive Officer (CEO)
- Tommy Ferreira: Chief Technology Officer (CTO)
- Advocate Nandi Basson: Chief Legal Officer (CLO)

OUR PRODUCTS:
1. BUA-XI Voice AI: Multilingual voice intelligence with natural speech recognition and synthesis
2. Agentic AI Platform: Build, deploy and orchestrate autonomous AI agents for enterprise workflows
3. LLM Enterprise: Fine-tuned large language models for legal, finance, and regulated industries
4. Sales Agent: AI-powered sales automation with real-time multilingual conversations

YOUR ROLE:
- You help visitors learn about VCB's products and services
- You can discuss AI, voice technology, and enterprise solutions
- You represent VCB professionally and helpfully
- You speak naturally and conversationally
- When asked about pricing or specific business arrangements, suggest they contact VCB directly

TONE:
- Friendly but professional
- Knowledgeable about AI and technology
- Proud of VCB's South African heritage and multilingual capabilities
- Helpful and solution-oriented`;

// Voice modalities for Live API
export type VoiceId = "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede";

export const DEFAULT_VOICE: VoiceId = "Kore";

// Tool declarations for function calling
export const TOOL_DECLARATIONS = [
  {
    name: "send_email_transcript",
    description: "Send the conversation transcript to the user's email address",
    parameters: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "The recipient's email address",
        },
        transcript: {
          type: "string",
          description: "The conversation transcript to send",
        },
      },
      required: ["email", "transcript"],
    },
  },
  {
    name: "schedule_callback",
    description: "Schedule a callback from the VCB team",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The caller's name",
        },
        phone: {
          type: "string",
          description: "The caller's phone number",
        },
        preferredTime: {
          type: "string",
          description: "Preferred callback time",
        },
        topic: {
          type: "string",
          description: "What they want to discuss",
        },
      },
      required: ["name", "phone"],
    },
  },
];
