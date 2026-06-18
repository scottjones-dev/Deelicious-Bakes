import { Shell } from "@/components/shell";
import { H1, H2, P } from "@/components/ui/typography";

export default function PrivacyPage() {
  return (
    <Shell className="max-w-3xl space-y-8 py-12 md:py-16">
      <div className="space-y-4 text-center md:text-left">
        <H1>Privacy Policy</H1>
        <P className="text-xl text-muted-foreground">
          How we handle and protect your personal information at Deelicious
          Bakes.
        </P>
      </div>

      <div className="space-y-6">
        <H2>1. Information We Collect</H2>
        <P>
          We only collect personal information necessary to process your cake
          orders and custom inquiries. This includes your name, email, phone
          number, and any design/flavor preferences or food allergen
          requirements you disclose to us.
        </P>

        <H2>2. How We Use Your Data</H2>
        <P>
          We use your information solely to complete your celebration orders,
          contact you regarding collection or delivery, and send promotional
          newsletters (only if you gave explicit marketing consent).
        </P>

        <H2>3. Security & Safety</H2>
        <P>
          Your personal data is encrypted and securely stored. We never sell,
          share, or disclose your information to any third parties except for
          essential payment processors (Stripe) and email engines (Resend).
        </P>
      </div>
    </Shell>
  );
}
