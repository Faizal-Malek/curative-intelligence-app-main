export default function OwnerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Analytics</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Platform performance and user insights</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-12 backdrop-blur text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D2B193]/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D2B193]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#2F2626] mb-2">Analytics Dashboard Coming Soon</h2>
          <p className="text-[#6B5E5E]">
            Comprehensive analytics including user growth, engagement metrics, platform usage, and revenue trends will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
