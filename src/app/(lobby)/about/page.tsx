import { H1, H2, P } from "@/components/ui/typography";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 md:py-16 space-y-8 px-4">
      <div className="space-y-4 text-center md:text-left">
        <H1>About Deelicious Bakes</H1>
        <P className="text-xl text-muted-foreground">
          Handmade, exquisite, and custom-designed celebration cakes, cupcakes,
          and bakes based in Salisbury.
        </P>
      </div>

      <div className="space-y-6">
        <H2>Our Story</H2>
        <P>
          Welcome to Deelicious Bakes! We are dedicated to creating beautiful,
          bespoke celebration cakes that taste as amazing as they look. Every
          creation is hand-baked and meticulously decorated in Salisbury, using
          only the finest ingredients to ensure a delicious experience for your
          special moments.
        </P>
        <P>
          Whether you are looking for a spectacular multi-tiered wedding cake,
          elegant birthday cupcakes, or custom treats for a corporate event, we
          work closely with you to bring your vision to life.
        </P>
      </div>

      <div className="space-y-6">
        <H2>Our Philosophy</H2>
        <P>
          We believe that cake is more than just dessert—it is the centerpiece
          of your celebration. That is why we pay extreme attention to detail,
          flavor profiles, and allergen safety, ensuring your bake is perfectly
          personalized and compliant with food standards.
        </P>
      </div>
    </div>
  );
}
