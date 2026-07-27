import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// IMPORTANT: don't throw here at module-load time. Next.js evaluates route
// modules while collecting page data during `next build`, even for routes
// that are never actually invoked at build time. Throwing here would fail
// every deployment until DATABASE_URL is configured. Instead we fall back to
// a placeholder connection string at build time; postgres.js does not
// connect eagerly, so this is only ever touched if a request actually runs
// a query without DATABASE_URL configured on the server.
const connectionString =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] DATABASE_URL is not set. Set it in your hosting provider's Environment Variables before handling real requests."
  );
}

// `prepare: false` is required when connecting through Neon's pooled
// endpoint (hostnames containing "-pooler"), which uses PgBouncer in
// transaction mode. PgBouncer doesn't support named prepared statements
// across pooled connections, so leaving this on causes queries to fail.
const client = postgres(connectionString, { max: 1, prepare: false });
export const db = drizzle(client, { schema });
