import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { downloadQuotePdf, fetchQuote, sendQuote, type Quote } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, Link as LinkIcon, Send, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColor = (status: string) => {
  if (status === "Accepted") return "bg-emerald-500/15 text-emerald-700";
  if (status === "Sent") return "bg-blue-500/15 text-blue-700";
  if (status === "Viewed") return "bg-amber-500/15 text-amber-700";
  if (status === "Expired") return "bg-muted text-muted-foreground";
  return "bg-secondary text-secondary-foreground";
};

const AdminQuoteDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchQuote(id)
      .then((data) => {
        if (!mounted) return;
        setQuote(data);
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

  const handleSend = async () => {
    if (!quote) return;
    try {
      await sendQuote(quote.id);
      toast({
        title: "Quote sent",
        description: "Quote status updated to Sent.",
      });
    } catch (error) {
      toast({
        title: "Failed to send",
        description: error instanceof Error ? error.message : "Mailjet send failed.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!quote) return;
    try {
      await downloadQuotePdf(quote.id);
    } catch (error) {
      toast({
        title: "PDF download failed",
        description: error instanceof Error ? error.message : "Unable to download PDF.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading quote…</div>;
  }

  if (!quote) {
    return <div className="text-sm text-muted-foreground">Quote not found.</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={statusColor(quote.status)}>{quote.status}</Badge>
              <span className="text-xs text-muted-foreground">{quote.id}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{quote.name}</h2>
            <p className="text-sm text-muted-foreground">
              {quote.customer} - {quote.contactName ?? quote.contactEmail ?? "—"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={handleSend}><Send size={16} />Send Reminder</Button>
            <Button asChild className="gap-2"><Link to={`/quote/${quote.id}`}><LinkIcon size={16} />Live View</Link></Button>
            <Button variant="outline" className="gap-2" onClick={handleDownload}><FileText size={16} />Download PDF</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.slaTier}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">Estimated Monthly Total</span>
                  <span className="font-display text-xl font-bold text-foreground">{formatCurrency(total, quote.currency ?? "ZAR")}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assumptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {(quote.assumptions ?? []).map((assumption) => (
                  <p key={assumption}>- {assumption}</p>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {(quote.terms ?? []).map((term) => (
                  <p key={term}>- {term}</p>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">Created</p>
                    <p>{formatDate(quote.createdAt)} - Owner {quote.owner ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">Expires</p>
                    <p>{formatDate(quote.expiresAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acceptance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Customer Action</p>
                    <p className="text-xs text-muted-foreground">
                      Accept proposal and convert to contract from the live view.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Live link: https://continuate.io/quote/{quote.id}</p>
                  <p>Contract: {quote.status === "Accepted" ? "Generated" : "Pending acceptance"}</p>
                </div>
                <Button variant="outline" className="w-full">Convert to Contract</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteDetail;
