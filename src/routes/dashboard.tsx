import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mic, Upload, Square, Phone, Plus, LayoutDashboard, Users, Workflow, Settings, LogOut, Sparkles, Pencil, Trash2, Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { contactsService, type Contact } from "@/services/contacts";
import { dealsService, DEAL_STAGES, type Deal, type DealStage } from "@/services/deals";
import { voiceNotesService, type VoiceNote } from "@/services/voiceNotes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VoxaFlow" },
      { name: "description", content: "Your voice-first CRM dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [dealSearch, setDealSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  // Load data
  const loadAll = async () => {
    try {
      const [c, d, v] = await Promise.all([
        contactsService.list(),
        dealsService.list(),
        voiceNotesService.list({ limit: 10 }),
      ]);
      setContacts(c);
      setDeals(d);
      setVoiceNotes(v);
    } catch (e) {
      const err = e as Error;
      toast.error(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const filteredDeals = useMemo(
    () => deals.filter((d) => !dealSearch || d.company.toLowerCase().includes(dealSearch.toLowerCase())),
    [deals, dealSearch]
  );
  const filteredContacts = useMemo(
    () => contacts.filter((c) => !contactSearch || c.name.toLowerCase().includes(contactSearch.toLowerCase())),
    [contacts, contactSearch]
  );

  const closed = deals.filter((d) => d.stage === "Closed").length;
  const open = deals.length - closed;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  // Voice note quick-add (placeholder transcription)
  const addVoiceNote = async () => {
    try {
      const note = await voiceNotesService.create({
        title: "New voice note",
        transcript: "Transcription will appear here once processing completes.",
      });
      setVoiceNotes((p) => [note, ...p]);
      setRecording(false);
      toast.success("Voice note saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1">
        <Topbar email={user.email ?? ""} onLogout={handleLogout} />
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
              <p className="text-muted-foreground">Here's what's moving in your pipeline today.</p>
            </div>
            <DealDialog onSaved={loadAll} contacts={contacts}>
              <Button className="bg-gradient-brand text-primary-foreground shadow-brand hover:opacity-95">
                <Plus className="mr-2 h-4 w-4" /> New deal
              </Button>
            </DealDialog>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Open deals" value={String(open)} hint={loading ? "Loading…" : "Live data"} />
            <StatCard label="Closed" value={String(closed)} hint="All time" />
            <StatCard label="Voice notes" value={String(voiceNotes.length)} hint="Recent" />
            <StatCard label="Contacts" value={String(contacts.length)} hint="In your CRM" />
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
                  onClick={() => (recording ? addVoiceNote() : setRecording(true))}
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-brand transition-transform hover:scale-105 ${recording ? "animate-pulse" : ""}`}
                >
                  {recording ? <Square className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                </button>
                <p className="mt-4 text-sm font-medium">{recording ? "Recording… tap to stop" : "Tap to record a voice note"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Or upload an audio file</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={addVoiceNote}>
                  <Upload className="mr-2 h-4 w-4" /> Upload audio
                </Button>
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Recent transcripts</h3>
                {voiceNotes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No voice notes yet. Tap the mic to add one.</p>
                )}
                {voiceNotes.map((e) => (
                  <div key={e.id} className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{e.title}</span>
                      <button
                        onClick={async () => {
                          await voiceNotesService.remove(e.id);
                          setVoiceNotes((p) => p.filter((x) => x.id !== e.id));
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.transcript}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 p-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Pipeline</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search company…"
                      value={dealSearch}
                      onChange={(e) => setDealSearch(e.target.value)}
                      className="h-9 w-48 pl-8"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{filteredDeals.length} deals</span>
                </div>
              </div>
              <div className="mt-6 grid gap-3 overflow-x-auto md:grid-cols-5">
                {DEAL_STAGES.map((stage) => (
                  <div key={stage} className="min-w-[160px] rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>{stage}</span>
                      <span>{filteredDeals.filter((d) => d.stage === stage).length}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {filteredDeals
                        .filter((d) => d.stage === stage)
                        .map((d) => (
                          <DealCard key={d.id} deal={d} contacts={contacts} onChanged={loadAll} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Contacts */}
          <Card className="border-border/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Contacts</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts…"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="h-9 w-56 pl-8"
                  />
                </div>
                <ContactDialog onSaved={loadAll}>
                  <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> New contact</Button>
                </ContactDialog>
              </div>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              {filteredContacts.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {contacts.length === 0 ? "No contacts yet. Add your first one." : "No contacts match your search."}
                </p>
              )}
              {filteredContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
                      {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.company || c.notes || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {c.phone && (
                      <span className="hidden items-center gap-1 sm:flex">
                        <Phone className="h-4 w-4" /> {c.phone}
                      </span>
                    )}
                    <ContactDialog contact={c} onSaved={loadAll}>
                      <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                    </ContactDialog>
                    <DeleteButton
                      title="Delete contact?"
                      description={`This will permanently remove ${c.name}.`}
                      onConfirm={async () => {
                        await contactsService.remove(c.id);
                        toast.success("Contact deleted");
                        loadAll();
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// Pieces
// =====================================================

function DealCard({ deal, contacts, onChanged }: { deal: Deal; contacts: Contact[]; onChanged: () => void }) {
  return (
    <div className="group cursor-pointer rounded-lg border border-border/60 bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{deal.company}</div>
          <div className="truncate text-xs text-muted-foreground">{deal.contact_name || "—"}</div>
          {deal.value !== null && (
            <div className="mt-1 text-xs font-medium text-brand">
              {deal.currency} {Number(deal.value).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <DealDialog deal={deal} contacts={contacts} onSaved={onChanged}>
            <button className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
          </DealDialog>
          <DeleteButton
            small
            title="Delete deal?"
            description={`This will permanently remove the deal with ${deal.company}.`}
            onConfirm={async () => {
              await dealsService.remove(deal.id);
              toast.success("Deal deleted");
              onChanged();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DealDialog({
  children, deal, contacts, onSaved,
}: { children: React.ReactNode; deal?: Deal; contacts: Contact[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(deal?.company ?? "");
  const [contactName, setContactName] = useState(deal?.contact_name ?? "");
  const [contactId, setContactId] = useState<string | "none">(deal?.contact_id ?? "none");
  const [value, setValue] = useState(deal?.value !== null && deal?.value !== undefined ? String(deal.value) : "");
  const [stage, setStage] = useState<DealStage>(deal?.stage ?? "New Lead");
  const [notes, setNotes] = useState(deal?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      toast.error("Company is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        company: company.trim(),
        contact_name: contactName.trim() || null,
        contact_id: contactId === "none" ? null : contactId,
        value: value ? Number(value) : null,
        stage,
        notes: notes.trim() || null,
      };
      if (deal) {
        await dealsService.update(deal.id, payload);
        toast.success("Deal updated");
      } else {
        await dealsService.create(payload);
        toast.success("Deal created");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deal ? "Edit deal" : "New deal"}</DialogTitle>
          <DialogDescription>Track a new opportunity in your pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Company *" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <Input placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          {contacts.length > 0 && (
            <Select value={contactId} onValueChange={(v) => setContactId(v as string)}>
              <SelectTrigger><SelectValue placeholder="Link to contact (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked contact</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input type="number" inputMode="decimal" placeholder="Value (e.g. 25000)" value={value} onChange={(e) => setValue(e.target.value)} />
          <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea placeholder="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-gradient-brand text-primary-foreground shadow-brand">
              {saving ? "Saving…" : deal ? "Update deal" : "Create deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContactDialog({
  children, contact, onSaved,
}: { children: React.ReactNode; contact?: Contact; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        company: company.trim() || null,
        notes: notes.trim() || null,
      };
      if (contact) {
        await contactsService.update(contact.id, payload);
        toast.success("Contact updated");
      } else {
        await contactsService.create(payload);
        toast.success("Contact created");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "New contact"}</DialogTitle>
          <DialogDescription>Add a contact to your CRM.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Textarea placeholder="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-gradient-brand text-primary-foreground shadow-brand">
              {saving ? "Saving…" : contact ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton({
  title, description, onConfirm, small,
}: { title: string; description: string; onConfirm: () => Promise<void>; small?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {small ? (
        <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              try {
                await onConfirm();
              } catch (err) {
                toast.error((err as Error).message);
              }
              setOpen(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

function Sidebar({ onLogout }: { onLogout: () => void }) {
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
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
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

function Topbar({ email, onLogout }: { email: string; onLogout: () => void }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : "U";
  return (
    <div className="flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
      <div className="md:hidden"><Logo /></div>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
          {initials}
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="md:hidden">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
