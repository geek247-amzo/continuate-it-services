import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { createTicket, fetchPortalSummary, type Profile, type Ticket } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/formatters";

const statusColor = (s: string) => {
  if (s === "Open") return "bg-foreground text-background";
  if (s === "In Progress") return "bg-muted-foreground text-background";
  return "bg-muted text-muted-foreground";
};

const priorityStyle = (p: string) => {
  if (p === "High") return "text-foreground font-semibold";
  if (p === "Medium") return "text-muted-foreground font-medium";
  return "text-muted-foreground";
};

const PortalHelpdesk = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    subject: "",
    category: "General",
    priority: "Medium",
    description: "",
  });

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    const load = async () => {
      try {
        const summary = await fetchPortalSummary(user.email);
        if (!active) return;
        setProfile(summary.profile);
        setTickets(summary.tickets ?? []);
      } catch (error) {
        if (!active) return;
        setProfile(null);
        setTickets([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term)
    );
  }, [tickets, search]);

  const handleSubmit = async () => {
    if (!user?.email) return;
    const customer = profile?.company ?? profile?.name ?? user.email;
    try {
    const created = await createTicket({
      customer,
      requesterName: profile?.name ?? user.email,
      requesterEmail: user.email,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      description: form.description,
    });
      setTickets((prev) => [created, ...prev]);
      setShowNew(false);
      setForm({ subject: "", category: "General", priority: "Medium", description: "" });
      toast({ title: "Ticket submitted", description: `${created.id} created.` });
    } catch (error) {
      toast({
        title: "Ticket failed",
        description: error instanceof Error ? error.message : "Unable to create ticket.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">Helpdesk</h2>
          <p className="text-sm text-muted-foreground">Submit and track support tickets.</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} className="gap-2">
          <Plus size={16} /> New Ticket
        </Button>
      </motion.div>

      {showNew && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    <option>Networking</option>
                    <option>Cybersecurity</option>
                    <option>Backups</option>
                    <option>CCTV</option>
                    <option>Hardware</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Attachment</Label>
                  <Input type="file" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Detailed description..."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="button" onClick={handleSubmit} disabled={!form.subject}>
                    Submit Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {["all", "open", "resolved"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                          Loading tickets…
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered
                        .filter((t) => {
                          if (tab === "open") return t.status !== "Resolved";
                          if (tab === "resolved") return t.status === "Resolved";
                          return true;
                        })
                        .map((t) => (
                          <TableRow key={t.id} className="cursor-pointer">
                            <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                            <TableCell className="font-medium text-foreground">{t.subject}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{t.category}</TableCell>
                            <TableCell className={`hidden sm:table-cell ${priorityStyle(t.priority ?? "Low")}`}>{t.priority}</TableCell>
                            <TableCell><Badge className={statusColor(t.status ?? "Open")}>{t.status}</Badge></TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{formatDate(t.updatedAt)}</TableCell>
                          </TableRow>
                        ))
                    )}
                    {!loading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                          No tickets yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PortalHelpdesk;
