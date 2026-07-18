import Sidebar from "@/components/admin/Sidebar";
import AdminProviders from "../providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="admin-shell">
        <Sidebar />
        <div className="admin-main">{children}</div>
      </div>
    </AdminProviders>
  );
}
