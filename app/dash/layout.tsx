import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth-utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DashWrapper } from "@/components/dash/dash-wrapper";

async function DashGate({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/dash");
  }
  return <DashWrapper>{children}</DashWrapper>;
}

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Suspense>
        <Header />
        <main className="flex-1">
          <Suspense fallback={<div className="min-h-screen" />}>
            <DashGate>{children}</DashGate>
          </Suspense>
        </main>
        <Footer />
      </Suspense>
    </AuthProvider>
  );
}
