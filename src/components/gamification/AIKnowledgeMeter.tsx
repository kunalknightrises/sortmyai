
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";
import { User } from "@/types";

interface AIKnowledgeMeterProps {
  user: User | null;
  className?: string;
}

const AIKnowledgeMeter = ({ user, className }: AIKnowledgeMeterProps) => {
  if (!user) return null;
  
  // Default overall value if not set
  const overall = user.ai_knowledge?.overall || 5; // Starting with 5% knowledge
  
  // AI knowledge categories with default values
  const categories = user.ai_knowledge?.categories || {
    'Text Generation': 8,
    'Image Creation': 3,
    'Voice Synthesis': 2,
    'Data Analysis': 6,
    'Prompt Engineering': 10
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-500/20 p-2 rounded-full mr-2">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium">AI Knowledge Level</h3>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">{overall}%</span>
          <p className="text-xs text-gray-400">Mastered</p>
        </div>
      </div>
      
      <Progress
        value={overall}
        className="h-2.5 bg-sortmy-gray/30"
      />
      
      <p className="text-xs text-gray-400 italic">
        {overall < 10 && "You're just getting started on your AI journey!"}
        {overall >= 10 && overall < 25 && "You're making progress in understanding AI technologies!"}
        {overall >= 25 && overall < 50 && "You've gained significant AI knowledge!"}
        {overall >= 50 && "You're becoming an AI expert!"}
      </p>
      
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-medium">Knowledge Areas</h4>
        {Object.entries(categories).map(([category, value]) => (
          <div key={category} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{category}</span>
              <span>{value}%</span>
            </div>
            <Progress
              value={value}
              className="h-1.5 bg-sortmy-gray/30"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIKnowledgeMeter;
