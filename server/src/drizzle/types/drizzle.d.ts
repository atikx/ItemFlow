import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema/schema";

export type DrizzleDB = NodePgDatabase<typeof schema>