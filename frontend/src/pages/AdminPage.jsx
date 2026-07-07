const AdminPage = () => (
  <section className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-white">Admin Panel</h1>
      <p className="mt-2 text-slate-400">Manage users, roles, permissions, audit logs, and system health.</p>
    </div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {['Users', 'Roles', 'Permissions', 'Audit Logs', 'System Health', 'Notifications'].map((section) => (
        <div key={section} className="glass-card rounded-3xl p-6">
          <p className="text-lg font-semibold text-white">{section}</p>
          <p className="mt-2 text-slate-400">Enterprise management view for {section.toLowerCase()}.</p>
        </div>
      ))}
    </div>
  </section>
);

export default AdminPage;
