import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp } from "@/lib/animations";
import { fetchContracts, type Contract } from "@/lib/api";
import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, LifeBuoy, BarChart3, Search, AlertTriangle, CalendarClock } from "lucide-react";

const statusColor = (status: string) => {
  if (status === "Active") return "bg-emerald-500/15 text-emerald-700";
  if (status === "Pending") return "bg-amber-500/15 text-amber-700";
  if (status === "Renewal") return "bg-sky-500/15 text-sky-700";
  return "bg-secondary text-secondary-foreground";
};

const parseDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const AdminContracts = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContracts();
      setContracts(data);
    } catch (error) {
      setContracts([]);
      setError(error instanceof Error ? error.message : "Unable to load contracts from the API.");
      toast({
        title: "Contract data offline",
        description: "Unable to load contracts from the API.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const guardedLoad = async () => {
      await loadContracts();
      if (!active) return;
    };
    guardedLoad();
    return () => {
      active = false;
    };
  }, [toast]);

  const filteredContracts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return contracts;
    return contracts.filter((contract) => {
      return (
        contract.customer.toLowerCase().includes(trimmed) ||
        contract.id.toLowerCase().includes(trimmed) ||
        (contract.quoteId ?? "").toLowerCase().includes(trimmed)
      );
    });
  }, [contracts, query]);

  const summary = useMemo(() => {
    const activeCount = contracts.filter((c) => c.status === "Active").length;
    const totalMrr = contracts.reduce((sum, c) => sum + Number(c.mrr || 0), 0);
    const totalArr = contracts.reduce((sum, c) => sum + Number(c.arr || 0), 0);
    const atRisk = contracts.filter((c) => (c.healthScore ?? 100) < 70 || c.riskLevel === "High").length;

    const next90 = new Date();
    next90.setDate(next90.getDate() + 90);
    const renewals = contracts.filter((c) => {
      const date = parseDate(c.renewalDate);
      return date && date <= next90;
    }).length;

    return { activeCount, totalMrr, totalArr, renewals, atRisk };
  }, [contracts]);

  const stats = useMemo(() => {
    return [
      { label: "Active Contracts", value: summary.activeCount, icon: Shield },
      { label: "MRR Tracked", value: formatCurrency(summary.totalMrr), icon: LifeBuoy },
      { label: "ARR Tracked", value: formatCurrency(summary.totalArr), icon: BarChart3 },
      { label: "Renewals < 90d", value: summary.renewals, icon: CalendarClock },
      { label: "At-Risk Accounts", value: summary.atRisk, icon: AlertTriangle },
    ];
  }, [summary]);

  const renewalPipeline = useMemo(() => {
    const sorted = [...contracts]
      .map((contract) => ({ contract, renewal: parseDate(contract.renewalDate) }))
      .filter((item) => item.renewal)
      .sort((a, b) => (a.renewal?.getTime() ?? 0) - (b.renewal?.getTime() ?? 0));
    return sorted.slice(0, 4);
  }, [contracts]);

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">Contracts</h2>
            <p className="text-sm text-muted-foreground">
              Manage support coverage, KPIs, and service levels for accepted proposals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/quotes">Convert Accepted Quote</Link>
            </Button>
            <Button>New Contract Brief</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={index + 1}>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                  <stat.icon size={18} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
        <Card>
          <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground w-full lg:max-w-sm">
              <Search size={16} />
              <Input
                placeholder="Search by customer, contract ID, or quote ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{formatCompactNumber(filteredContracts.length)} contracts shown</span>
              <span>•</span>
              <span>Next renewal in {formatDate(renewalPipeline[0]?.contract.renewalDate)}</span>
            </div>
            <div className="flex-1" />
            {error && (
              <Button size="sm" variant="outline" onClick={loadContracts}>
                Retry Load
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA Tier</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8">
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-[60%]" />
                          <Skeleton className="h-4 w-[40%]" />
                          <Skeleton className="h-4 w-[70%]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="space-y-1">
                          <Link to={`/admin/contracts/${contract.id}`} className="hover:underline">
                            {contract.id}
                          </Link>
                          <p className="text-xs text-muted-foreground">Source {contract.quoteId ?? "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.customer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.owner ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(contract.status)}>{contract.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.slaTier ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatCurrency(contract.mrr ?? 0, contract.billingCurrency ?? "USD")}
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={contract.healthScore ?? 0} />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(contract.renewalDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/contracts/${contract.id}`}>Manage</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && filteredContracts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                        No contracts match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Renewal Pipeline</p>
                <Badge variant="outline">{renewalPipeline.length} upcoming</Badge>
              </div>
              <div className="space-y-3">
                {renewalPipeline.map(({ contract }) => (
                  <div key={contract.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{contract.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {contract.id} • Renewal {formatDate(contract.renewalDate)}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Risk: {contract.riskLevel ?? "—"}</span>
                      <span>Health: {contract.healthScore ?? 0}</span>
                    </div>
                  </div>
                ))}
                {renewalPipeline.length === 0 && (
                  <p className="text-sm text-muted-foreground">No upcoming renewals tracked.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Coverage Snapshot</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active contracts</span>
                <span className="font-medium text-foreground">{formatCompactNumber(summary.activeCount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">At-risk accounts</span>
                <span className="font-medium text-foreground">{summary.atRisk}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Upcoming QBRs</span>
                <span className="font-medium text-foreground">
                  {contracts.filter((c) => parseDate(c.nextQbr)).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContracts;
