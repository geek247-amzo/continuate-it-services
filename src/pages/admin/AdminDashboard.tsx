import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Ticket, CreditCard, TrendingUp } from "lucide-react";
import { createTestData, fetchAdminDashboard, type AdminDashboardSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const payload = await fetchAdminDashboard();
        if (!active) return;
        setData(payload);
      } catch {
        if (!active) return;
        setData(null);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const summary = data?.stats;
    return [
      { label: "Total Clients", value: summary ? `${summary.totalClients}` : "—", change: " ", icon: Users },
      { label: "Open Tickets", value: summary ? `${summary.openTickets}` : "—", change: " ", icon: Ticket },
      { label: "Active Subs", value: summary ? `${summary.activeSubs}` : "—", change: summary ? formatCurrency(summary.mrr) + " MRR" : " ", icon: CreditCard },
      { label: "Uptime", value: summary ? `${summary.uptime}%` : "—", change: "Last 30 days", icon: TrendingUp },
    ];
  }, [data]);

  const activity = data?.activity ?? [];

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">Admin Overview</h2>
          <p className="text-sm text-muted-foreground">System-wide metrics and recent activity.</p>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            disabled={seeding || !user?.email}
            onClick={async () => {
              if (!user?.email) return;
              try {
                setSeeding(true);
                await createTestData({
                  customer: user.email,
                  requesterEmail: user.email,
                  requesterName: user.email,
                  owner: user.email,
                });
                const payload = await fetchAdminDashboard();
                setData(payload);
                toast({ title: "Test data created", description: "Demo records added successfully." });
              } catch (error) {
                toast({
                  title: "Seed failed",
                  description: error instanceof Error ? error.message : "Unable to seed data.",
                  variant: "destructive",
                });
              } finally {
                setSeeding(false);
              }
            }}
          >
            {seeding ? "Seeding..." : "Create Test Data"}
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <s.icon size={18} className="text-muted-foreground" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading activity…</div>
            ) : activity.length === 0 ? (
              <div className="text-sm text-muted-foreground">No activity yet.</div>
            ) : (
              <div className="space-y-0">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start justify-between py-3 border-b border-border last:border-0 gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-xs">{a.action}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground truncate">{a.detail ?? "—"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{a.actor ?? "System"}</span>
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

export default AdminDashboard;
