interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-sortmy-dark/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center min-h-[200px]';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-sortmy-blue animate-spin"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-transparent animate-pulse"></div>
        </div>
        <p className="text-slate-300 animate-pulse">{message}</p>
      </div>
    </div>
  );
}