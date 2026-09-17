import { getAdmin } from "@/lib/auth";
import { getNewsletterSubscribersCollection } from "@/db";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getNewsletterStats() {
  const subsCol = await getNewsletterSubscribersCollection();

  const [totalSubs, activeSubs, unsubscribedSubs, bouncedSubs] = await Promise.all([
    subsCol.countDocuments({}),
    subsCol.countDocuments({ status: "active", isVerified: true }),
    subsCol.countDocuments({ status: "unsubscribed" }),
    subsCol.countDocuments({ status: "bounced" }),
  ]);

  const recentSubs = await subsCol
    .find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return {
    totalSubs,
    activeSubs,
    unsubscribedSubs,
    bouncedSubs,
    recentSubs: recentSubs.map((s) => ({
      id: s._id.toString(),
      email: s.email,
      name: s.name,
      status: s.status,
      isVerified: s.isVerified,
      createdAt: s.createdAt,
    })),
  };
}

function SubscriberBadge({ status, isVerified }: { status: string; isVerified: boolean }) {
  const styles: Record<string, string> = {
    active: "bg-leaf-100 text-leaf-800",
    unsubscribed: "bg-navy-100 text-navy-700",
    bounced: "bg-rose-100 text-rose-800",
    blocked: "bg-slate-100 text-slate-700",
    pending: "bg-navy-100 text-navy-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
      styles[status] || "bg-slate-100 text-slate-700"
    }`}>
      {status === "active" ? "सक्रिय" :
       status === "unsubscribed" ? "निष्क्रिय" :
       status === "bounced" ? "बाउंस" :
       status === "blocked" ? "ब्लॉक्ड" : status}
      {!isVerified && <span title="Pending verification">⏳</span>}
    </span>
  );
}

export default async function AdminNewsletterDashboard() {
  let admin: any = null;
  let stats: Awaited<ReturnType<typeof getNewsletterStats>> | null = null;
  let error: Error | null = null;

  try {
    admin = await getAdmin();
    if (!admin) return null;
    stats = await getNewsletterStats();
  } catch (err) {
    console.error("Newsletter dashboard error:", err);
    error = err instanceof Error ? err : new Error("Failed to load newsletter dashboard");
  }

  if (!admin) {
    return (
      <div className="p-6">
        <p className="text-red-600">Authentication required. Please <a href="/login" className="text-saffron-600">log in</a>.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error loading newsletter dashboard.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-ink-soft">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <p className="font-display text-sm font-bold uppercase tracking-[0.24em] text-saffron-600">
          Content Manager
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
          Newsletter
        </h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">
          <span className="tnum">{stats.totalSubs}</span> कुल •{" "}
          <span className="tnum">{stats.activeSubs}</span> सक्रिय •{" "}
          <span className="tnum">{stats.unsubscribedSubs}</span> unsubscribed
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Total Subscribers</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy-950 tnum">{stats.totalSubs}</p>
          <p className="mt-1 text-xs text-ink-soft">{stats.activeSubs} active</p>
        </div>
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Active</p>
          <p className="mt-1 font-display text-2xl font-bold text-leaf-600 tnum">{stats.activeSubs}</p>
        </div>
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Unsubscribed</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy-600 tnum">{stats.unsubscribedSubs}</p>
        </div>
        <div className="rounded-xl border border-navy-100 bg-surface p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Bounced</p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-600 tnum">{stats.bouncedSubs}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-navy-800">Recent Subscribers</h2>
        {stats.recentSubs.length === 0 ? (
          <p className="text-sm text-ink-soft">No subscribers yet.</p>
        ) : (
          <div className="rounded-lg border border-navy-100 bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSubs.map((s) => (
                  <tr key={s.id} className="border-b border-navy-50 last:border-0">
                    <td className="max-w-[220px] px-3 py-2">
                      <p className="truncate font-extrabold text-ink">{s.email}</p>
                    </td>
                    <td className="px-3 py-2 text-ink-soft">{s.name || "—"}</td>
                    <td className="px-3 py-2"><SubscriberBadge status={s.status} isVerified={s.isVerified} /></td>
                    <td className="px-3 py-2 text-right text-[11px] text-ink-soft tnum">
                      {new Date(s.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
