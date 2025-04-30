import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Video, Link2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import NeonButton from '@/components/ui/NeonButton';

interface PostTypeSelectorProps {
  onSelect: (type: 'image' | 'video' | 'link') => void;
}

const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({ onSelect }) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <NeonButton
          variant="cyan"
          onClick={() => navigate('/dashboard/portfolio')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </NeonButton>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">What are you posting?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-sortmy-darker/70 border border-sortmy-blue/20 hover:border-sortmy-blue/40 transition-all cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-sortmy-blue/10 flex items-center justify-center mb-4">
                <Image className="w-8 h-8 text-sortmy-blue" />
              </div>
              <h3 className="text-lg font-medium mb-2">Image</h3>
              <p className="text-sm text-gray-400 mb-4">Share your AI-generated images or artwork</p>
              <NeonButton
                variant="cyan"
                className="mt-2"
                onClick={() => onSelect('image')}
              >
                <span className="text-white">Select</span>
              </NeonButton>
            </CardContent>
          </Card>

          <Card className="bg-sortmy-darker/70 border border-sortmy-blue/20 hover:border-sortmy-blue/40 transition-all cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-sortmy-blue/10 flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-sortmy-blue" />
              </div>
              <h3 className="text-lg font-medium mb-2">Video/Reel</h3>
              <p className="text-sm text-gray-400 mb-4">Share videos or animated content</p>
              <NeonButton
                variant="cyan"
                className="mt-2"
                onClick={() => onSelect('video')}
              >
                <span className="text-white">Select</span>
              </NeonButton>
            </CardContent>
          </Card>

          <Card className="bg-sortmy-darker/70 border border-sortmy-blue/20 hover:border-sortmy-blue/40 transition-all cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-sortmy-blue/10 flex items-center justify-center mb-4">
                <Link2 className="w-8 h-8 text-sortmy-blue" />
              </div>
              <h3 className="text-lg font-medium mb-2">Project with Link</h3>
              <p className="text-sm text-gray-400 mb-4">Share a project with an external link</p>
              <NeonButton
                variant="cyan"
                className="mt-2"
                onClick={() => onSelect('link')}
              >
                <span className="text-white">Select</span>
              </NeonButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostTypeSelector;
