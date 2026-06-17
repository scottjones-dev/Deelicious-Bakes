import { H1, H2, P } from "@/components/ui/typography";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16 space-y-8 px-4">
      <div className="space-y-4 text-center md:text-left">
        <H1>Contact Us</H1>
        <P className="text-xl text-muted-foreground">
          Have a sweet idea? We would love to hear from you!
        </P>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <H2>Get in Touch</H2>
          <P>
            For custom inquiries, wedding consultations, or event bookings,
            please email us directly or check out our social media channels.
          </P>
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3">
              <Mail className="size-5 text-pink-500" />
              <span className="text-sm font-medium">
                hello@deeliciousbakes.co.uk
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="size-5 text-pink-500" />
              <span className="text-sm font-medium">
                Salisbury, United Kingdom
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Important Notes</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground list-disc pl-4">
            <li>Standard lead time is 3 days.</li>
            <li>We currently offer collection-only for major custom cakes.</li>
            <li>We are fully compliant with Natasha's Law for food safety.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
