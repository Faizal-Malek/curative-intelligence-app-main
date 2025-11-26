export default function OwnerSystemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">System Health</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Monitor platform performance and system status</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-12 backdrop-blur text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D2B193]/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D2B193]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#2F2626] mb-2">System Monitoring Coming Soon</h2>
          <p className="text-[#6B5E5E]">
            Real-time system health, performance metrics, error tracking, and infrastructure monitoring will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
