import { H1, H2, P } from "@/components/ui/typography";

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16 space-y-8 px-4">
      <div className="space-y-4 text-center md:text-left">
        <H1>Terms of Service</H1>
        <P className="text-xl text-muted-foreground">
          Please read these terms carefully before placing your cake order.
        </P>
      </div>

      <div className="space-y-6">
        <H2>1. Ordering & Payments</H2>
        <P>
          Your order is secured once a deposit or full payment has been
          confirmed. Full payment is required prior to the collection or
          delivery of any bakes.
        </P>

        <H2>2. Cancellations & Amendments</H2>
        <P>
          Any amendments or cancellations must be made at least 48 hours prior
          to the scheduled collection date. Deposits are non-refundable in the
          event of late-notice cancellations.
        </P>

        <H2>3. Collection Responsibility</H2>
        <P>
          Once a cake has been collected and has left our premises, Deelicious
          Bakes cannot accept responsibility for any damage that occurs during
          transit or storage.
        </P>
      </div>
    </div>
  );
}
