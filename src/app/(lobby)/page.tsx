import { Cake, Cookie, Heart, Mail, MapPin, Sparkles } from "lucide-react";
import { WaitlistForm } from "@/components/lobby/waitlist-form";
import { H1, Lead, Muted, P, Signature } from "@/components/ui/typography";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-amber-50/20 dark:bg-[#120f0a] text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-125 h-125 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-100 h-100 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.03),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Banner / Announcement */}
      <div className="w-full bg-primary/10 border-b border-primary/10 py-2.5 px-4 text-center text-xs md:text-sm font-medium tracking-wide text-primary">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 animate-pulse" />
          Coming Soon to Salisbury • Launching Summer 2026
        </span>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center gap-16 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <Signature className="text-6xl md:text-8xl text-primary font-signature drop-shadow-sm select-none">
            Deelicious Bakes
          </Signature>
          <P className="text-xs md:text-sm tracking-[0.25em] uppercase text-muted-foreground/90 font-semibold max-w-md">
            Homemade cakes • cookies • donuts • tray bakes
          </P>
        </div>

        {/* Hero Section & Waitlist Subscription */}
        <div className="w-full max-w-3xl flex flex-col items-center text-center gap-8">
          <div className="flex flex-col gap-4">
            <H1 className="text-4xl md:text-5xl lg:text-6xl text-foreground font-heading font-medium tracking-tight leading-[1.15]">
              Something sweet is on the way
            </H1>
            <Lead className="max-w-2xl text-muted-foreground mx-auto text-base md:text-lg leading-relaxed">
              Our ovens are warming up! We are preparing to bring Salisbury the
              most delectable collection of handcrafted cakes, gooey cookies,
              luxury cupcakes, and tray bakes. Join our exclusive waitlist for
              launch invites, special early-bird discounts, and a sweet surprise
              in your inbox.
            </Lead>
          </div>

          {/* Waitlist Form Component */}
          <div className="w-full max-w-md mt-2">
            <WaitlistForm />
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 w-full max-w-md">
          <div className="h-px bg-border/60 flex-1" />
          <Heart className="size-4 text-primary/60 fill-primary/10" />
          <div className="h-px bg-border/60 flex-1" />
        </div>

        {/* Our Sweet Pillars (USP Section) */}
        <div className="w-full flex flex-col gap-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
              Baked with Care
            </h2>
            <P className="text-sm text-muted-foreground">
              What makes Deelicious Bakes so special
            </P>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {/* Pillar 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-card/30 border border-border/50 rounded-2xl shadow-sm hover:border-primary/20 transition-all duration-300 group">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Cookie className="size-6" />
              </div>
              <h3 className="font-sans text-lg font-bold mb-2 text-foreground">
                Handcrafted & Fresh
              </h3>
              <P className="text-sm leading-relaxed">
                Everything is baked fresh to order in small batches. No
                shortcuts, just pure homemade goodness using premium local
                ingredients and a whole lot of passion.
              </P>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-card/30 border border-border/50 rounded-2xl shadow-sm hover:border-primary/20 transition-all duration-300 group">
              <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <Cake className="size-6" />
              </div>
              <h3 className="font-sans text-lg font-bold mb-2 text-foreground">
                Custom Creations
              </h3>
              <P className="text-sm leading-relaxed">
                From luxury milestone birthday cakes to bespoke corporate
                cupcake sets, we work with you to design sweet centerpieces that
                taste as magical as they look.
              </P>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-card/30 border border-border/50 rounded-2xl shadow-sm hover:border-primary/20 transition-all duration-300 group">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="size-6" />
              </div>
              <h3 className="font-sans text-lg font-bold mb-2 text-foreground">
                Local Salisbury Delivery
              </h3>
              <P className="text-sm leading-relaxed">
                Proudly based in Salisbury, Wiltshire. We offer contact-free
                doorstep delivery across Salisbury and neighboring areas, plus
                scheduled collection times.
              </P>
            </div>
          </div>
        </div>

        {/* Sneak Peek / Signature Items */}
        <div className="w-full flex flex-col gap-8 mt-4">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-2">
              Our Signature Menu
            </h2>
            <P className="text-sm text-muted-foreground">
              A tiny sneak peek of what we are preparing for you
            </P>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {/* Signature Item 1 */}
            <div className="bg-card/40 border border-border/40 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
              <div className="aspect-4/3 bg-linear-to-br from-primary/10 to-accent/5 flex items-center justify-center relative p-6">
                {/* SVG Illustration for Cupcake */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 drop-shadow-md select-none group-hover:scale-110 transition-transform duration-300"
                >
                  <title>Luxury Cupcakes</title>
                  {/* Wrapper/Cup */}
                  <path
                    d="M 30 65 L 35 90 C 36 93 40 95 44 95 L 56 95 C 60 95 64 93 65 90 L 70 65 Z"
                    fill="#DDB892"
                    stroke="#B08968"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 35 65 L 38 95"
                    stroke="#B08968"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 43 65 L 44 95"
                    stroke="#B08968"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 50 65 L 50 95"
                    stroke="#B08968"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 57 65 L 56 95"
                    stroke="#B08968"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 65 65 L 62 95"
                    stroke="#B08968"
                    strokeWidth="1.5"
                  />

                  {/* Cake Spurt */}
                  <path
                    d="M 27 65 Q 50 62 73 65 C 75 65 75 60 72 58 Q 50 54 28 58 C 25 60 25 65 27 65 Z"
                    fill="#7F5539"
                  />

                  {/* Frosting Level 1 (Bottom Swirl) */}
                  <path
                    d="M 23 58 Q 50 42 77 58 Q 82 52 75 46 Q 50 32 25 46 Q 18 52 23 58 Z"
                    fill="#F4C2C2"
                  />

                  {/* Frosting Level 2 (Middle Swirl) */}
                  <path
                    d="M 28 44 Q 50 30 72 44 Q 76 38 70 32 Q 50 20 30 32 Q 24 38 28 44 Z"
                    fill="#FFE5EC"
                  />

                  {/* Frosting Level 3 (Top Swirl) */}
                  <path
                    d="M 36 30 Q 50 18 64 30 Q 66 22 59 18 Q 50 10 41 18 Q 34 22 36 30 Z"
                    fill="#FFF0F3"
                  />

                  {/* Cherry on top */}
                  <circle
                    cx="50"
                    cy="12"
                    r="7"
                    fill="#D90429"
                    stroke="#A30015"
                    strokeWidth="1"
                  />
                  {/* Cherry stem */}
                  <path
                    d="M 50 10 Q 55 -2 64 2"
                    fill="none"
                    stroke="#6F1D1B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Sprinkles */}
                  <rect
                    x="42"
                    y="48"
                    width="2"
                    height="4"
                    rx="1"
                    fill="#FFB703"
                    transform="rotate(30 42 48)"
                  />
                  <rect
                    x="58"
                    y="46"
                    width="2"
                    height="4"
                    rx="1"
                    fill="#219EBC"
                    transform="rotate(-40 58 46)"
                  />
                  <rect
                    x="35"
                    y="38"
                    width="2"
                    height="4"
                    rx="1"
                    fill="#8ECAE6"
                    transform="rotate(15 35 38)"
                  />
                  <rect
                    x="65"
                    y="36"
                    width="2"
                    height="4"
                    rx="1"
                    fill="#FB8500"
                    transform="rotate(-15 65 36)"
                  />
                  <rect
                    x="48"
                    y="24"
                    width="2"
                    height="4"
                    rx="1"
                    fill="#FF007F"
                    transform="rotate(45 48 24)"
                  />
                </svg>
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Popular
                </span>
              </div>
              <div className="p-5 border-t border-border/30">
                <h4 className="font-sans font-bold text-foreground mb-1">
                  Luxury Cupcakes
                </h4>
                <P className="text-xs leading-relaxed">
                  Super-moist cupcakes topped with luscious whipped
                  buttercreams, fresh fruit compotes, and custom handmade sugar
                  decorations.
                </P>
              </div>
            </div>

            {/* Signature Item 2 */}
            <div className="bg-card/40 border border-border/40 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
              <div className="aspect-4/3 bg-linear-to-br from-accent/10 to-primary/5 flex items-center justify-center relative p-6">
                {/* SVG Illustration for Tray Bake / Brownie */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 drop-shadow-md select-none group-hover:scale-110 transition-transform duration-300"
                >
                  <title>Gourmet Tray Bakes</title>
                  {/* Background / Bottom Brownie slice (angled) */}
                  <g transform="translate(10, 15) rotate(-8 40 40)">
                    <path
                      d="M 5 30 L 75 30 L 65 65 L 15 65 Z"
                      fill="#3D251E"
                      stroke="#2B1A16"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {/* Side texture */}
                    <path
                      d="M 15 65 L 15 75 C 15 78 18 80 22 80 L 60 80 C 64 80 65 78 65 75 L 65 65 Z"
                      fill="#2B1A16"
                    />
                    <path
                      d="M 5 30 L 5 40 C 5 42 7 45 10 45 L 15 45 L 15 65"
                      fill="none"
                      stroke="#2B1A16"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Foreground / Top Brownie slice (angled opposite) */}
                  <g transform="translate(15, 8) rotate(6 40 40)">
                    <path
                      d="M 10 25 L 70 25 L 60 60 L 20 60 Z"
                      fill="#4E3127"
                      stroke="#3D251E"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {/* Side depth */}
                    <path
                      d="M 20 60 L 20 70 C 20 73 23 75 27 75 L 53 75 C 57 75 60 73 60 70 L 60 60 Z"
                      fill="#311E18"
                      stroke="#231510"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                    {/* Caramel/Chocolate Drizzle on Top Brownie */}
                    <path
                      d="M 22 28 Q 30 45 35 28 Q 45 48 50 30 Q 55 45 60 33"
                      fill="none"
                      stroke="#C68B59"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 16 35 Q 28 52 32 38 Q 44 55 48 40 Q 56 50 62 42"
                      fill="none"
                      stroke="#C68B59"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Sea Salt / Chocolate flakes (tiny white/golden squares) */}
                    <rect
                      x="25"
                      y="32"
                      width="2.5"
                      height="2.5"
                      rx="0.5"
                      fill="#FFFFFF"
                      transform="rotate(12 25 32)"
                      opacity="0.9"
                    />
                    <rect
                      x="45"
                      y="48"
                      width="2.5"
                      height="2.5"
                      rx="0.5"
                      fill="#FFFFFF"
                      transform="rotate(-30 45 48)"
                      opacity="0.9"
                    />
                    <rect
                      x="52"
                      y="31"
                      width="2"
                      height="2"
                      rx="0.5"
                      fill="#E6C594"
                      transform="rotate(45 52 31)"
                    />
                    <rect
                      x="30"
                      y="52"
                      width="2"
                      height="2"
                      rx="0.5"
                      fill="#E6C594"
                      transform="rotate(15 30 52)"
                    />
                    <rect
                      x="38"
                      y="35"
                      width="2"
                      height="2"
                      rx="0.5"
                      fill="#3D251E"
                    />
                  </g>
                </svg>
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold bg-accent/10 text-accent px-2.5 py-1 rounded-full">
                  Decadent
                </span>
              </div>
              <div className="p-5 border-t border-border/30">
                <h4 className="font-sans font-bold text-foreground mb-1">
                  Gourmet Tray Bakes
                </h4>
                <P className="text-xs leading-relaxed">
                  Rich Belgian chocolate brownies, caramelized biscoff blondies,
                  and chewy rustic flapjacks that melt in your mouth.
                </P>
              </div>
            </div>

            {/* Signature Item 3 */}
            <div className="bg-card/40 border border-border/40 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
              <div className="aspect-4/3 bg-linear-to-br from-primary/10 to-accent/5 flex items-center justify-center relative p-6">
                {/* SVG Illustration for Celebration Cake */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 drop-shadow-md select-none group-hover:scale-110 transition-transform duration-300"
                >
                  <title>Celebration Layers</title>
                  {/* Cake Stand */}
                  <path
                    d="M 15 90 L 85 90 L 80 94 C 80 96 20 96 20 94 Z"
                    fill="#E5E5E5"
                    stroke="#CCCCCC"
                    strokeWidth="1"
                  />
                  <path
                    d="M 35 94 L 45 94 L 48 98 L 52 98 L 55 94 L 65 94"
                    fill="none"
                    stroke="#CCCCCC"
                    strokeWidth="2"
                  />
                  <line
                    x1="10"
                    y1="90"
                    x2="90"
                    y2="90"
                    stroke="#CCCCCC"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Bottom Tier (Tier 1) */}
                  <rect
                    x="22"
                    y="58"
                    width="56"
                    height="30"
                    rx="3"
                    fill="#FFE5B4"
                    stroke="#DDB892"
                    strokeWidth="1.5"
                  />
                  {/* Frosting Bottom Rim */}
                  <path
                    d="M 22 84 Q 25 86 28 84 Q 31 82 34 84 Q 37 86 40 84 Q 43 82 46 84 Q 49 86 52 84 Q 55 82 58 84 Q 61 86 64 84 Q 67 82 70 84 Q 73 86 76 84 Q 78 82 78 84"
                    fill="none"
                    stroke="#FFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Decorative Flowers/Dots on Tier 1 */}
                  <circle cx="32" cy="72" r="2.5" fill="#F4C2C2" />
                  <circle cx="50" cy="72" r="2.5" fill="#F4C2C2" />
                  <circle cx="68" cy="72" r="2.5" fill="#F4C2C2" />
                  <circle cx="41" cy="72" r="1.5" fill="#B7B7A4" />
                  <circle cx="59" cy="72" r="1.5" fill="#B7B7A4" />

                  {/* Top Tier (Tier 2) */}
                  <rect
                    x="32"
                    y="32"
                    width="36"
                    height="26"
                    rx="3"
                    fill="#FFF0F5"
                    stroke="#E0B0FF"
                    strokeWidth="1.5"
                  />
                  {/* Frosting Swags / Drips on Tier 2 */}
                  <path
                    d="M 32 38 Q 41 46 50 38 Q 59 46 68 38"
                    fill="none"
                    stroke="#E0B0FF"
                    strokeWidth="2"
                  />
                  <path
                    d="M 32 44 Q 41 52 50 44 Q 59 52 68 44"
                    fill="none"
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                  {/* Decorative Dots on Tier 2 */}
                  <circle cx="41" cy="48" r="1.5" fill="#FFD700" />
                  <circle cx="50" cy="48" r="1.5" fill="#FFD700" />
                  <circle cx="59" cy="48" r="1.5" fill="#FFD700" />

                  {/* Candle */}
                  <rect
                    x="48"
                    y="16"
                    width="4"
                    height="16"
                    fill="#A8DADC"
                    rx="0.5"
                  />
                  {/* Candle stripes */}
                  <line
                    x1="48"
                    y1="20"
                    x2="52"
                    y2="18"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  <line
                    x1="48"
                    y1="26"
                    x2="52"
                    y2="24"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  {/* Flame */}
                  <path
                    d="M 50 16 C 52 16 54 12 50 6 C 46 12 48 16 50 16 Z"
                    fill="#FF5F1F"
                    className="animate-pulse"
                  />
                  <path
                    d="M 50 15 C 51 15 52 13 50 9 C 48 13 49 15 50 15 Z"
                    fill="#FFD700"
                  />
                </svg>
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Custom
                </span>
              </div>
              <div className="p-5 border-t border-border/30">
                <h4 className="font-sans font-bold text-foreground mb-1">
                  Celebration Layers
                </h4>
                <P className="text-xs leading-relaxed">
                  Bespoke, multi-tiered cakes tailored to your unique
                  celebrations. Choose your flavor profiles, frosting styles,
                  and decorations.
                </P>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Brand Identity */}
      <footer className="w-full border-t border-border/50 py-12 px-6 bg-card/10 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <span className="font-signature text-3xl text-primary font-medium">
              Deelicious Bakes
            </span>
            <P className="text-xs tracking-wider text-muted-foreground font-medium">
              PRE-ORDERS ONLY • LOCALLY CRAFTED IN SALISBURY • FRESH DAILY
            </P>
          </div>

          {/* Social Media Connect */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-4">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noreferrer"
                className="size-10 rounded-full border border-border/60 bg-card/40 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                aria-label="Follow Deelicious Bakes on Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <title>Facebook</title>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noreferrer"
                className="size-10 rounded-full border border-border/60 bg-card/40 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                aria-label="Follow Deelicious Bakes on Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <title>Instagram</title>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href={siteConfig.links.email}
                className="size-10 rounded-full border border-border/60 bg-card/40 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                aria-label="Email Deelicious Bakes"
              >
                <Mail className="size-5" />
              </a>
            </div>
            <P className="text-[10px] tracking-widest text-accent font-bold uppercase">
              Fresh ingredients. Lots of love. Unforgettable flavours.
            </P>
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center border-t border-border/30 mt-8 pt-6">
          <Muted className="text-[11px] text-muted-foreground/80">
            &copy; {new Date().getFullYear()} Deelicious Bakes Salisbury. All
            rights reserved. Made with love for sweet bakes.
          </Muted>
        </div>
      </footer>
    </div>
  );
}
