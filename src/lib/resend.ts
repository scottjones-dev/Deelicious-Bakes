import { Resend } from "resend";
import { env } from "@/config/env";

if (!env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables.");
}

export const resend = new Resend(env.RESEND_API_KEY);