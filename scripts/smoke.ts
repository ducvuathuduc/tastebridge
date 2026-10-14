/**
 * End-to-end smoke test against the real Qloo + LLM APIs.
 * Usage: npx tsx --conditions=react-server scripts/smoke.ts "Blue Bottle Coffee" hcmc,hanoi,danang
 * Prints the event stream summary; writes nothing that contains Qloo data to the repo.
 */
import { runPipeline } from "../src/lib/pipeline";
import type { RunEvent } from "../src/lib/types";
import { writeFileSync } from "node:fs";

const brand = process.argv[2] || "Blue Bottle Coffee";
const cities = (process.argv[3] || "hcmc,hanoi,danang").split(",");
const pack = process.argv[4] || "vn";
const out = process.argv[5];
const events: RunEvent[] = [];
const t0 = Date.now();
runPipeline({ brand, cities, pack, lang: "en", signatureItems: process.argv[6], budget: { amount: 500000, currency: "USD" } }, (e) => {
  events.push(e);
  const t = ((Date.now() - t0) / 1000).toFixed(1);
  if (e.type === "agent_start") console.log(t, "▶", e.agent);
  else if (e.type === "tool_call") console.log(t, "  ⚙", e.agent, e.tool, JSON.stringify(e.args));
  else if (e.type === "tool_result") console.log(t, "   ↳", e.ok ? "ok" : "ERR", e.summary.slice(0, 160).replace(/\n/g, " | "));
  else if (e.type === "agent_done") console.log(t, "✔", e.agent, e.model, e.ms + "ms", JSON.stringify(e.output).slice(0, 300));
  else if (e.type === "scores") console.log(t, "SCORES", JSON.stringify(e.scores));
  else if (e.type === "fatal" || e.type === "agent_error") console.log(t, "✖", JSON.stringify(e));
  else if (e.type === "done") console.log(t, "DONE");
})
  .catch((e) => console.log("FATAL", e))
  .finally(() => { if (out) writeFileSync(out, JSON.stringify(events)); });
