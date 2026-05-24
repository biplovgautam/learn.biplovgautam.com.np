import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession, isAdminEmail } from "@/lib/auth-utils";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  // No session at all → send to login
  if (!session) {
    redirect("/login?next=/admin");
  }

  // Signed in but not the admin → kick to home
  if (!isAdminEmail(session.email)) {
    redirect("/");
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
