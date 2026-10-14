import { z } from "zod";
import { runPipeline } from "@/lib/pipeline";
import type { RunEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const Input = z.object({
  brand: z.string().trim().min(2).max(80),
  homeCity: z.string().trim().max(80).optional(),
  signatureItems: z.string().trim().max(200).optional(),
  website: z.string().trim().max(200).optional(),
  pack: z.enum(["vn", "global"]).default("vn"),
  cities: z.array(z.string().max(20)).min(1).max(4),
  lang: z.enum(["en", "vi"]).default("en"),
  budget: z.object({ amount: z.number().positive().max(1e13), currency: z.enum(["USD", "VND"]) }).optional(),
});

// Private, in-memory replay cache (Qloo data is never persisted to the repo).
const replay = new Map<string, { at: number; events: RunEvent[] }>();
const REPLAY_MS = 1000 * 60 * 60 * 3;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 12;
}

export async function POST(req: Request) {
  let parsed;
  try { parsed = Input.parse(await req.json()); }
  catch (e) { return Response.json({ error: "Invalid input", detail: String(e) }, { status: 400 }); }

  const key = JSON.stringify({ ...parsed, brand: parsed.brand.toLowerCase() });
  const cached = replay.get(key);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!cached && limited(ip)) return Response.json({ error: "Too many analyses from this address. Try again in an hour." }, { status: 429 });

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: RunEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      if (cached && Date.now() - cached.at < REPLAY_MS) {
        for (const e of cached.events) { send(e); await new Promise((r) => setTimeout(r, e.type === "tool_result" ? 40 : 15)); }
        controller.close();
        return;
      }
      const events: RunEvent[] = [];
      const keepAlive = setInterval(() => controller.enqueue(enc.encode("\n")), 10_000);
      try {
        await runPipeline(parsed, (e) => { events.push(e); send(e); });
        replay.set(key, { at: Date.now(), events });
      } catch (e) {
        send({ type: "fatal", error: (e as Error).message || "Pipeline failed" });
      } finally {
        clearInterval(keepAlive);
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
}
