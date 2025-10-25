'use client';

import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { ConversationMessage } from './ConversationMessage';
import { Conversation } from '@/types/conversation';

interface ConversationTimelineProps {
  conversations: Conversation[];
  patientName?: string;
  autoScroll?: boolean;
}

export function ConversationTimeline({
  conversations,
  patientName,
  autoScroll = true,
}: ConversationTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, autoScroll]);

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <MessageCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No conversations yet
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Conversations with {patientName || 'this patient'} will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[600px] overflow-y-auto px-4 py-4 bg-white rounded-lg border border-gray-200"
    >
      {/* Conversation messages */}
      <div className="flex-1">
        {conversations.map((conversation) => (
          <ConversationMessage
            key={conversation.id}
            conversation={conversation}
            patientName={patientName}
          />
        ))}
        {/* Invisible div for auto-scroll target */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
