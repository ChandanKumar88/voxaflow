import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mic, Upload, Square, Phone, Plus, LayoutDashboard, Users, Workflow, Settings, LogOut, Sparkles,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VoxaFlow" },
      { name: "description", content: "Your voice-first CRM dashboard." },
    ],
  }),
  component: Dashboard,
});

const STAGES = ["New Lead", "Contacted", "Interested", "Negotiation", "Closed"] as const;
type Stage = (typeof STAGES)[number];

type Deal = { id: string; company: string; contact: string; value: string; stage: Stage; note: string };
type Contact = { id: string; name: string; phone: string; note: string };
type VoiceEntry = { id: string; title: string; transcript: string; date: string };

const seedDeals: Deal[] = [
  { id: "1", company: "Acme Corp", contact: "Maria Lopez", value: "$120k", stage: "Proposal" as Stage, note: "Sent proposal Friday." },
  { id: "2", company: "Globex", contact: "John Park", value: "$45k", stage: "Interested", note: "Wants demo next week." },
  { id: "3", company: "Initech", contact: "Sara Khan", value: "$88k", stage: "Negotiation", note: "Pricing review." },
  { id: "4", company: "Umbrella", contact: "Diego Rivera", value: "$22k", stage: "New Lead", note: "Inbound from referral." },
  { id: "5", company: "Hooli", contact: "Aiko Tanaka", value: "$210k", stage: "Closed", note: "Won — kickoff scheduled." },
  { id: "6", company: "Stark Ind.", contact: "Liam Brown", value: "$60k", stage: "Contacted", note: "Left voicemail." },
];

const seedContacts: Contact[] = [
  { id: "c1", name: "Maria Lopez", phone: "+1 415 555 0142", note: "Procurement lead at Acme." },
  { id: "c2", name: "John Park", phone: "+1 212 555 0188", note: "Wants WhatsApp follow-up." },
  { id: "c3", name: "Sara Khan", phone: "+44 20 7946 0991", note: "Decision maker." },
];

const seedEntries: VoiceEntry[] = [
  { id: "v1", title: "Call with Maria — Acme", date: "Today, 10:24", transcript: "Maria confirmed budget approved. Wants kickoff in two weeks. Send updated proposal by Friday." },
  { id: "v2", title: "WhatsApp note — John", date: "Yesterday, 18:02", transcript: "John interested in voice features. Schedule a demo next Tuesday at 3pm." },
];

function Dashboard() {
  const [deals, setDeals] = useState<Deal[]>(seedDeals.map(d => ({ ...d, stage: STAGES.includes(d.stage) ? d.stage : "Interested" })));
  const [contacts] = useState<Contact[]>(seedContacts);
  const [entries, setEntries] = useState<VoiceEntry[]>(seedEntries);
  const [recording, setRecording] = useState(false);

  const totalValue = deals.length;
  const closed = deals.filter(d => d.stage === "Closed").length;

  const addMockEntry = () => {
    const id = `v${Date.now()}`;
    setEntries((prev) => [
      { id, title: "New voice note", date: "Just now", transcript: "Transcription will appear here once processing completes." },
      ...prev,
    ]);
    setRecording(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1">
        <Topbar />
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
              <p className="text-muted-foreground">Here's what's moving in your pipeline today.</p>
            </div>
            <Button className="bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" /> New deal
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Open deals" value={String(totalValue - closed)} hint="+3 this week" />
            <StatCard label="Closed (mo)" value={String(closed)} hint="+1 vs last mo" />
            <StatCard label="Voice notes" value={String(entries.length)} hint="Auto-logged" />
            <StatCard label="Follow-ups" value="7" hint="Due this week" />
          </div>

          {/* Voice + Pipeline */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/60 p-6 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Voice input</h2>
                <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>
              </div>
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-gradient-hero p-8 text-center">
                <button
                  onClick={() => (recording ? addMockEntry() : setRecording(true))}
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-brand transition-transform hover:scale-105 ${recording ? "animate-pulse" : ""}`}
                >
                  {recording ? <Square className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                </button>
                <p className="mt-4 text-sm font-medium">{recording ? "Recording… tap to stop" : "Tap to record a voice note"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Or upload an audio file</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={addMockEntry}>
                  <Upload className="mr-2 h-4 w-4" /> Upload audio
                </Button>
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Recent transcripts</h3>
                {entries.map((e) => (
                  <div key={e.id} className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{e.title}</span>
                      <span className="text-xs text-muted-foreground">{e.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.transcript}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Pipeline</h2>
                <span className="text-xs text-muted-foreground">{deals.length} deals</span>
              </div>
              <div className="mt-6 grid gap-3 overflow-x-auto md:grid-cols-5">
                {STAGES.map((stage) => (
                  <div key={stage} className="min-w-[160px] rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>{stage}</span>
                      <span>{deals.filter(d => d.stage === stage).length}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {deals.filter(d => d.stage === stage).map((d) => (
                        <div key={d.id} className="cursor-pointer rounded-lg border border-border/60 bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-soft">
                          <div className="font-semibold">{d.company}</div>
                          <div className="text-xs text-muted-foreground">{d.contact}</div>
                          <div className="mt-1 text-xs font-medium text-brand">{d.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Add deal + contacts */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/60 p-6 lg:col-span-1">
              <h2 className="font-semibold">Quick add deal</h2>
              <div className="mt-4 space-y-3">
                <Input placeholder="Company" id="qa-company" />
                <Input placeholder="Contact name" id="qa-contact" />
                <Input placeholder="Value (e.g. $25k)" id="qa-value" />
                <Textarea placeholder="Notes" rows={3} />
                <Button
                  className="w-full bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95"
                  onClick={() => {
                    const company = (document.getElementById("qa-company") as HTMLInputElement)?.value || "New Co";
                    const contact = (document.getElementById("qa-contact") as HTMLInputElement)?.value || "—";
                    const value = (document.getElementById("qa-value") as HTMLInputElement)?.value || "$0";
                    setDeals((prev) => [{ id: `d${Date.now()}`, company, contact, value, stage: "New Lead", note: "" }, ...prev]);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add deal
                </Button>
              </div>
            </Card>

            <Card className="border-border/60 p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Contacts</h2>
                <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> New contact</Button>
              </div>
              <div className="mt-4 divide-y divide-border/60">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.note}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-border/60 p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="border-b border-sidebar-border px-5 py-4">
        <Link to="/"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-1 p-3 text-sm">
        <NavItem icon={LayoutDashboard} label="Overview" active />
        <NavItem icon={Workflow} label="Pipeline" />
        <NavItem icon={Users} label="Contacts" />
        <NavItem icon={Mic} label="Voice notes" />
        <NavItem icon={Settings} label="Settings" />
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Log out
        </Link>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: React.ElementType; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        active ? "bg-gradient-brand text-primary-foreground shadow-brand" : "hover:bg-sidebar-accent"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Topbar() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
      <div className="md:hidden"><Logo /></div>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">Jane Doe</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">JD</div>
      </div>
    </div>
  );
}
