import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchReportSummary, type ReportSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

const renderValue = (kpi: ReportSummary["kpis"][number]) => {
  if (kpi.format === "currency") return formatCurrency(kpi.value);
  if (kpi.format === "percent") return `${kpi.value}%`;
  return `${kpi.value}`;
};

const AdminReports = () => {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchReportSummary()
      .then((payload) => {
        if (!active) return;
        setData(payload);
      })
      .catch(() => {
        if (!active) return;
        setData(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const kpis = data?.kpis ?? [];
  const topIssues = data?.topIssues ?? [];

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Reports & Analytics</h2>
        <p className="text-sm text-muted-foreground">Key performance metrics for the current period.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">Loading KPIs…</CardContent>
          </Card>
        ) : kpis.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">No KPI data yet.</CardContent>
          </Card>
        ) : (
          kpis.map((k, i) => (
            <motion.div key={k.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{k.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-2xl font-bold text-foreground">{renderValue(k)}</p>
                    {k.change ? <Badge variant="outline" className="text-xs">{k.change}</Badge> : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Issue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading issues…</div>
            ) : topIssues.length === 0 ? (
              <div className="text-sm text-muted-foreground">No ticket categories yet.</div>
            ) : (
              <div className="space-y-3">
                {topIssues.map((issue) => (
                  <div key={issue.category} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground w-28">{issue.category}</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: issue.pct }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{issue.count} tickets</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminReports;
