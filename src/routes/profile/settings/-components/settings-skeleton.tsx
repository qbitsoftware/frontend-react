export default function SettingsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="h-12 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-200 rounded w-56" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-36" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="h-12 bg-gray-200 rounded w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
