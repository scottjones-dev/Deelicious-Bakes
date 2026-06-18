import { index, json, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { generateId } from "@/utils/id";
import { lifecycleDates } from "./utils";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 30 })
      .$defaultFn(() => generateId())
      .primaryKey(),
    actorId: text("actor_id"),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    beforeData: json("before_data"),
    afterData: json("after_data"),
    ...lifecycleDates,
  },
  (table) => ({
    actorIdIdx: index("audit_logs_actor_id_idx").on(table.actorId),
    entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
    entityIdIdx: index("audit_logs_entity_id_idx").on(table.entityId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
  }),
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
