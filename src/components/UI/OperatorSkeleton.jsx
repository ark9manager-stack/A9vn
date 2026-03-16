function OperatorSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="w-24 h-24 bg-gray-800 animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}
export default OperatorSkeleton;
