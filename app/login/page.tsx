import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth-utils";
import { LoginForm } from "./login-form";

async function LoginGate() {
  const session = await verifySession();
  if (session) {
    redirect("/profile");
  }
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginGate />
    </Suspense>
  );
}
