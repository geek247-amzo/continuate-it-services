import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { fetchTickets, type Ticket } from "@/lib/api";
import { formatDate } from "@/lib/formatters";

const statusColor = (s: string) => {
  if (s === "Open") return "bg-foreground text-background";
  if (s === "In Progress") return "bg-muted-foreground text-background";
  return "bg-muted text-muted-foreground";
};

const AdminTickets = () => {
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchTickets()
      .then((data) => {
        if (!active) return;
        setTickets(data);
      })
      .catch(() => {
        if (!active) return;
        setTickets([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(term) ||
        (t.customer ?? "").toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term)
    );
  }, [tickets, search]);

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Ticket Management</h2>
        <p className="text-sm text-muted-foreground">
          {tickets.filter((t) => t.status !== "Resolved").length} open · {tickets.length} total
        </p>
      </motion.div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {["all", "open", "progress", "resolved"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Client</TableHead>
                      <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">SLA</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                          Loading tickets…
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered
                        .filter((t) => {
                          if (tab === "open") return t.status === "Open";
                          if (tab === "progress") return t.status === "In Progress";
                          if (tab === "resolved") return t.status === "Resolved";
                          return true;
                        })
                        .map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                            <TableCell className="font-medium text-foreground">{t.subject}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{t.customer}</TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground">{t.assignedTo ?? "Unassigned"}</TableCell>
                            <TableCell className={`hidden sm:table-cell ${t.priority === "High" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{t.priority}</TableCell>
                            <TableCell><Badge className={statusColor(t.status ?? "Open")}>{t.status}</Badge></TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {formatDate(t.slaDueAt)}
                            </TableCell>
                            <TableCell><Button variant="ghost" size="sm">Manage</Button></TableCell>
                          </TableRow>
                        ))
                    )}
                    {!loading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
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

export default AdminTickets;
