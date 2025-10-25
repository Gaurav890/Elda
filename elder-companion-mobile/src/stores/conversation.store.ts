/**
 * Conversation Store
 * State management for active conversations
 */

import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'ai';
  timestamp: Date;
}

interface ConversationState {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  transcribedText: string;

  // Actions
  addMessage: (text: string, sender: 'patient' | 'ai') => void;
  clearMessages: () => void;
  setListening: (isListening: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setTranscribedText: (text: string) => void;
}

export const useConversationStore = create<ConversationState>(set => ({
  messages: [],
  isListening: false,
  isSpeaking: false,
  transcribedText: '',

  addMessage: (text, sender) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    set(state => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setListening: isListening => {
    set({ isListening });
  },

  setSpeaking: isSpeaking => {
    set({ isSpeaking });
  },

  setTranscribedText: text => {
    set({ transcribedText: text });
  },
}));
