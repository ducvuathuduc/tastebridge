export interface Env {
  /** Optional Cloudflare D1 binding. When absent, the SQLite Durable Object STORE is used. */
  DB?: D1Database;
  STORE?: DurableObjectNamespace;
  QLOO_API_KEY?: string;
  QLOO_BASE?: string;
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GROQ_MODEL?: string;
  GEMINI_MODEL?: string;
  OPENAI_MODEL?: string;
  LLM_PROVIDER?: string; // optional override: groq | gemini | openai
  ALLOWED_ORIGINS?: string;
}

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
