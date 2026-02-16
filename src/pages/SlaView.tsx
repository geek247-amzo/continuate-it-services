import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchQuote, type Quote } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SlaView = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id) return;
      try {
        const data = await fetchQuote(id);
        if (!active) return;
        setQuote(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load SLA.");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Service Level Agreement</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Continuate IT Services • 377 Rivonia Boulevard, Sandton, 2196
          </p>
        </div>

        {error && <div className="text-sm text-destructive text-center">{error}</div>}

        {quote && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coverage Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This SLA applies to <strong>{quote.customer}</strong> and covers all managed devices where Continuate can
                establish remote connectivity.
              </p>
              <p>
                Pricing is exclusive of VAT. Additional services are quoted and approved before work begins to avoid
                surprise charges.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Time Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Response time is assessed by severity and business impact. High-impact incidents receive priority, while
              low-impact items are scheduled within normal maintenance windows.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Critical impact + high severity: immediate response and escalation.</li>
              <li>Moderate severity + high impact: expedited response.</li>
              <li>Low impact + low severity: handled in maintenance cycles.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Included Service Categories</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Infrastructure Management</li>
              <li>Remote Monitoring &amp; Management</li>
              <li>Maintenance</li>
              <li>End-user Support</li>
            </ul>
          </CardContent>
        </Card>

        {quote && (
          <div className="text-center text-sm">
            <Link
              to={`/quote/${quote.id}/accept`}
              className="inline-flex items-center justify-center rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
            >
              Accept Quote
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlaView;
