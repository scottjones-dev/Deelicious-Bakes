import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const entries = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Audit Trail</h1>
      <Card className="border border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No audit entries recorded yet.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-md border border-border/60 px-3 py-2"
              >
                <p className="text-sm font-medium">
                  {entry.entityType} · {entry.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entity: {entry.entityId} · Actor: {entry.actorId ?? "system"}{" "}
                  · {entry.createdAt.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
