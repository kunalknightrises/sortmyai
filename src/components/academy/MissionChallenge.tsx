
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import { Star } from "lucide-react";

interface MissionChallengeProps {
  moduleId: string;
  onComplete: () => void;
}

const MissionChallenge = ({ moduleId, onComplete }: MissionChallengeProps) => {
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim().length > 0) {
      onComplete();
      setResponse('');
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-sortmy-blue/10 p-2 rounded-full">
          <Star className="w-5 h-5 text-sortmy-blue" />
        </div>
        <h2 className="text-xl font-semibold">Mission Challenge</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-gray-300 mb-4">
            Complete this challenge to earn your XP reward. Be creative!
          </p>
        </div>

        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Enter your response..."
          className="min-h-[120px] bg-sortmy-darker/50"
        />

        <Button
          type="submit"
          className="w-full bg-sortmy-blue hover:bg-sortmy-blue/90"
          disabled={response.trim().length === 0}
        >
          Submit Challenge
        </Button>
      </form>
    </GlassCard>
  );
};

export default MissionChallenge;
