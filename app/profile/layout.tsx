import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth-utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/auth-provider";

async function ProfileGate({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/profile");
  }
  return <>{children}</>;
}

export default function ProfileLayout({
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
            <ProfileGate>{children}</ProfileGate>
          </Suspense>
        </main>
        <Footer />
      </Suspense>
    </AuthProvider>
  );
}
