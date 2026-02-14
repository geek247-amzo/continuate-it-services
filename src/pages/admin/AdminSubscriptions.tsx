import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchSubscriptions, type Subscription } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSubscriptions()
      .then((data) => {
        if (!active) return;
        setSubscriptions(data);
      })
      .catch(() => {
        if (!active) return;
        setSubscriptions([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const grouped = subscriptions.reduce((acc, sub) => {
      const key = sub.plan ?? "Unassigned";
      if (!acc[key]) acc[key] = { label: key, count: 0, mrr: 0 };
      acc[key].count += 1;
      acc[key].mrr += Number(sub.mrr || 0);
      return acc;
    }, {} as Record<string, { label: string; count: number; mrr: number }>);
    return Object.values(grouped);
  }, [subscriptions]);

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Subscription Management</h2>
        <p className="text-sm text-muted-foreground">Overview of all client subscriptions and revenue.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">No subscription data yet.</CardContent>
          </Card>
        ) : summary.map((s, i) => (
          <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{s.count} clients</p>
                <p className="text-sm text-muted-foreground mt-1">MRR: {formatCurrency(s.mrr)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Add-Ons</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Renewal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                      Loading subscriptions…
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                      No subscriptions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{s.customer}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{s.customer}</TableCell>
                      <TableCell><Badge variant="outline">{s.plan ?? "—"}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{(s.addOns ?? []).length}</TableCell>
                      <TableCell className="font-medium text-foreground">{formatCurrency(s.mrr ?? 0, s.billingCurrency ?? "USD")}</TableCell>
                      <TableCell>
                        <Badge className={s.status === "Active" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}>
                          {s.status ?? "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{formatDate(s.renewalDate)}</TableCell>
                      <TableCell><Button variant="ghost" size="sm">Manage</Button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSubscriptions;
