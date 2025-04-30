import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import GlassCard from '@/components/ui/GlassCard';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

const PortfolioOnboarding = ({ onComplete }: { onComplete: () => void }) => {
  const { user, updateUserData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profession: '',
    avatar_url: user?.avatar_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        ...formData,
        onboarded: true
      });

      await updateUserData({
        ...formData,
        onboarded: true
      });

      toast({
        title: 'Profile Updated',
        description: 'Your portfolio profile has been set up!'
      });

      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Set Up Your Portfolio</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <AvatarUpload
            currentUrl={formData.avatar_url}
            onUpload={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Username</label>
            <Input
              required
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Choose a unique username"
              className="bg-sortmy-darker/50"
            />
          </div>

          <div>
            <label className="block mb-2">Profession</label>
            <Input
              required
              value={formData.profession}
              onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
              placeholder="e.g. AI Artist, Digital Creator"
              className="bg-sortmy-darker/50"
            />
          </div>

          <div>
            <label className="block mb-2">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="bg-sortmy-darker/50"
              rows={4}
            />
          </div>
        </div>

        <ClickEffect effect="ripple" color="blue">
          <NeonButton
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </NeonButton>
        </ClickEffect>
      </form>
    </GlassCard>
  );
};

export default PortfolioOnboarding;
