import { headers } from "next/headers";
import { db } from "@/db";
import type { Notification } from "@/db/schema";
import { auditLogs, notifications } from "@/db/schema";
import { auth } from "@/lib/auth";

async function resolveAuditActorId() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function createAdminAlertNotification({
  subject,
  message,
  status,
  customerId,
  orderId,
}: {
  subject: string;
  message: string;
  status?: Notification["status"];
  customerId?: string | null;
  orderId?: string | null;
}) {
  try {
    await db.insert(notifications).values({
      type: "admin_alert",
      channel: "email",
      recipient: "admin",
      customerId: customerId ?? null,
      orderId: orderId ?? null,
      subject,
      status: status ?? "pending",
      errorMessage: message,
    });
  } catch (error) {
    console.error("Failed to write admin alert notification:", error);
  }
}

export async function createAdminOperationalNotification({
  subject,
  message,
  status = "delivered",
  customerId,
  orderId,
}: {
  subject: string;
  message: string;
  status?: Notification["status"];
  customerId?: string | null;
  orderId?: string | null;
}) {
  await createAdminAlertNotification({
    subject,
    message,
    status,
    customerId,
    orderId,
  });
}

export async function writeAuditLog({
  actorId,
  entityType,
  entityId,
  action,
  beforeData,
  afterData,
}: {
  actorId?: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeData?: unknown;
  afterData?: unknown;
}) {
  const resolvedActorId = actorId ?? (await resolveAuditActorId());
  await db.insert(auditLogs).values({
    actorId: resolvedActorId,
    entityType,
    entityId,
    action,
    beforeData: beforeData ?? null,
    afterData: afterData ?? null,
  });
}
