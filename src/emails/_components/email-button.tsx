import * as React from "react";
import { Button } from "react-email";
import { theme } from "./theme";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export const EmailButton = ({ href, children }: EmailButtonProps) => {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: theme.colors.primary,
        color: theme.colors.primaryForeground,
        fontFamily: theme.fonts.sans,
        fontSize: "15px",
        fontWeight: "600",
        textDecoration: "none",
        textAlign: "center" as const,
        display: "inline-block",
        padding: "12px 24px",
        borderRadius: theme.radius.md,
        lineHeight: "100%",
      }}
    >
      {children}
    </Button>
  );
};
