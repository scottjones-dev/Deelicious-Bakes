import { Shell } from "@/components/shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { H1, P } from "@/components/ui/typography";

export default function FAQsPage() {
  const faqs = [
    {
      q: "How much notice do you need for a cake?",
      a: "Our standard lead time is 3 days, but for highly customized bakes (such as tiered wedding cakes), we recommend booking 2 to 4 weeks in advance to secure your date.",
    },
    {
      q: "Do you cater for allergies and dietary requirements?",
      a: "Yes! We take allergen safety very seriously and are fully compliant with Natasha's Law. We can offer gluten-free, dairy-free, and vegan options. Please specify any requirements when making custom inquiries.",
    },
    {
      q: "Where are you located and do you deliver?",
      a: "We are based in Salisbury. Most of our celebration bakes are for collection-only from our kitchen. Local delivery can be arranged for large wedding cakes.",
    },
    {
      q: "How should I store my cake?",
      a: "Most celebration cakes should be kept in a cool, dry room in their box. They do not need to be refrigerated unless it is extremely warm or if they have fresh cream/fruit fillings.",
    },
  ];

  return (
    <Shell className="max-w-3xl space-y-8 py-12 md:py-16">
      <div className="space-y-4 text-center md:text-left">
        <H1>FAQs</H1>
        <P className="text-xl text-muted-foreground">
          Frequently asked questions about our celebration cakes and ordering
          process.
        </P>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-semibold text-lg">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Shell>
  );
}
