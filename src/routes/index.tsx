import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, ListChecks, Users, Sparkles, Workflow, Headphones, Check } from "lucide-react";
import heroImg from "@/assets/voxaflow-hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoxaFlow — Your CRM that listens while you sell" },
      { name: "description", content: "Log deals, track leads, and update CRM — just by speaking. Voice-first CRM built for field sales teams." },
      { property: "og:title", content: "VoxaFlow — The No-Typing CRM" },
      { property: "og:description", content: "Close deals faster by talking, not typing. AI turns your voice notes into structured CRM entries." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_20%_20%,oklch(0.78_0.15_215/0.25),transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.55_0.22_265/0.25),transparent_50%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Voice-first CRM for modern sales teams
          </div>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Your CRM that <span className="text-gradient-brand">listens</span> while you sell.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Log deals, track leads, and update your pipeline — just by speaking.
            VoxaFlow turns voice notes and calls into structured CRM data, automatically.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95">
                Start Free Trial
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline">See how it works</Button>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> No credit card</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-brand" /> 14-day trial</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-brand opacity-20 blur-3xl" />
          <img
            src={heroImg}
            alt="VoxaFlow voice pipeline turning conversations into deals"
            className="w-full rounded-3xl border border-border/60 shadow-brand"
          />
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Mic, title: "Voice-to-CRM Logging", desc: "Record or upload voice notes and we'll create structured leads, deals and follow-ups." },
  { icon: Sparkles, title: "AI Transcription & Summary", desc: "Every call is transcribed and summarized so nothing important slips through the cracks." },
  { icon: Workflow, title: "Deal Pipeline", desc: "Drag-free pipeline stages — New, Contacted, Interested, Negotiation, Closed." },
  { icon: Users, title: "Contact Timeline", desc: "Every voice log, note and update on a clean per-contact timeline." },
  { icon: Headphones, title: "Built for the field", desc: "Optimized for phone calls and WhatsApp voice notes — works on the go." },
  { icon: ListChecks, title: "Smart follow-ups", desc: "AI extracts dates and action items so you never forget to call back." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Everything a sales team needs, hands-free.</h2>
        <p className="mt-4 text-lg text-muted-foreground">Stop typing. Start closing. VoxaFlow keeps your CRM updated automatically.</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="group border-border/60 p-6 transition-all hover:border-brand/40 hover:shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-brand">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Speak naturally", desc: "Record a voice note after a call, or upload a WhatsApp audio. No formatting needed." },
  { n: "02", title: "AI structures it", desc: "VoxaFlow transcribes, summarizes, and extracts contact, deal stage and next steps." },
  { n: "03", title: "Pipeline stays fresh", desc: "Your leads, deals and follow-ups update automatically — ready when you are." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Three steps from voice to closed deal.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
              <div className="text-gradient-brand font-display text-5xl font-bold">{s.n}</div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const tiers = [
  { name: "Starter", price: "$0", period: "/mo", desc: "For solo sellers trying voice-first CRM.", features: ["50 voice notes / mo", "1 pipeline", "Basic transcription"], cta: "Start free", featured: false },
  { name: "Growth", price: "$19", period: "/user/mo", desc: "For small teams closing more deals.", features: ["Unlimited voice notes", "AI summaries & follow-ups", "Team pipelines", "WhatsApp uploads"], cta: "Start free trial", featured: true },
  { name: "Business", price: "$49", period: "/user/mo", desc: "For growing sales orgs that need control.", features: ["Everything in Growth", "Advanced analytics", "Roles & permissions", "Priority support"], cta: "Contact sales", featured: false },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Simple pricing that scales</h2>
        <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when your team is ready.</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={`relative p-8 ${t.featured ? "border-brand/60 shadow-brand" : "border-border/60"}`}
          >
            {t.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground shadow-brand">
                Most popular
              </div>
            )}
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-display text-5xl font-bold">{t.price}</span>
              <span className="pb-2 text-sm text-muted-foreground">{t.period}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-8 block">
              <Button
                className={`w-full ${t.featured ? "bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95" : ""}`}
                variant={t.featured ? "default" : "outline"}
              >
                {t.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-12 text-center shadow-brand md:p-20">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />
        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
            Stop typing. Start closing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
            Join sales teams who let VoxaFlow handle the CRM while they focus on winning deals.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="mt-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
