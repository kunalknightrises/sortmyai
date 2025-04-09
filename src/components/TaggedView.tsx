import { Video } from 'lucide-react';

const TaggedView = () => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-20 h-20 rounded-full bg-sortmy-gray/10 flex items-center justify-center mb-4">
        <Video className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">No tagged content</h3>
      <p className="text-gray-400">This creator hasn't been tagged in any posts</p>
    </div>
  );
};

export default TaggedView;
