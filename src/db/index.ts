import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/config/env";
import * as Schema from "./schema";

const sql = neon(env.DATABASE_URL);
const db = drizzle({ client: sql, schema: Schema });

export { db };
