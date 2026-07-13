import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "Admin | ArchiCompass",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, permissions, user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminNav accountName={user.email || "Administrator ArchiCompass"} role={role} permissions={permissions} />
      {children}
    </div>
  );
}
