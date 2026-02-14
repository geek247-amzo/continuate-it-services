import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fetchPortalSummary, updateProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PortalAccount = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    fetchPortalSummary(user.email)
      .then((summary) => {
        if (!active) return;
        const profile = summary.profile;
        setProfileId(profile?.id ?? null);
        setForm({
          name: profile?.name ?? "",
          email: profile?.email ?? user.email ?? "",
          company: profile?.company ?? "",
          phone: profile?.phone ?? "",
        });
      })
      .catch(() => {
        if (!active) return;
        setProfileId(null);
        setForm((prev) => ({ ...prev, email: user.email ?? "" }));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.email]);

  const handleSave = async () => {
    if (!profileId) return;
    try {
      await updateProfile(profileId, {
        name: form.name,
        company: form.company,
        phone: form.phone,
      });
      toast({ title: "Profile updated", description: "Your account details were saved." });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Account Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading profile…</div>
            ) : (
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email} type="email" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="button" onClick={handleSave} disabled={!profileId}>Save Changes</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button variant="outline" type="button" disabled>Update Password</Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <Badge variant="outline">Email</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">No notification preferences configured yet.</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PortalAccount;
