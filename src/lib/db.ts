import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env.local or hosting provider's environment variables.");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
export const db = drizzle(client, { schema });
