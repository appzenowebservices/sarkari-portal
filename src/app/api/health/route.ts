import { NextResponse } from "next/server";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return Response.json({ ok: true, host: "addies.nukkvam.mongodb.net" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string })?.code;
    const isSrv = message.includes("querySrv") || code === "ECONNREFUSED";
    const hint = isSrv
      ? "DNS SRV ECONNREFUSED: check Atlas Network Access IP whitelist, cluster Active, or switch DNS to 8.8.8.8/1.1.1.1 / firewall/VPN. Fallback: use mongodb:// standard string."
      : undefined;
    console.error("[health] DB ping failed:", message);
    return Response.json(
      {
        ok: false,
        error: process.env.NODE_ENV === "development" ? message : "DB unavailable",
        code: code ?? null,
        hint: hint ?? null,
      },
      { status: 500 }
    );
  }
}
