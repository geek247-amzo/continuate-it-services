import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { fetchContract, type Contract } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, ShieldCheck, BarChart3, ClipboardList, CalendarCheck, Users } from "lucide-react";

const statusColor = (status: string) => {
  if (status === "Active") return "bg-emerald-500/15 text-emerald-700";
  if (status === "Pending") return "bg-amber-500/15 text-amber-700";
  return "bg-secondary text-secondary-foreground";
};

const AdminContractDetail = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContract = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContract(id);
      setContract(data);
    } catch (error) {
      toast({
        title: "Contract data offline",
        description: "Unable to load contract details from the API.",
        variant: "destructive",
      });
      setContract(null);
      setError(error instanceof Error ? error.message : "Unable to load contract details from the API.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const guardedLoad = async () => {
      await loadContract();
      if (!active) return;
    };
    guardedLoad();
    return () => {
      active = false;
    };
  }, [id, toast]);

  const healthLabel = useMemo(() => {
    const score = contract?.healthScore ?? 0;
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Stable";
    if (score >= 55) return "Watch";
    return "At risk";
  }, [contract?.healthScore]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading contract…</div>;
  }

  if (!contract) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">{error ?? "Contract not found."}</div>
        {error && (
          <Button variant="outline" onClick={loadContract}>
            Retry Load
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={statusColor(contract.status)}>{contract.status}</Badge>
              <span className="text-xs text-muted-foreground">{contract.id}</span>
              <span className="text-xs text-muted-foreground">Source {contract.quoteId ?? "—"}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{contract.customer}</h2>
            <p className="text-sm text-muted-foreground">SLA Tier: {contract.slaTier ?? "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Update KPIs</Button>
            <Button variant="outline">Schedule QBR</Button>
            {contract.quoteId ? (
              <Button asChild>
                <Link to={`/admin/quotes/${contract.quoteId}`}>View Source Quote</Link>
              </Button>
            ) : (
              <Button disabled>View Source Quote</Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner</p>
                  <p className="text-foreground">{contract.owner ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Start Date</p>
                  <p className="text-foreground">{formatDate(contract.startDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Renewal Date</p>
                  <p className="text-foreground">{formatDate(contract.renewalDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Billing Cycle</p>
                  <p className="text-foreground">{contract.billingCycle ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">MRR</p>
                  <p className="text-foreground">
                    {formatCurrency(contract.mrr ?? 0, contract.billingCurrency ?? "USD")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">ARR</p>
                  <p className="text-foreground">
                    {formatCurrency(contract.arr ?? 0, contract.billingCurrency ?? "USD")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {loading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[70%]" />
                    <Skeleton className="h-4 w-[55%]" />
                    <Skeleton className="h-4 w-[60%]" />
                  </div>
                )}
                {!loading && (contract.serviceLevels ?? []).map((level) => (
                  <p key={level}>- {level}</p>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KPI Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Measurement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="space-y-2 py-4">
                            <Skeleton className="h-4 w-[65%]" />
                            <Skeleton className="h-4 w-[50%]" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && (contract.kpis ?? []).map((kpi) => (
                      <TableRow key={kpi.label}>
                        <TableCell className="text-sm font-medium text-foreground">{kpi.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{kpi.target}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{kpi.measurement ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Escalation Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(contract.escalation ?? []).map((step) => (
                      <TableRow key={step.level}>
                        <TableCell className="text-sm font-medium text-foreground">{step.level}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{step.response}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{step.owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <LifeBuoy size={18} />
                  </div>
                  <p>{contract.supportModel ?? "Support model will be finalised during onboarding."}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Coverage</p>
                  <p className="text-sm text-foreground">24/7 Support Desk with on-call escalation</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Scorecard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{healthLabel} health</p>
                    <p>Score {contract.healthScore ?? 0}/100 • Risk {contract.riskLevel ?? "—"}</p>
                    <div className="mt-2">
                      <Progress value={contract.healthScore ?? 0} />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Security Posture</p>
                    <p>Zero high severity findings open.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Renewal & Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment terms</p>
                    <p>{contract.paymentTerms ?? "—"} • Invoice day {contract.invoicingDay ?? "—"}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Renewal window</p>
                  <p className="text-sm text-foreground">
                    Notice by {formatDate(contract.noticeDate)} • Auto-renew {contract.autoRenew ? "On" : "Off"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stakeholders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(contract.contacts ?? []).map((contact) => (
                    <TableRow key={`${contact.name}-${contact.email ?? ""}`}>
                      <TableCell className="text-sm font-medium text-foreground">
                        {contact.name} {contact.primary ? <Badge className="ml-2">Primary</Badge> : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contact.role ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contact.email ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contact.phone ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(contract.contacts ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                        No stakeholder contacts captured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QBR Cadence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Last review</p>
                  <p>{formatDate(contract.lastQbr)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Next review</p>
                  <p>{formatDate(contract.nextQbr)}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">Add QBR Notes</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContractDetail;
