/**
 * Runs once when the Next.js server boots (requires
 * `experimental.instrumentationHook` in next.config.mjs).
 *
 * Fixes Windows dev machines where Node's resolver picks up a dead
 * 127.0.0.1 stub (stale VPN / antivirus DNS hook). Symptom: everything
 * except Node works (browser, nslookup, Prisma engine), while the `mongodb`
 * driver fails with `querySrv ECONNREFUSED`. Pinning public resolvers for
 * the server runtime makes `mongodb+srv://` lookups deterministic.
 */
export async function register() {
  if (typeof window !== "undefined") return;
  try {
    const dns = await import("node:dns");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    if (process.env.NODE_ENV === "development") {
      console.log("[instrumentation] pinned DNS resolvers to 8.8.8.8, 1.1.1.1");
    }
  } catch {
    // Non-fatal: fall back to the OS resolver.
  }
}
