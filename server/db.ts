import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Railway/Render/Neon require SSL but use self-signed certs in their proxies.
// In production, accept their certs. Locally (no SSL), use no SSL.
const needsSSL = process.env.NODE_ENV === "production" || process.env.DATABASE_URL!.includes("sslmode=require");

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
