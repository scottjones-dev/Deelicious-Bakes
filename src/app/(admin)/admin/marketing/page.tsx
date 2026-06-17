import { ArrowUpRight, Calendar, Mail, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MarketingPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight font-heading">
              Marketing Campaigns
            </h1>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-semibold"
            >
              <Sparkles className="size-3 mr-1 animate-pulse" />
              Upcoming Feature
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Grow your audience, schedule social media posts, and design
            beautiful newsletter campaigns for your waitlist.
          </p>
        </div>
      </div>

      {/* Hero Announcement banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-accent/5 to-card border border-primary/20 p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge className="bg-primary text-primary-foreground font-semibold rounded-full uppercase tracking-wider text-[10px]">
            Development Roadmap
          </Badge>
          <h2 className="text-2xl font-bold font-heading text-foreground">
            Interactive React Email Editor & Multi-Channel Planner
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We are currently building out a powerful marketing hub. Your
            Salisbury waitlist is growing, and soon you'll be able to send them
            beautiful custom-crafted emails, compose rustic announcements, and
            manage your social channels in one unified, effortless dashboard.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span>Learn more about the roadmap</span>
            <ArrowUpRight className="size-3.5" />
          </div>
        </div>
        {/* Background glow decorator */}
        <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </div>

      {/* Main Feature Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* React Email Builder */}
        <Card className="bg-card/40 border-border/40 hover:border-primary/15 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-heading text-xl">
                React Email Builder
              </CardTitle>
              <CardDescription>
                Visual drag-and-drop newsletter designer
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Design mouth-watering emails featuring your signature cakes and
              weekend tray bakes. Send scheduled newsletters, product launch
              invites, or exclusive discount codes to your waitlist subscribers
              with instant delivery via Resend.
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground/90 pl-1">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Live visual templates matching Deelicious branding
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Waitlist list segmenting (only Salisbury, general, etc.)
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Real-time open rates, clicks, and checkout conversions
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Social Media Scheduler */}
        <Card className="bg-card/40 border-border/40 hover:border-accent/15 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <Share2 className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-heading text-xl">
                Social Post Scheduler
              </CardTitle>
              <CardDescription>
                Facebook, Instagram & TikTok automated planner
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Queue up photo showcases of your celebration bakes and piping
              videos. Schedule posts in advance to publish at peak engagement
              times, keeping your bakery's feed constantly fresh without daily
              hassle.
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground/90 pl-1">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                One-click posting to Facebook, Instagram, and TikTok
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                Visual drag-and-drop media content calendar
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                AI post description helper tailored for local foodies
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Integration Roadmap Details */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            Marketing Integration Roadmap
          </CardTitle>
          <CardDescription>
            What we are planning to ship in the next phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-border pl-6 space-y-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-7.75 top-1 size-4 rounded-full bg-primary border-4 border-card" />
              <h4 className="text-sm font-bold text-foreground">
                Phase 1: Waitlist Growth & Analytics
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Track real-time waitlist subscriptions from Salisbury directly
                inside your dashboard. Export contacts cleanly and sync
                seamlessly to Resend's marketing list. (Currently Active!)
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative opacity-80">
              <div className="absolute -left-7.75 top-1 size-4 rounded-full bg-border border-4 border-card" />
              <h4 className="text-sm font-bold text-foreground">
                Phase 2: React Email Newsletters
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Enable local Salisbury pre-order alerts and release a
                drag-and-drop React Email campaign manager to broadcast weekly
                baking menus.
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative opacity-60">
              <div className="absolute -left-7.75 top-1 size-4 rounded-full bg-border border-4 border-card" />
              <h4 className="text-sm font-bold text-foreground">
                Phase 3: Facebook & Instagram Direct Scheduling
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Integrate directly with Meta Business Suite API. Manage, edit,
                and post visual bakes updates and reels from one click inside
                your admin dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
