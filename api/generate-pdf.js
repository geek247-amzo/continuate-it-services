import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

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

const buildHtml = ({ quote, items }) => {
  const currency = quote.currency ?? "ZAR";
  const assumptions = normalizeList(quote.assumptions);
  const terms = normalizeList(quote.terms);
  const itemRows = (items ?? [])
    .map((item) => {
      const total = Number(item.unit_price ?? 0) * Number(item.quantity ?? 0);
      return `
        <tr>
          <td>${item.name ?? "Service"}</td>
          <td>${item.category ?? "General"}</td>
          <td class="right">${item.quantity ?? 0}</td>
          <td class="right">${formatCurrency(item.unit_price ?? 0, currency)}</td>
          <td class="right">${formatCurrency(total, currency)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Continuate Quote</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: "Helvetica", Arial, sans-serif; margin: 32px; color: #111; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .brand { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
          .meta { text-align: right; font-size: 12px; color: #555; }
          h1 { font-size: 24px; margin: 0 0 8px; }
          .section { margin-top: 24px; }
          .section h2 { font-size: 14px; text-transform: uppercase; color: #666; margin: 0 0 8px; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          th { text-align: left; background: #fafafa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
          .right { text-align: right; }
          .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
          .totals div { width: 240px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .totals-row strong { font-size: 14px; }
          .pill { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 11px; background: #111; color: #fff; }
          ul { padding-left: 18px; margin: 8px 0 0; }
          .footer { margin-top: 32px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">CONTINUATE</div>
            <h1>Service Proposal</h1>
            <div class="pill">${quote.status ?? "Draft"}</div>
          </div>
          <div class="meta">
            <div>Quote ID: ${quote.public_id}</div>
            <div>Prepared for: ${quote.customer ?? "—"}</div>
            <div>Contact: ${quote.contact_name ?? "—"} (${quote.contact_email ?? "—"})</div>
            <div>Owner: ${quote.owner ?? "—"}</div>
            <div>Expires: ${quote.expires_at ?? "—"}</div>
          </div>
        </div>

        <div class="section">
          <h2>Scope of Services</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th class="right">Qty</th>
                <th class="right">Unit</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows || `<tr><td colspan="5">No line items added.</td></tr>`}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div>
            <div class="totals-row">
              <span>Subtotal</span>
              <span>${formatCurrency(quote.subtotal ?? 0, currency)}</span>
            </div>
            <div class="totals-row">
              <strong>Total</strong>
              <strong>${formatCurrency(quote.total ?? 0, currency)}</strong>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Assumptions</h2>
          ${assumptions.length ? `<ul>${assumptions.map((a) => `<li>${a}</li>`).join("")}</ul>` : "<p>No assumptions listed.</p>"}
        </div>

        <div class="section">
          <h2>Terms</h2>
          ${terms.length ? `<ul>${terms.map((t) => `<li>${t}</li>`).join("")}</ul>` : "<p>No terms listed.</p>"}
        </div>

        <div class="footer">
          Continuate IT Services • ${new Date().toLocaleDateString("en-ZA")}
        </div>
      </body>
    </html>
  `;
};

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

  let browser = null;

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

    const html = buildHtml({ quote, items });

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Continuate-Quote-${quote.public_id}.pdf"`
    );
    return res.status(200).send(pdf);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    return res.status(500).json({ error: message });
  }
}
