import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fadeUp } from "@/lib/animations";
import { fetchQuotes, type Quote } from "@/lib/api";
import { formatCurrency, formatCompactNumber, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Send, ShieldCheck } from "lucide-react";

const statusColor = (status: string) => {
  if (status === "Accepted") return "bg-emerald-500/15 text-emerald-700";
  if (status === "Sent") return "bg-blue-500/15 text-blue-700";
  if (status === "Viewed") return "bg-amber-500/15 text-amber-700";
  if (status === "Expired") return "bg-muted text-muted-foreground";
  return "bg-secondary text-secondary-foreground";
};

const getTotal = (items: Quote["items"]) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchQuotes()
      .then((data) => {
        if (!mounted) return;
        setQuotes(data);
      })
      .catch(() => {
        if (!mounted) return;
        setQuotes([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Active Quotes",
        value: formatCompactNumber(quotes.filter((q) => q.status !== "Expired").length),
        icon: FileText,
      },
      {
        label: "Pending Approval",
        value: formatCompactNumber(quotes.filter((q) => q.status === "Viewed").length),
        icon: ShieldCheck,
      },
      {
        label: "Sent This Month",
        value: formatCompactNumber(quotes.filter((q) => q.status === "Sent").length),
        icon: Send,
      },
    ],
    [quotes],
  );

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">Quotes</h2>
            <p className="text-sm text-muted-foreground">
              Build IT SLA and MSSP proposals, send live links, and track acceptance.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/quotes/new">Create Quote</Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      Loading quotes…
                    </TableCell>
                  </TableRow>
                ) : quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      No quotes found yet.
                    </TableCell>
                  </TableRow>
                ) : quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="space-y-1">
                        <Link to={`/admin/quotes/${quote.id}`} className="hover:underline">
                          {quote.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{quote.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">{quote.customer}</div>
                      <div className="text-xs text-muted-foreground">{quote.contactName ?? quote.contactEmail ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(quote.status)}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{quote.owner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(quote.expiresAt)}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(getTotal(quote.items), quote.currency ?? "ZAR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminQuotes;
