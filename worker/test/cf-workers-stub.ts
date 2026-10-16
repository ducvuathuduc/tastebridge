// Minimal stand-in for the `cloudflare:workers` module so unit tests run under Node.
export class DurableObject {
  ctx: any;
  env: any;
  constructor(ctx: any, env: any) {
    this.ctx = ctx;
    this.env = env;
  }
}
