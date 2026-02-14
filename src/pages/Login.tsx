import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const fallback = isAdmin ? "/admin" : "/portal";
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? fallback, { replace: true });
    }
  }, [session, isAdmin, location.state, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
  };

  const handleOAuth = async (provider: "google" | "azure") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      setLoading(false);
      toast({
        title: "SSO failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="w-full max-w-md mx-auto p-8 border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <picture>
            <source srcSet="/logo-light.png" media="(prefers-color-scheme: dark)" />
            <img src="/logo-dark.png" alt="Continuate" className="h-10 w-auto" />
          </picture>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Sign In</h1>
        <p className="text-sm text-muted-foreground mb-8">Access your Continuate client portal</p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <Button type="button" variant="outline" onClick={() => handleOAuth("google")} disabled={loading}>
            Continue with Google
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOAuth("azure")} disabled={loading}>
            Continue with Microsoft
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
          <span className="flex-1 border-t border-border" />
          <span>or</span>
          <span className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.za" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>Sign In</Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need access? Contact Continuate support.
          </p>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to website
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
