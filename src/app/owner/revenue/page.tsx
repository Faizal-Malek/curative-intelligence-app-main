export default function OwnerRevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Revenue Management</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Track payments, subscriptions, and financial metrics</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-12 backdrop-blur text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D2B193]/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D2B193]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#2F2626] mb-2">Revenue Dashboard Coming Soon</h2>
          <p className="text-[#6B5E5E]">
            Detailed revenue reports, payment history, subscription management, and financial forecasting will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
