import { getIndex } from "@/lib/opportunityIndex";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const data = await getIndex();
    return Response.json(data, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
