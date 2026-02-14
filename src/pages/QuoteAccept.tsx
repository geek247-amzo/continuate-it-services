import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { acceptQuote, fetchContract, fetchQuote, type Contract, type Quote } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, UserPlus, FileText } from "lucide-react";

const QuoteAccept = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchQuote(id)
      .then((data) => {
        if (!mounted) return;
        setQuote(data);
        setAccepted(data.status === "Accepted");
      })
      .catch(() => {
        if (!mounted) return;
        setQuote(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const total = useMemo(
    () => (quote?.items ?? []).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [quote],
  );

  const handleAccept = async () => {
    try {
      if (!quote) return;
      const response = await acceptQuote(quote.id, {
        status: "Pending",
      });
      setAccepted(true);
        if (response?.id) {
          const contractResponse = await fetchContract(response.id);
          setContract(contractResponse);
        }
      toast({
        title: "Proposal accepted",
        description: "Contract has been generated and stored.",
      });
    } catch (error) {
      toast({
        title: "Acceptance failed",
        description: "Check the API server and database connection.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading proposal…</div>;
  }

  if (!quote) {
    return <div className="text-sm text-muted-foreground">Quote not found.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/Continuate_logo.png" alt="Continuate" className="h-8 w-auto" />
            <Badge variant="outline">{accepted ? "Proposal Accepted" : "Review & Accept"}</Badge>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/login"><UserPlus size={16} />Register account</Link>
          </Button>
        </div>
      </header>

      <main className="container py-10 space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-emerald-500/15 text-emerald-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {accepted ? "Acceptance Confirmed" : "Ready to Accept"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {accepted
                  ? `${quote?.customer ?? "Customer"} has accepted ${quote?.name ?? "the proposal"}.`
                  : `Confirm acceptance to convert ${quote?.name ?? "this proposal"} into a contract.`}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Created</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading contract details…</div>
                ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contract ID</p>
                    <p className="text-lg font-semibold text-foreground">{contract?.id ?? "Pending"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="text-lg font-semibold text-foreground">{formatDate(contract?.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Tier</p>
                    <p className="text-lg font-semibold text-foreground">{contract?.slaTier ?? "TBD"}</p>
                  </div>
                </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Service Levels</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {(contract?.serviceLevels ?? ["TBD"]).map((level) => (
                        <p key={level}>- {level}</p>
                      ))}
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">KPI Commitments</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {(contract?.kpis ?? [{ label: "TBD", target: "" }]).map((kpi) => (
                        <p key={kpi.label}>{kpi.label} {kpi.target ? `: ${kpi.target}` : ""}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAccept} disabled={accepted}>
                    {accepted ? "Contract Created" : "Confirm Acceptance"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/admin/contracts/${contract?.id ?? ""}`}>Open Contract Management</Link>
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText size={16} />Download Contract PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Estimated Monthly Total</span>
                  <span className="font-medium text-foreground">{formatCurrency(total, quote?.currency ?? "ZAR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Renewal Date</span>
                  <span className="font-medium text-foreground">{formatDate(contract?.renewalDate)}</span>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Create Portal Account</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default QuoteAccept;
