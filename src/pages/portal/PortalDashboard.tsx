import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, LifeBuoy, Shield, Clock } from "lucide-react";
import { fetchPortalSummary, type PortalSummary } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/formatters";

const statusColor = (s: string) => {
  if (s === "Open") return "bg-foreground text-background";
  if (s === "In Progress") return "bg-muted-foreground text-background";
  return "bg-muted text-muted-foreground";
};

const PortalDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PortalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    fetchPortalSummary(user.email)
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
  }, [user?.email]);

  const stats = useMemo(() => {
    const subscription = data?.subscription;
    const openTickets = (data?.tickets ?? []).filter((t) => t.status !== "Resolved").length;
    return [
      { label: "Active Plan", value: subscription?.plan ?? "—", icon: CreditCard },
      { label: "Open Tickets", value: `${openTickets}`, icon: LifeBuoy },
      { label: "Devices Monitored", value: `${subscription?.seats ?? 0}`, icon: Shield },
      { label: "Next Billing", value: formatDate(subscription?.renewalDate), icon: Clock },
    ];
  }, [data]);

  const recentTickets = data?.tickets ?? [];

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Welcome back{data?.profile?.name ? `, ${data.profile.name}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">Here's an overview of your account.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <Card>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-2.5 bg-secondary rounded">
                  <s.icon size={20} className="text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading tickets…</div>
            ) : recentTickets.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tickets yet.</div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.id} · {formatDate(t.createdAt)}</p>
                    </div>
                    <Badge className={statusColor(t.status ?? "Open")}>{t.status}</Badge>
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

export default PortalDashboard;
