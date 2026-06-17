import { adminClient, anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  },
  user: {
    additionalFields: {
      marketingConsent: {
        type: "boolean",
      },
      stripeCustomerId: {
        type: "string",
      },
    },
  },
  plugins: [adminClient(), anonymousClient()],
});
