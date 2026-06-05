import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useLLM } from '@/contexts/LLMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInterfaceProps {
  context?: any;
  onInsightGenerated?: (insight: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  context = {},
  onInsightGenerated
}) => {
  const { llmService, isConfigured, isLoading: isLLMLoading, error: llmError, initializeLLMService } = useLLM();
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you analyze colleges and their parameters. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: ChatMessageProps = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setNeedsApiKey(false);

    try {
      // Initialize LLM service if needed
      if (!isConfigured) {
        const initialized = await initializeLLMService();
        if (!initialized) {
          setNeedsApiKey(true);
          const errorMessage: ChatMessageProps = {
            role: 'assistant',
            content: 'AI chat is optional. You can still use the sorting functionality without AI features.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsProcessing(false);
          return;
        }
      }

      // Now we should have a valid llmService
      if (!llmService) {
        const errorMessage: ChatMessageProps = {
          role: 'assistant',
          content: 'LLM service is not available. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsProcessing(false);
        return;
      }

      // Process the message with LLM
      const response = await llmService.processNaturalLanguageQuery(content, context);
      
      // Add assistant response
      const assistantMessage: ChatMessageProps = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If callback provided, send the insight
      if (onInsightGenerated) {
        onInsightGenerated(response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: ChatMessageProps = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            College Assistant
          </CardTitle>
          <CardDescription>Ask questions about colleges and parameters</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={clearChat} title="Clear chat">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 pt-4 pb-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isProcessing && (
              <div className="flex justify-center py-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 pt-2">
        {needsApiKey ? (
          <div className="mb-2">
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">
                <span>AI chat is optional. You can still use the sorting functionality without AI features.</span>
              </AlertDescription>
            </Alert>
          </div>
        ) : llmError ? (
          <div className="mb-2">
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{llmError}</AlertDescription>
            </Alert>
          </div>
        ) : null}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isProcessing || isLLMLoading} 
        />
      </div>
    </Card>
  );
}; 