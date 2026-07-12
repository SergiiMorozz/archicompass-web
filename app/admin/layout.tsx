import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "Admin | ArchiCompass",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminNav accountName={user.email || "ArchiCompass administrator"} role={role} />
      {children}
    </div>
  );
}
