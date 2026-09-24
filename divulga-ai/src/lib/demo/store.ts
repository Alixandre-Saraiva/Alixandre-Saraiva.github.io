import "server-only";
import { createSeed, type DemoDB } from "./seed";

export const DEMO_SESSION_COOKIE = "da_demo_uid";

const globalForDemo = globalThis as unknown as { __divulgaDemoDB?: DemoDB };

/** Banco em memória do modo demonstração (reinicia junto com o servidor). */
export function demoDB(): DemoDB {
  if (!globalForDemo.__divulgaDemoDB) globalForDemo.__divulgaDemoDB = createSeed();
  return globalForDemo.__divulgaDemoDB;
}
