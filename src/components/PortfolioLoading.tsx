export function PortfolioLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div 
          key={index}
          className="bg-sortmy-darker rounded-lg overflow-hidden shadow-lg animate-pulse"
        >
          <div className="aspect-square bg-sortmy-gray/30"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-sortmy-gray/30 rounded w-3/4"></div>
            <div className="h-3 bg-sortmy-gray/30 rounded w-1/2"></div>
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 3 }).map((_, tagIndex) => (
                <div 
                  key={tagIndex}
                  className="h-6 w-16 bg-sortmy-gray/30 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
