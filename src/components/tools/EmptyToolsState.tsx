import { useRef } from 'react';
import ClickEffect from '@/components/ui/ClickEffect';
import NeonButton from '@/components/ui/NeonButton';

export const EmptyToolsState = () => {
  const libraryRef = useRef<HTMLDivElement>(null);

  const scrollToLibrary = () => {
    libraryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="text-center py-12">
      <p className="text-lg mb-2">No tools added yet</p>
      <p className="text-gray-400 mb-6">Browse the library to add tools to your collection</p>
      <ClickEffect effect="ripple" color="blue">
        <NeonButton variant="gradient" onClick={scrollToLibrary}>
          Browse Tools
        </NeonButton>
      </ClickEffect>

      <div ref={libraryRef} className="mt-12">
        {/* Library content will be rendered here */}
      </div>
    </div>
  );
};

export default EmptyToolsState;
