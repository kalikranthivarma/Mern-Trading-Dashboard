const ProfilePage = () => (
  <section className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-white">Profile</h1>
      <p className="mt-2 text-slate-400">Manage user information, documents, KYC, and GridFS uploads.</p>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-white">Personal details</h2>
        <p className="mt-3 text-slate-400">Name, email, role, and verification status.</p>
      </div>
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-white">Documents</h2>
        <p className="mt-3 text-slate-400">Upload Aadhar, PAN, passport, resume, certificates, and reports.</p>
      </div>
    </div>
  </section>
);

export default ProfilePage;
