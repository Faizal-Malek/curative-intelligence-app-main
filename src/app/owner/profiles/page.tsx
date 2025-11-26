const sampleProfiles = [
  { name: "Acme Fashion", type: "Brand", owner: "Maya Patel", status: "Active" },
  { name: "Northwind Labs", type: "Brand", owner: "Jonas Weber", status: "Onboarding" },
  { name: "Lumen Creators", type: "Agency", owner: "Paige Turner", status: "Invited" },
  { name: "Sora Collective", type: "Influencer", owner: "Priya Desai", status: "Paused" },
];

export default function OwnerProfilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#B89B7B]">Workspace Directory</p>
          <h1 className="text-3xl font-bold text-[#2F2626]">Profiles</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">
            Review every brand, creator, or agency profile that has been provisioned in Curative Intelligence.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EADCCE] bg-white/85 p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F0E3D2] text-left text-sm text-[#2F2626]">
            <thead className="bg-[#F7F3ED] text-xs uppercase tracking-wide text-[#7A6F6F]">
              <tr>
                <th scope="col" className="px-6 py-3">Profile</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Owner</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EADB] bg-white">
              {sampleProfiles.map((profile) => (
                <tr key={profile.name} className="hover:bg-[#FBF7F0]">
                  <td className="px-6 py-4 font-medium">{profile.name}</td>
                  <td className="px-6 py-4">{profile.type}</td>
                  <td className="px-6 py-4">{profile.owner}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-semibold text-[#7A6F6F]">
                      {profile.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#EADCCE] bg-white/80 p-6 text-sm text-[#6B5E5E]">
        <p>
          Wire this view to Prisma by querying <code className="rounded bg-[#F6EFE5] px-1">prisma.profile</code> and
          surface onboarding progress, billing state, and automation eligibility.
        </p>
      </div>
    </div>
  );
}
