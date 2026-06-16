import { siteConfig } from "@/config/site";
import { createAuthClient } from "better-auth/react";
import { adminClient, anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    basePath: "/api/auth",
    baseURL: siteConfig.url,
    fetchOptions: {
        credentials: "include",
        headers: {
            "content-type": "application/json",
            accept: "application/json",
        }
    },
    plugins: [
        adminClient(),
        anonymousClient()
    ]
});
