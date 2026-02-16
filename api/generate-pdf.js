import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";

export const config = {
  maxDuration: 60,
  memory: 1024,
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const formatCurrency = (value, currency) => {
  const number = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency ?? "ZAR",
      maximumFractionDigits: 0,
    }).format(number);
  } catch {
    return `${currency ?? "ZAR"} ${number.toFixed(0)}`;
  }
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split("\n").map((line) => line.trim()).filter(Boolean);
  return [];
};

const getBaseUrl = (req) => {
  const envBase = process.env.APP_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const host = req.headers.host;
  if (!host) return "";
  return `https://${host}`;
};

const buildPdf = ({ quote, items, acceptUrl, slaUrl }) =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const currency = quote.currency ?? "ZAR";
    const assumptions = normalizeList(quote.assumptions);
    const terms = normalizeList(quote.terms);

    doc.fontSize(10).fillColor("#111");
    doc.font("Helvetica-Bold").fontSize(16).text("CONTINUATE", { characterSpacing: 1 });
    doc.font("Helvetica").fontSize(12).text("377 Rivonia Boulevard, Sandton, 2196");
    doc.text("info@continuate.co.za • 073 209 9100");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(14).text("Service Proposal");
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor("#444");
    doc.text(`Quote ID: ${quote.public_id}`);
    doc.text(`Prepared for: ${quote.customer ?? "—"}`);
    doc.text(`Contact: ${quote.contact_name ?? "—"} (${quote.contact_email ?? "—"})`);
    doc.text(`Owner: ${quote.owner ?? "—"}`);
    doc.text(`Expires: ${quote.expires_at ?? "—"}`);

    doc.moveDown(1.2);
    doc.fillColor("#111").font("Helvetica-Bold").fontSize(11).text("Scope of Services");
    doc.moveDown(0.4);

    const tableTop = doc.y;
    const colX = [40, 220, 340, 400, 470];
    doc.fontSize(9).fillColor("#555");
    doc.text("Item", colX[0], tableTop);
    doc.text("Category", colX[1], tableTop);
    doc.text("Qty", colX[2], tableTop, { width: 50, align: "right" });
    doc.text("Unit", colX[3], tableTop, { width: 60, align: "right" });
    doc.text("Total", colX[4], tableTop, { width: 80, align: "right" });
    doc.moveDown(0.6);
    doc.strokeColor("#eee").moveTo(40, doc.y).lineTo(555, doc.y).stroke();

    doc.moveDown(0.5);
    doc.fillColor("#111").font("Helvetica").fontSize(9);
    if (!items?.length) {
      doc.text("No line items added.", 40, doc.y);
    } else {
      items.forEach((item) => {
        const total = Number(item.unit_price ?? 0) * Number(item.quantity ?? 0);
        doc.text(item.name ?? "Service", colX[0], doc.y, { width: 170 });
        doc.text(item.category ?? "General", colX[1], doc.y, { width: 110 });
        doc.text(String(item.quantity ?? 0), colX[2], doc.y, { width: 50, align: "right" });
        doc.text(formatCurrency(item.unit_price ?? 0, currency), colX[3], doc.y, { width: 60, align: "right" });
        doc.text(formatCurrency(total, currency), colX[4], doc.y, { width: 80, align: "right" });
        doc.moveDown(0.8);
      });
    }

    doc.moveDown(0.5);
    doc.strokeColor("#eee").moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.6);

    doc.font("Helvetica").fontSize(10);
    doc.text("Subtotal", 360, doc.y, { width: 120, align: "right" });
    doc.text(formatCurrency(quote.subtotal ?? 0, currency), 480, doc.y, { width: 80, align: "right" });
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Total", 360, doc.y, { width: 120, align: "right" });
    doc.text(formatCurrency(quote.total ?? 0, currency), 480, doc.y, { width: 80, align: "right" });

    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(11).text("Assumptions");
    doc.font("Helvetica").fontSize(9);
    if (assumptions.length) {
      assumptions.forEach((a) => doc.text(`• ${a}`, { indent: 10 }));
    } else {
      doc.text("No assumptions listed.");
    }

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(11).text("Terms");
    doc.font("Helvetica").fontSize(9);
    if (terms.length) {
      terms.forEach((t) => doc.text(`• ${t}`, { indent: 10 }));
    } else {
      doc.text("No terms listed.");
    }

    doc.moveDown(1.1);
    doc.font("Helvetica-Bold").fontSize(11).text("Coverage & Eligibility");
    doc.font("Helvetica").fontSize(9).text(
      "All devices are covered as long as Continuate can connect to the device or environment remotely."
    );

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(11).text("Pricing Notes");
    doc.font("Helvetica").fontSize(9);
    [
      "All prices are exclusive of VAT.",
      "No surprise charges: all inclusions and billable extras are defined upfront.",
      "Included service categories: Infrastructure Management, Remote Monitoring & Management, Maintenance, End-user Support.",
      "Additional services are quoted and approved before work begins.",
    ].forEach((line) => doc.text(`• ${line}`, { indent: 10 }));

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(11).text("Response Times");
    doc.font("Helvetica").fontSize(9).text(
      "Response time is based on both impact and severity. High-impact incidents are prioritized, while low-impact items are scheduled into normal maintenance windows."
    );

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(11).text("Next Steps");
    doc.font("Helvetica").fontSize(9);
    if (acceptUrl) {
      doc.fillColor("#111").text("Accept this quote online: ", { continued: true });
      doc.fillColor("#0a58ca").text(acceptUrl, { link: acceptUrl, underline: true });
    } else {
      doc.text("Accept this quote online at the link provided by your account manager.");
    }
    if (slaUrl) {
      doc.moveDown(0.4);
      doc.fillColor("#111").text("View SLA online: ", { continued: true });
      doc.fillColor("#0a58ca").text(slaUrl, { link: slaUrl, underline: true });
    }

    doc.moveDown(1.1);
    doc.font("Helvetica").fontSize(8).fillColor("#666");
    doc.text(`Continuate IT Services • ${new Date().toLocaleDateString("en-ZA")}`);

    doc.end();
  });

const getUserAndRole = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }
  return data.user;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.replace("Bearer ", "");
    await getUserAndRole(token);

    const { quoteId } = req.body ?? {};
    if (!quoteId) {
      return res.status(400).json({ error: "quoteId is required" });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("public_id", quoteId)
      .single();
    if (quoteError || !quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);
    if (itemsError) {
      throw itemsError;
    }

    const appBaseUrl = getBaseUrl(req);
    const acceptUrl = appBaseUrl ? `${appBaseUrl}/quote/${quote.public_id}/accept` : "";
    const slaUrl = quote.sla_url ?? (appBaseUrl ? `${appBaseUrl}/sla/${quote.public_id}` : "");
    const pdf = await buildPdf({ quote, items, acceptUrl, slaUrl });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Continuate-Quote-${quote.public_id}.pdf"`
    );
    return res.status(200).send(pdf);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    return res.status(500).json({ error: message });
  }
}
