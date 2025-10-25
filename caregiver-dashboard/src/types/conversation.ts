export type MessageSender = 'ai' | 'patient';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Conversation {
  id: number;
  patient_id: number;
  sender: MessageSender;
  message: string;
  timestamp: string;
  sentiment?: SentimentType;
  urgency?: UrgencyLevel;
  health_mentions?: string[]; // Keywords like "pain", "dizzy", "tired"
  created_at: string;
}

export interface ConversationFilters {
  days?: number; // undefined = All
}

export const DATE_FILTER_OPTIONS = [
  { label: 'Today', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'All time', days: undefined },
] as const;

export const SENTIMENT_EMOJI: Record<SentimentType, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😔',
};

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};
