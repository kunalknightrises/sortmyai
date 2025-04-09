import { PlusCircle } from 'lucide-react';

interface AddProjectCardProps {
  onClick?: () => void;
}

export function AddProjectCard({ onClick }: AddProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square w-full bg-sortmy-darker hover:bg-sortmy-gray/20 rounded-lg border-2 border-dashed border-sortmy-gray/50 hover:border-sortmy-blue transition-all duration-300 flex flex-col items-center justify-center gap-4 p-8"
    >
      <div className="relative">
        <PlusCircle className="w-12 h-12 text-sortmy-gray/50 group-hover:text-sortmy-blue transition-colors duration-300" />
        <div className="absolute inset-0 animate-ping opacity-0 group-hover:opacity-100">
          <PlusCircle className="w-12 h-12 text-sortmy-blue/30" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-slate-300 group-hover:text-white transition-colors duration-300">
          Add New Project
        </h3>
        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
          Showcase your AI content creation work
        </p>
      </div>
      <div className="absolute inset-0 bg-sortmy-blue/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
    </button>
  );
}
