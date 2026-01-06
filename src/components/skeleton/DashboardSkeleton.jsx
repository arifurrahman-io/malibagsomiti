const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-100 rounded-xl w-full"></div>
    <div className="h-48 bg-gray-200 rounded-xl w-full"></div>
  </div>
);

export default DashboardSkeleton;
