export default function OwnerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Reports</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Generate and export platform reports</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-12 backdrop-blur text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D2B193]/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D2B193]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#2F2626] mb-2">Report Generator Coming Soon</h2>
          <p className="text-[#6B5E5E]">
            Custom report generation, data exports, scheduled reports, and historical data analysis will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
