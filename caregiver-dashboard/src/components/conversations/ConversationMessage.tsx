'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatToPST } from '@/lib/utils';
import { Conversation, SENTIMENT_EMOJI, URGENCY_COLORS } from '@/types/conversation';

interface ConversationMessageProps {
  conversation: Conversation;
  patientName?: string;
}

export function ConversationMessage({
  conversation,
  patientName = 'Patient',
}: ConversationMessageProps) {
  const isAI = conversation.sender === 'ai';
  const isPatient = conversation.sender === 'patient';

  // Extract initials from patient name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Highlight health mentions in message
  const highlightHealthMentions = (text: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let remainingText = text;

    mentions.forEach((mention, index) => {
      const regex = new RegExp(`(${mention})`, 'gi');
      const match = remainingText.match(regex);

      if (match) {
        const splitText = remainingText.split(regex);
        splitText.forEach((part, i) => {
          if (part.toLowerCase() === mention.toLowerCase()) {
            parts.push(
              <span
                key={`${index}-${i}`}
                className="bg-yellow-100 text-yellow-900 px-1 rounded font-medium"
              >
                {part}
              </span>
            );
          } else if (part) {
            parts.push(part);
          }
        });
        remainingText = '';
      }
    });

    if (remainingText) {
      parts.push(remainingText);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      {/* Avatar - left for AI */}
      {isAI && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gray-200 text-gray-700">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col max-w-[75%] md:max-w-[60%]',
          isAI ? 'items-start' : 'items-end'
        )}
      >
        {/* Urgency indicator */}
        {conversation.urgency && ['high', 'critical'].includes(conversation.urgency) && (
          <Badge
            variant="outline"
            className={cn('mb-1 text-xs', URGENCY_COLORS[conversation.urgency])}
          >
            {conversation.urgency === 'critical' ? '⚠️ Critical' : '⚡ High Priority'}
          </Badge>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-2 shadow-sm',
            isAI
              ? 'bg-gray-100 text-gray-900'
              : 'bg-blue-600 text-white'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {highlightHealthMentions(conversation.message, conversation.health_mentions)}
          </p>
        </div>

        {/* Timestamp and sentiment */}
        <div className="flex items-center gap-2 mt-1 px-1">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
            </span>
            <span className="text-xs text-gray-400">
              {formatToPST(conversation.timestamp, "MMM dd, h:mm a")} PST
            </span>
          </div>
          {isPatient && conversation.sentiment && (
            <span className="text-sm" title={conversation.sentiment}>
              {SENTIMENT_EMOJI[conversation.sentiment]}
            </span>
          )}
        </div>
      </div>

      {/* Avatar - right for Patient */}
      {isPatient && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {getInitials(patientName)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
