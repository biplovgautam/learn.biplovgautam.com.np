import Image from "next/image";
import { Zap, Trophy, Crown } from "lucide-react";
import { getLeaderboard } from "@/lib/data/users";
import { verifySession } from "@/lib/auth-utils";

export default async function LeaderboardPage() {
  const [users, session] = await Promise.all([
    getLeaderboard(100),
    verifySession(),
  ]);

  const currentUid = session?.uid;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="label-mono mb-2">Leaderboard</p>
          <h2 className="text-2xl font-bold tracking-tight">
            Top learners
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Ranked by total Bi Points earned across courses, tutorials, and
            articles.
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center">
          <Trophy
            size={32}
            className="mx-auto mb-3 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="text-muted-foreground">
            No one on the board yet. Be the first to earn Bi Points!
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-muted/20 overflow-hidden">
          {users.map((u, i) => {
            const isCurrent = u.uid === currentUid;
            const rank = i + 1;
            return (
              <div
                key={u.uid}
                className={`flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 ${
                  isCurrent ? "bg-primary/5" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center">
                  {rank === 1 ? (
                    <Crown
                      size={20}
                      className="mx-auto text-amber-400"
                      strokeWidth={2}
                    />
                  ) : (
                    <span
                      className={`text-sm font-mono ${
                        rank <= 3
                          ? "text-primary font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      #{rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                {u.photoURL ? (
                  <Image
                    src={u.photoURL}
                    alt={u.displayName || "User"}
                    width={36}
                    height={36}
                    className="rounded-full ring-1 ring-border"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground text-sm font-bold">
                    {(u.firstName || u.displayName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {u.displayName || u.firstName || "Anonymous"}
                    {isCurrent && (
                      <span className="ml-2 text-xs text-primary">(you)</span>
                    )}
                  </p>
                  {u.level && (
                    <p className="text-xs text-muted-foreground">
                      Level {u.level}
                    </p>
                  )}
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 font-bold text-primary">
                    <Zap size={14} strokeWidth={2} />
                    {(u.biPoints ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Bi Points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
