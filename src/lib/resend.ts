import { Resend } from "resend";
import { env } from "@/config/env";

if (!env.RESEND_API_KEY && env.NODE_ENV === "production") {
  throw new Error("RESEND_API_KEY is required in production");
}

export const resend = new Resend(
  env.RESEND_API_KEY ?? "re_dummy_key_for_compilation_only",
);
