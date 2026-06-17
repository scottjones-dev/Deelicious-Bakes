import { Resend } from "resend";
import { env } from "@/config/env";

export const resend = new Resend(
  env.RESEND_API_KEY || "re_dummy_key_for_compilation_only",
);
