// SQL storage for TasteBridge.
//
// Production runs on a SQLite-backed Durable Object (`TasteStore`) — the same relational schema
// as migrations/0001_init.sql, with transactions, and no extra Cloudflare product permissions.
// If a Cloudflare D1 binding named DB is present it is used instead. Both expose the same small
// D1-style interface (prepare → bind → first/all/run, batch) so db.ts is storage-agnostic.

import { DurableObject } from 'cloudflare:workers';
import { SCHEMA_SQL } from './schema';

export interface Stmt {
  bind(...params: unknown[]): Stmt;
  first<T = any>(): Promise<T | null>;
  all<T = any>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
export interface SqlDb {
  prepare(sql: string): Stmt;
  batch(stmts: Stmt[]): Promise<unknown[]>;
}

type Mode = 'first' | 'all' | 'run';
interface Query { sql: string; params: unknown[]; mode: Mode }

const SCHEMA_VERSION = 1;

function splitStatements(sql: string): string[] {
  return sql
    .split('\n')
    .map((l) => l.replace(/--.*$/, ''))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

export class TasteStore extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env as any);
    ctx.blockConcurrencyWhile(async () => this.migrate());
  }

  private migrate() {
    const sql = this.ctx.storage.sql;
    sql.exec('CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)');
    const row = sql.exec("SELECT value FROM _meta WHERE key = 'schema_version'").toArray()[0] as any;
    if (row && Number(row.value) >= SCHEMA_VERSION) return;
    this.ctx.storage.transactionSync(() => {
      for (const stmt of splitStatements(SCHEMA_SQL)) sql.exec(stmt);
      sql.exec("INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)", String(SCHEMA_VERSION));
    });
  }

  private exec(q: Query) {
    const cur = this.ctx.storage.sql.exec(q.sql, ...(q.params as any[]));
    const rows = cur.toArray();
    if (q.mode === 'run') return { meta: { changes: cur.rowsWritten } };
    if (q.mode === 'first') return rows[0] ?? null;
    return { results: rows };
  }

  query(q: Query) {
    return this.exec(q);
  }

  batch(qs: Query[]) {
    return this.ctx.storage.transactionSync(() => qs.map((q) => this.exec(q)));
  }
}

class DoStmt implements Stmt {
  constructor(private stub: any, readonly sql: string, readonly params: unknown[] = []) {}
  bind(...params: unknown[]) {
    return new DoStmt(this.stub, this.sql, params.map((p) => (p === undefined ? null : typeof p === 'boolean' ? (p ? 1 : 0) : p)));
  }
  first<T>() { return this.stub.query({ sql: this.sql, params: this.params, mode: 'first' }) as Promise<T | null>; }
  all<T>() { return this.stub.query({ sql: this.sql, params: this.params, mode: 'all' }) as Promise<{ results: T[] }>; }
  run() { return this.stub.query({ sql: this.sql, params: this.params, mode: 'run' }) as Promise<{ meta: { changes: number } }>; }
}

export function durableObjectDb(ns: DurableObjectNamespace): SqlDb {
  const stub: any = ns.get(ns.idFromName('tastebridge-main'));
  return {
    prepare: (sql: string) => new DoStmt(stub, sql),
    batch: async (stmts: Stmt[]) =>
      stub.batch(stmts.map((s) => ({ sql: (s as DoStmt).sql, params: (s as DoStmt).params, mode: 'run' as Mode })))
  };
}
