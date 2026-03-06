const Skeleton = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}
    />
  );
};

export const CategoryCardSkeleton = () => {
  return (
    <div className="card p-5">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};

export const BookmarkCardSkeleton = () => {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-4 h-4 mt-1" />
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const BookmarkListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <BookmarkCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
