import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { customers } from "@/db/schema/customers";

type SyncMarketingConsentInput = {
  email: string;
  marketingConsent: boolean;
  userId?: string;
  name?: string | null;
};

export async function syncMarketingConsent({
  email,
  marketingConsent,
  userId,
  name,
}: SyncMarketingConsentInput) {
  const normalizedEmail = email.trim().toLowerCase();

  const [existingCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, normalizedEmail))
    .limit(1);

  const customerValues = {
    email: normalizedEmail,
    marketingConsent,
    ...(name != null ? { name } : {}),
  };

  if (existingCustomer) {
    await db
      .update(customers)
      .set(customerValues)
      .where(eq(customers.id, existingCustomer.id));
  } else {
    await db.insert(customers).values(customerValues);
  }

  if (userId) {
    await db
      .update(userTable)
      .set({
        marketingConsent,
        ...(name != null ? { name } : {}),
      })
      .where(eq(userTable.id, userId));
    return;
  }

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    await db
      .update(userTable)
      .set({
        marketingConsent,
        ...(name != null ? { name } : {}),
      })
      .where(eq(userTable.id, existingUser.id));
  }
}
