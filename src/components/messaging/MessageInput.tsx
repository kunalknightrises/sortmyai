import React, { useState, useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendAttachment?: (file: File) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendAttachment,
  isLoading = false
}) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendAttachment) {
      onSendAttachment(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 border-t border-sortmy-blue/20 bg-sortmy-dark/30 backdrop-blur-sm">
      {onSendAttachment && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </>
      )}
      
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className={cn(
          "min-h-[40px] max-h-[120px] resize-none bg-sortmy-dark/50 border-sortmy-blue/20 focus:border-sortmy-blue/50",
          "placeholder:text-gray-500"
        )}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className={cn(
          "text-sortmy-blue hover:text-white hover:bg-sortmy-blue",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={isLoading || !message.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
