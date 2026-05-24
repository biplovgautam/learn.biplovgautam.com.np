import { verifySession } from "@/lib/auth-utils";
import { getUserProfile } from "@/lib/data/users";
import { DashShell } from "./dash-shell";

export async function DashWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  let profile = null;
  if (session) {
    profile = await getUserProfile(session.uid);
  }

  return (
    <DashShell
      biPoints={profile?.biPoints ?? 0}
      streak={profile?.streak ?? 0}
      level={profile?.level ?? 1}
    >
      {children}
    </DashShell>
  );
}
