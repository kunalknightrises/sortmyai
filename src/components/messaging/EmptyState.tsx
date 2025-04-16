import React from 'react';
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No messages yet',
  description = 'Select a conversation or start a new one'
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-sortmy-blue/10 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-sortmy-blue" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md">{description}</p>
    </div>
  );
};

export default EmptyState;
