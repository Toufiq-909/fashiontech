import { AdminNav } from "@/components/AdminNav";
import { sessionUser } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await sessionUser();
  const isAdmin = user?.role === "admin";

  return (
    <div className="admin-shell">
      <div className="shell">
        {isAdmin ? (
          <div className="admin-layout">
            <AdminNav />
            <div>{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
