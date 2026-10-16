// TasteBridge API client — talks to our own Cloudflare Worker (worker/).
// VITE_API_BASE is set at build time (e.g. https://tastebridge-api.<account>.workers.dev).

const DEFAULT_API =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8787"
    : "https://tastebridge-api.huynhthanh.workers.dev";
export const API_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_API).replace(/\/$/, "");
export const MCP_URL = `${API_BASE}/mcp`;

const OWNER_KEY = "tb_owner";

/** Per-browser demo identity. Projects are scoped to this id; no paid auth service needed. */
export function getOwnerId() {
  try {
    let id = localStorage.getItem(OWNER_KEY);
    if (!id) {
      id = `local_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
      localStorage.setItem(OWNER_KEY, id);
    }
    return id;
  } catch {
    return "local_ephemeral_session";
  }
}

export function resetOwnerId() {
  try {
    localStorage.removeItem(OWNER_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = "GET", body, form } = {}) {
  const headers = { "X-Owner-Id": getOwnerId() };
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  } catch (err) {
    throw new ApiError(err?.message || "Network error", 0, "network");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.code);
  return data;
}

export const api = {
  health: () => request("/api/health"),
  analyze: (input) => request("/api/analyze", { method: "POST", body: input }),
  localizePlan: (input) => {
    if (input.file) {
      const form = new FormData();
      Object.entries(input).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") form.append(k, v);
      });
      return request("/api/localize-plan", { method: "POST", form });
    }
    return request("/api/localize-plan", { method: "POST", body: input });
  },
  listProjects: (seed = false) => request(`/api/projects${seed ? "?seed=1" : ""}`),
  createProject: (body) => request("/api/projects", { method: "POST", body }),
  seedDemo: () => request("/api/projects/demo", { method: "POST" }),
  getProject: (id) => request(`/api/projects/${id}`),
  updateProject: (id, body) => request(`/api/projects/${id}`, { method: "PATCH", body }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),
  createItem: (id, collection, body) => request(`/api/projects/${id}/${collection}`, { method: "POST", body }),
  updateItem: (id, collection, itemId, body) => request(`/api/projects/${id}/${collection}/${itemId}`, { method: "PATCH", body }),
  deleteItem: (id, collection, itemId) => request(`/api/projects/${id}/${collection}/${itemId}`, { method: "DELETE" }),
  copilot: (id, body) => request(`/api/projects/${id}/copilot`, { method: "POST", body }),
  partners: (city, type) => request(`/api/partners?${new URLSearchParams({ ...(city ? { city } : {}), ...(type ? { type } : {}) })}`),
};
