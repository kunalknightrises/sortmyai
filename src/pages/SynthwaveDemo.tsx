import React, { useState } from 'react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import GlassCard from '@/components/ui/GlassCard';
import NeuCard from '@/components/ui/NeuCard';
import NeonButton from '@/components/ui/NeonButton';
import NeonSkeleton from '@/components/ui/NeonSkeleton';
import EnhancedXPProgress from '@/components/gamification/EnhancedXPProgress';
import EnhancedStreakCounter from '@/components/gamification/EnhancedStreakCounter';
import ConfettiEffect from '@/components/ui/ConfettiEffect';
import BadgeUnlockedNotification from '@/components/gamification/BadgeUnlockedNotification';
import { Award, Sparkles, Zap, Flame, Plus, ArrowRight, Heart } from 'lucide-react';

// Import the synthwave theme
import '@/styles/synthwave-theme.css';

const SynthwaveDemo: React.FC = () => {
  const [xp, setXp] = useState(250);
  const [streakDays, setStreakDays] = useState(5);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample badge
  const sampleBadge = {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first to join the SortMyAI community!',
    icon: '',
    category: 'achievement' as const,
    tier: 'gold' as const,
    isEarned: true,
    earnedDate: new Date().toISOString(),
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  };

  const handleAddXP = () => {
    setXp(prev => prev + 50);
  };

  const handleAddStreak = () => {
    setStreakDays(prev => prev + 1);
  };

  const handleTriggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleShowBadge = () => {
    setShowBadge(true);
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d001a] text-white relative overflow-hidden">
      {/* Aurora Background */}
      <AuroraBackground intensity={30} />

      {/* Confetti Effect */}
      <ConfettiEffect active={showConfetti} />

      {/* Badge Notification */}
      {showBadge && (
        <BadgeUnlockedNotification
          badge={sampleBadge}
          onClose={() => setShowBadge(false)}
        />
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <GlassCard className="mb-8 p-6">
          <h1 className="text-3xl font-bold mb-2 text-gradient">Synthwave UI Demo</h1>
          <p className="text-gray-300 mb-6">
            Explore the new UI components with aurora gradients, glassmorphism, and neumorphism.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* XP Progress */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-[#00ffff]" />
                Enhanced XP Progress
              </h2>
              <EnhancedXPProgress
                xp={xp}
                level={3}
                xpForNextLevel={500}
                className="mb-6"
              />
              <NeonButton onClick={handleAddXP} variant="magenta" icon={<Plus className="w-4 h-4" />}>
                Add 50 XP
              </NeonButton>
            </div>

            {/* Streak Counter */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Flame className="w-5 h-5 mr-2 text-orange-500" />
                Enhanced Streak Counter
              </h2>
              <div className="mb-6">
                <EnhancedStreakCounter streakDays={streakDays} size="lg" />
              </div>
              <NeonButton onClick={handleAddStreak} variant="cyan" icon={<Plus className="w-4 h-4" />}>
                Add Streak Day
              </NeonButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Glassmorphism */}
            <GlassCard className="p-4" variant="glowing">
              <h3 className="text-lg font-medium mb-2 text-[#00ffff]">Glassmorphism</h3>
              <p className="text-sm text-gray-300 mb-4">
                Frosted-glass panels with synthwave-colored borders and glowing shadows.
              </p>
              <div className="flex justify-between">
                <NeonButton size="sm" variant="cyan">Details</NeonButton>
                <button className="hover-glow">
                  <Heart className="w-5 h-5 text-[#ff00cc]" />
                </button>
              </div>
            </GlassCard>

            {/* Neumorphism */}
            <NeuCard className="p-4" color="purple">
              <h3 className="text-lg font-medium mb-2 text-white">Neumorphism</h3>
              <p className="text-sm text-gray-300 mb-4">
                Soft 3D panels using dark purples, inset shadows, and subtle neon accents.
              </p>
              <div className="flex justify-between">
                <NeonButton size="sm" variant="magenta">Details</NeonButton>
                <button className="hover-pulse">
                  <Zap className="w-5 h-5 text-[#00ffff]" />
                </button>
              </div>
            </NeuCard>

            {/* Gradient Card */}
            <div className="bg-aurora rounded-xl p-4 shadow-lg hover-lift">
              <h3 className="text-lg font-medium mb-2 text-white">Aurora Gradient</h3>
              <p className="text-sm text-gray-200 mb-4">
                Fluid, animated neon gradients for ambient motion and visual appeal.
              </p>
              <div className="flex justify-between">
                <NeonButton size="sm" variant="gradient">Details</NeonButton>
                <button className="hover-glow">
                  <Award className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Neon Buttons */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Neon Buttons</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <NeonButton variant="magenta">Magenta Button</NeonButton>
                <NeonButton variant="cyan">Cyan Button</NeonButton>
                <NeonButton variant="purple">Purple Button</NeonButton>
                <NeonButton variant="gradient">Gradient Button</NeonButton>
              </div>
              <div className="flex flex-wrap gap-3">
                <NeonButton variant="magenta" size="sm">Small</NeonButton>
                <NeonButton variant="cyan" size="md">Medium</NeonButton>
                <NeonButton variant="purple" size="lg">Large</NeonButton>
                <NeonButton
                  variant="gradient"
                  loading={isLoading}
                  onClick={handleLoadingDemo}
                >
                  {isLoading ? 'Loading...' : 'Loading Demo'}
                </NeonButton>
              </div>
            </div>

            {/* Skeletons */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Neon Skeletons</h2>
              <div className="space-y-3">
                <NeonSkeleton height="40px" className="w-full" />
                <NeonSkeleton height="20px" className="w-3/4" />
                <NeonSkeleton height="20px" className="w-1/2" />
                <div className="flex gap-3 mt-4">
                  <NeonSkeleton variant="avatar" width="50px" height="50px" />
                  <div className="flex-1 space-y-2">
                    <NeonSkeleton height="15px" className="w-full" />
                    <NeonSkeleton height="15px" className="w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Effects */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Special Effects</h2>
            <div className="flex flex-wrap gap-3">
              <NeonButton
                variant="gradient"
                onClick={handleTriggerConfetti}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Trigger Confetti
              </NeonButton>

              <NeonButton
                variant="magenta"
                onClick={handleShowBadge}
                icon={<Award className="w-4 h-4" />}
              >
                Show Badge Notification
              </NeonButton>
            </div>
          </div>
        </GlassCard>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <NeonButton
            variant="gradient"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            className="px-8"
          >
            Upgrade Your UI Now
          </NeonButton>
          <p className="text-gray-400 mt-4">
            Implement these components to create an immersive, futuristic experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SynthwaveDemo;
