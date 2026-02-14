import "dotenv/config";
import express from "express";
import cors from "cors";
import { query, withTransaction } from "./db.js";
import Mailjet from "node-mailjet";
import { createQuotePdf } from "./pdf.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const computeTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  return { subtotal, total: subtotal };
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const generatePublicId = (prefix) => {
  const year = new Date().getFullYear();
  const token = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${token}`;
};

const mapQuoteItem = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  unit: item.unit,
  quantity: Number(item.quantity),
  unitPrice: Number(item.unit_price),
  slaTier: item.sla_tier,
  kpiTags: item.kpi_tags ?? [],
});

const normalizeQuote = (row, items) => ({
  id: row.public_id,
  dbId: row.id,
  name: row.name,
  customer: row.customer,
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  region: row.region,
  owner: row.owner,
  status: row.status,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
  sentAt: row.sent_at,
  viewedAt: row.viewed_at,
  acceptedAt: row.accepted_at,
  assumptions: row.assumptions ?? [],
  terms: row.terms ?? [],
  subtotal: Number(row.subtotal || 0),
  total: Number(row.total || 0),
  items,
});

const normalizeContract = (row) => ({
  id: row.public_id,
  dbId: row.id,
  quoteId: row.quote_public_id,
  customer: row.customer,
  status: row.status,
  owner: row.owner,
  startDate: row.start_date,
  renewalDate: row.renewal_date,
  noticeDate: row.notice_date,
  slaTier: row.sla_tier,
  serviceLevels: row.service_levels ?? [],
  kpis: row.kpis ?? [],
  supportModel: row.support_model,
  escalation: row.escalation ?? [],
  billingCycle: row.billing_cycle,
  billingCurrency: row.billing_currency,
  mrr: Number(row.mrr || 0),
  arr: Number(row.arr || 0),
  paymentTerms: row.payment_terms,
  invoicingDay: row.invoicing_day,
  healthScore: row.health_score,
  riskLevel: row.risk_level,
  lastQbr: row.last_qbr,
  nextQbr: row.next_qbr,
  autoRenew: row.auto_renew,
  contacts: row.contacts ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeProfile = (row) => ({
  id: row.id,
  authUserId: row.auth_user_id,
  email: row.email,
  name: row.name,
  role: row.role,
  company: row.company,
  phone: row.phone,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeTicket = (row) => ({
  id: row.public_id,
  dbId: row.id,
  customer: row.customer,
  requesterName: row.requester_name,
  requesterEmail: row.requester_email,
  subject: row.subject,
  category: row.category,
  priority: row.priority,
  status: row.status,
  assignedTo: row.assigned_to,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  slaDueAt: row.sla_due_at,
  notes: row.notes ?? [],
  tags: row.tags ?? [],
});

const normalizeSubscription = (row) => ({
  id: row.public_id,
  dbId: row.id,
  customer: row.customer,
  plan: row.plan,
  status: row.status,
  startDate: row.start_date,
  renewalDate: row.renewal_date,
  billingCycle: row.billing_cycle,
  billingCurrency: row.billing_currency,
  mrr: Number(row.mrr || 0),
  seats: row.seats,
  addOns: row.add_ons ?? [],
  owner: row.owner,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeInvoice = (row) => ({
  id: row.invoice_number,
  dbId: row.id,
  subscriptionId: row.subscription_public_id,
  status: row.status,
  amount: Number(row.amount || 0),
  currency: row.currency,
  dueDate: row.due_date,
  paidAt: row.paid_at,
  createdAt: row.created_at,
});

const normalizeReport = (row) => ({
  id: row.id,
  title: row.title,
  periodStart: row.period_start,
  periodEnd: row.period_end,
  summary: row.summary,
  kpis: row.kpis ?? [],
  issues: row.issues ?? [],
  createdAt: row.created_at,
});

const normalizeActivity = (row) => ({
  id: row.id,
  action: row.action,
  detail: row.detail,
  actor: row.actor,
  createdAt: row.created_at,
});

const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:8080";

const loadQuoteWithItems = async (publicId) => {
  const quoteResult = await query("select * from quotes where public_id = $1", [publicId]);
  if (!quoteResult.rows.length) {
    return null;
  }
  const quote = quoteResult.rows[0];
  const itemsResult = await query("select * from quote_items where quote_id = $1", [quote.id]);
  const items = itemsResult.rows.map(mapQuoteItem);
  return { quote, items };
};

const getMailjetClient = () => {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("MAILJET_API_KEY and MAILJET_API_SECRET are required to send emails.");
  }
  return Mailjet.apiConnect(apiKey, apiSecret);
};

const sendQuoteEmail = async ({ quote, items, toEmail, toName, subject }) => {
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const fromName = process.env.MAILJET_FROM_NAME || "Continuate";
  if (!fromEmail) {
    throw new Error("MAILJET_FROM_EMAIL is required to send emails.");
  }

  const pdfBuffer = await createQuotePdf({ quote, items, baseUrl: appBaseUrl });
  const mailjet = getMailjetClient();
  const link = `${appBaseUrl.replace(/\/$/, "")}/quote/${quote.id}`;

  await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: { Email: fromEmail, Name: fromName },
        To: [{ Email: toEmail, Name: toName }],
        Subject: subject || `Your Continuate Proposal — ${quote.name}`,
        TextPart: `Hi ${toName || quote.customer},\n\nYour proposal is ready: ${link}\n\nBest,\nContinuate`,
        HTMLPart: `
          <p>Hi ${toName || quote.customer},</p>
          <p>Your Continuate proposal is ready.</p>
          <p><a href="${link}">Open the live proposal</a></p>
          <p>The PDF is attached for your records.</p>
          <p>Best,<br/>Continuate</p>
        `,
        Attachments: [
          {
            ContentType: "application/pdf",
            Filename: `Continuate-Quote-${quote.id}.pdf`,
            Base64Content: pdfBuffer.toString("base64"),
          },
        ],
      },
    ],
  });
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/quotes", async (_req, res) => {
  try {
    const quotesResult = await query("select * from quotes order by created_at desc");
    const quoteIds = quotesResult.rows.map((row) => row.id);
    let itemsByQuote = {};

    if (quoteIds.length) {
      const itemsResult = await query("select * from quote_items where quote_id = any($1)", [quoteIds]);
      itemsByQuote = itemsResult.rows.reduce((acc, item) => {
        const list = acc[item.quote_id] ?? [];
        list.push(mapQuoteItem(item));
        acc[item.quote_id] = list;
        return acc;
      }, {});
    }

    const payload = quotesResult.rows.map((row) => normalizeQuote(row, itemsByQuote[row.id] ?? []));
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load quotes" });
  }
});

app.get("/api/quotes/:id", async (req, res) => {
  try {
    const result = await loadQuoteWithItems(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.json(normalizeQuote(result.quote, result.items));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load quote" });
  }
});

app.post("/api/quotes", async (req, res) => {
  try {
    const {
      publicId,
      name,
      customer,
      contactName,
      contactEmail,
      region,
      owner,
      status = "Draft",
      expiresAt,
      assumptions = [],
      terms = [],
      items = [],
    } = req.body;

    if (!name || !customer) {
      return res.status(400).json({ error: "name and customer are required" });
    }

    const totals = computeTotals(items);

    const created = await withTransaction(async (client) => {
      const quoteResult = await client.query(
        `
        insert into quotes
          (public_id, name, customer, contact_name, contact_email, region, owner, status, expires_at, assumptions, terms, subtotal, total)
        values
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        returning *
        `,
        [
          publicId ?? generatePublicId("Q"),
          name,
          customer,
          contactName ?? null,
          contactEmail ?? null,
          region ?? null,
          owner ?? null,
          status,
          expiresAt ?? null,
          JSON.stringify(safeArray(assumptions)),
          JSON.stringify(safeArray(terms)),
          totals.subtotal,
          totals.total,
        ],
      );

      const quote = quoteResult.rows[0];

      if (items.length) {
        const itemValues = items.flatMap((item) => [
          quote.id,
          item.name,
          item.category,
          item.description,
          item.unit,
          item.quantity,
          item.unitPrice,
          item.slaTier,
          JSON.stringify(safeArray(item.kpiTags)),
        ]);

        const placeholders = items.map((_, index) => {
          const offset = index * 9;
          return `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8},$${offset + 9})`;
        });

        await client.query(
          `
          insert into quote_items
            (quote_id, name, category, description, unit, quantity, unit_price, sla_tier, kpi_tags)
          values ${placeholders.join(",")}
          `,
          itemValues,
        );
      }

      return quote;
    });

    res.status(201).json({ id: created.public_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create quote" });
  }
});

app.post("/api/quotes/:id/send", async (req, res) => {
  try {
    const result = await loadQuoteWithItems(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const quote = normalizeQuote(result.quote, result.items);
    const toEmail = req.body?.toEmail ?? quote.contactEmail;
    const toName = req.body?.toName ?? quote.contactName ?? quote.customer;

    if (!toEmail) {
      return res.status(400).json({ error: "Contact email is required to send the quote." });
    }

    await sendQuoteEmail({
      quote,
      items: result.items,
      toEmail,
      toName,
      subject: req.body?.subject,
    });

    await query("update quotes set status = 'Sent', sent_at = now() where public_id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send quote" });
  }
});

app.get("/api/quotes/:id/pdf", async (req, res) => {
  try {
    const result = await loadQuoteWithItems(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const quote = normalizeQuote(result.quote, result.items);
    const pdfBuffer = await createQuotePdf({ quote, items: result.items, baseUrl: appBaseUrl });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Continuate-Quote-${quote.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.post("/api/quotes/:id/viewed", async (req, res) => {
  try {
    const result = await query(
      "update quotes set status = 'Viewed', viewed_at = now() where public_id = $1 returning id",
      [req.params.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to mark quote viewed" });
  }
});

app.post("/api/quotes/:id/accept", async (req, res) => {
  try {
    const quoteResult = await query("select * from quotes where public_id = $1", [req.params.id]);
    if (!quoteResult.rows.length) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const quote = quoteResult.rows[0];

    const {
      startDate,
      renewalDate,
      slaTier,
      serviceLevels = [],
      kpis = [],
      supportModel,
      escalation = [],
      status = "Pending",
      owner,
      billingCycle,
      billingCurrency,
      mrr,
      arr,
      paymentTerms,
      invoicingDay,
      healthScore,
      riskLevel,
      lastQbr,
      nextQbr,
      autoRenew,
      contacts = [],
    } = req.body ?? {};

    const contractResult = await withTransaction(async (client) => {
      const contract = await client.query(
        `
        insert into contracts
          (
            public_id,
            quote_id,
            customer,
            status,
            owner,
            start_date,
            renewal_date,
            sla_tier,
            service_levels,
            kpis,
            support_model,
            escalation,
            billing_cycle,
            billing_currency,
            mrr,
            arr,
            payment_terms,
            invoicing_day,
            health_score,
            risk_level,
            last_qbr,
            next_qbr,
            auto_renew,
            contacts
          )
        values
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
        on conflict (quote_id)
        do update set
          status = excluded.status,
          owner = excluded.owner,
          start_date = excluded.start_date,
          renewal_date = excluded.renewal_date,
          sla_tier = excluded.sla_tier,
          service_levels = excluded.service_levels,
          kpis = excluded.kpis,
          support_model = excluded.support_model,
          escalation = excluded.escalation,
          billing_cycle = excluded.billing_cycle,
          billing_currency = excluded.billing_currency,
          mrr = excluded.mrr,
          arr = excluded.arr,
          payment_terms = excluded.payment_terms,
          invoicing_day = excluded.invoicing_day,
          health_score = excluded.health_score,
          risk_level = excluded.risk_level,
          last_qbr = excluded.last_qbr,
          next_qbr = excluded.next_qbr,
          auto_renew = excluded.auto_renew,
          contacts = excluded.contacts
        returning *
        `,
        [
          generatePublicId("CTR"),
          quote.id,
          quote.customer,
          status,
          owner ?? quote.owner ?? null,
          startDate ?? null,
          renewalDate ?? null,
          slaTier ?? null,
          JSON.stringify(safeArray(serviceLevels)),
          JSON.stringify(safeArray(kpis)),
          supportModel ?? null,
          JSON.stringify(safeArray(escalation)),
          billingCycle ?? null,
          billingCurrency ?? null,
          Number(mrr || 0),
          Number(arr || 0),
          paymentTerms ?? null,
          invoicingDay ?? null,
          healthScore ?? null,
          riskLevel ?? null,
          lastQbr ?? null,
          nextQbr ?? null,
          autoRenew ?? true,
          JSON.stringify(safeArray(contacts)),
        ],
      );

      await client.query(
        "update quotes set status = 'Accepted', accepted_at = now() where id = $1",
        [quote.id],
      );

      return contract.rows[0];
    });

    res.json({ id: contractResult.public_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to accept quote" });
  }
});

app.get("/api/contracts", async (_req, res) => {
  try {
    const result = await query(
      `
      select
        contracts.*,
        quotes.public_id as quote_public_id
      from contracts
      join quotes on quotes.id = contracts.quote_id
      order by contracts.created_at desc
      `,
    );

    res.json(result.rows.map(normalizeContract));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load contracts" });
  }
});

app.get("/api/contracts/:id", async (req, res) => {
  try {
    const result = await query(
      `
      select
        contracts.*,
        quotes.public_id as quote_public_id
      from contracts
      join quotes on quotes.id = contracts.quote_id
      where contracts.public_id = $1
      `,
      [req.params.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json(normalizeContract(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load contract" });
  }
});

app.patch("/api/contracts/:id", async (req, res) => {
  try {
    const allowed = {
      status: req.body.status,
      owner: req.body.owner,
      start_date: req.body.startDate,
      renewal_date: req.body.renewalDate,
      notice_date: req.body.noticeDate,
      sla_tier: req.body.slaTier,
      service_levels: req.body.serviceLevels ? JSON.stringify(safeArray(req.body.serviceLevels)) : undefined,
      kpis: req.body.kpis ? JSON.stringify(safeArray(req.body.kpis)) : undefined,
      support_model: req.body.supportModel,
      escalation: req.body.escalation ? JSON.stringify(safeArray(req.body.escalation)) : undefined,
      billing_cycle: req.body.billingCycle,
      billing_currency: req.body.billingCurrency,
      mrr: req.body.mrr,
      arr: req.body.arr,
      payment_terms: req.body.paymentTerms,
      invoicing_day: req.body.invoicingDay,
      health_score: req.body.healthScore,
      risk_level: req.body.riskLevel,
      last_qbr: req.body.lastQbr,
      next_qbr: req.body.nextQbr,
      auto_renew: req.body.autoRenew,
      contacts: req.body.contacts ? JSON.stringify(safeArray(req.body.contacts)) : undefined,
    };

    const entries = Object.entries(allowed).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      return res.status(400).json({ error: "No contract fields provided" });
    }

    const setClause = entries.map(([key], index) => `${key} = $${index + 2}`);
    const values = entries.map(([, value]) => value);
    const result = await query(
      `
      update contracts
      set ${setClause.join(", ")}
      where public_id = $1
      returning *
      `,
      [req.params.id, ...values],
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const contract = await query(
      `
      select contracts.*, quotes.public_id as quote_public_id
      from contracts
      join quotes on quotes.id = contracts.quote_id
      where contracts.id = $1
      `,
      [result.rows[0].id],
    );

    res.json(normalizeContract(contract.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update contract" });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const filters = [];
    const values = [];
    if (_req.query.email) {
      values.push(_req.query.email);
      filters.push(`email = $${values.length}`);
    }
    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";
    const result = await query(`select * from profiles ${whereClause} order by created_at desc`, values);
    res.json(result.rows.map(normalizeProfile));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load users" });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    const allowed = {
      name: req.body.name,
      company: req.body.company,
      phone: req.body.phone,
      status: req.body.status,
    };

    const entries = Object.entries(allowed).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      return res.status(400).json({ error: "No profile fields provided" });
    }

    const setClause = entries.map(([key], index) => `${key} = $${index + 2}`);
    const values = entries.map(([, value]) => value);
    const result = await query(
      `
      update profiles
      set ${setClause.join(", ")}
      where id = $1
      returning *
      `,
      [req.params.id, ...values],
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(normalizeProfile(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.get("/api/tickets", async (req, res) => {
  try {
    const filters = [];
    const values = [];

    if (req.query.status) {
      values.push(req.query.status);
      filters.push(`status = $${values.length}`);
    }
    if (req.query.requesterEmail) {
      values.push(req.query.requesterEmail);
      filters.push(`requester_email = $${values.length}`);
    }
    if (req.query.customer) {
      values.push(req.query.customer);
      filters.push(`customer = $${values.length}`);
    }

    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";
    const result = await query(
      `select * from tickets ${whereClause} order by created_at desc`,
      values,
    );
    res.json(result.rows.map(normalizeTicket));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load tickets" });
  }
});

app.post("/api/tickets", async (req, res) => {
  try {
    const {
      customer,
      requesterName,
      requesterEmail,
      subject,
      category,
      priority = "Medium",
      description,
    } = req.body ?? {};

    if (!customer || !subject) {
      return res.status(400).json({ error: "customer and subject are required" });
    }

    const notes = description
      ? [{ body: description, createdAt: new Date().toISOString(), author: requesterName ?? requesterEmail ?? "Customer" }]
      : [];

    const result = await query(
      `
      insert into tickets
        (public_id, customer, requester_name, requester_email, subject, category, priority, notes)
      values
        ($1,$2,$3,$4,$5,$6,$7,$8)
      returning *
      `,
      [
        generatePublicId("TKT"),
        customer,
        requesterName ?? null,
        requesterEmail ?? null,
        subject,
        category ?? null,
        priority,
        JSON.stringify(notes),
      ],
    );

    res.status(201).json(normalizeTicket(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

app.get("/api/subscriptions", async (req, res) => {
  try {
    const filters = [];
    const values = [];
    if (req.query.customer) {
      values.push(req.query.customer);
      filters.push(`customer = $${values.length}`);
    }
    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";
    const result = await query(
      `select * from subscriptions ${whereClause} order by created_at desc`,
      values,
    );
    res.json(result.rows.map(normalizeSubscription));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load subscriptions" });
  }
});

app.get("/api/subscriptions/:id", async (req, res) => {
  try {
    const result = await query("select * from subscriptions where public_id = $1", [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.json(normalizeSubscription(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load subscription" });
  }
});

app.get("/api/invoices", async (req, res) => {
  try {
    const filters = [];
    const values = [];
    let join = "";

    if (req.query.subscriptionId) {
      values.push(req.query.subscriptionId);
      join = "join subscriptions on subscriptions.id = invoices.subscription_id";
      filters.push(`subscriptions.public_id = $${values.length}`);
    }
    if (req.query.customer) {
      values.push(req.query.customer);
      join = "join subscriptions on subscriptions.id = invoices.subscription_id";
      filters.push(`subscriptions.customer = $${values.length}`);
    }

    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";
    const result = await query(
      `
      select invoices.*, subscriptions.public_id as subscription_public_id
      from invoices
      ${join}
      ${whereClause}
      order by invoices.created_at desc
      `,
      values,
    );
    res.json(result.rows.map(normalizeInvoice));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load invoices" });
  }
});

app.get("/api/reports", async (_req, res) => {
  try {
    const result = await query("select * from reports order by created_at desc");
    res.json(result.rows.map(normalizeReport));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

app.get("/api/reports/summary", async (_req, res) => {
  try {
    const [{ rows: subscriptionRows }, { rows: ticketRows }, { rows: profileRows }] = await Promise.all([
      query("select status, mrr from subscriptions"),
      query("select status, category from tickets"),
      query("select created_at from profiles"),
    ]);

    const totalMrr = subscriptionRows.reduce((sum, row) => sum + Number(row.mrr || 0), 0);
    const totalSubs = subscriptionRows.length || 1;
    const canceled = subscriptionRows.filter((row) => row.status === "Cancelled").length;
    const ticketsTotal = ticketRows.length || 1;
    const resolved = ticketRows.filter((row) => row.status === "Resolved").length;
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const newClients = profileRows.filter((row) => new Date(row.created_at) >= last30).length;

    const categoryCounts = ticketRows.reduce((acc, row) => {
      const key = row.category ?? "General";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const topIssues = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        pct: `${Math.round((count / ticketsTotal) * 100)}%`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const kpis = [
      { label: "Monthly Revenue", value: totalMrr, change: null, format: "currency" },
      { label: "Resolution Rate", value: Math.round((resolved / ticketsTotal) * 100), change: null, format: "percent" },
      { label: "New Clients (Month)", value: newClients, change: null, format: "number" },
      { label: "Churn Rate", value: Math.round((canceled / totalSubs) * 100), change: null, format: "percent" },
    ];

    res.json({ kpis, topIssues });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load report summary" });
  }
});

app.get("/api/dashboard/admin", async (_req, res) => {
  try {
    const [
      { rows: profileRows },
      { rows: ticketRows },
      { rows: subscriptionRows },
      { rows: activityRows },
    ] = await Promise.all([
      query("select id from profiles"),
      query("select status from tickets"),
      query("select status, mrr from subscriptions"),
      query("select * from activity_log order by created_at desc limit 8"),
    ]);

    const openTickets = ticketRows.filter((row) => row.status !== "Resolved").length;
    const activeSubs = subscriptionRows.filter((row) => row.status === "Active").length;
    const mrr = subscriptionRows.reduce((sum, row) => sum + Number(row.mrr || 0), 0);

    res.json({
      stats: {
        totalClients: profileRows.length,
        openTickets,
        activeSubs,
        mrr,
        uptime: 99.97,
      },
      activity: activityRows.map(normalizeActivity),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load admin dashboard" });
  }
});

app.get("/api/portal/summary", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const profileResult = await query("select * from profiles where email = $1", [email]);
    if (!profileResult.rows.length) {
      return res.json({ profile: null, subscription: null, tickets: [] });
    }

    const profile = profileResult.rows[0];
    const subscriptionResult = await query(
      "select * from subscriptions where customer = $1 order by created_at desc limit 1",
      [profile.company ?? profile.name ?? profile.email],
    );

    const ticketsResult = await query(
      "select * from tickets where requester_email = $1 order by created_at desc limit 5",
      [profile.email],
    );

    const subscription = subscriptionResult.rows[0] ? normalizeSubscription(subscriptionResult.rows[0]) : null;
    res.json({
      profile: normalizeProfile(profile),
      subscription,
      tickets: ticketsResult.rows.map(normalizeTicket),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load portal summary" });
  }
});

app.get("/api/portal/subscription", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const profileResult = await query("select * from profiles where email = $1", [email]);
    if (!profileResult.rows.length) {
      return res.json({ profile: null, subscription: null, invoices: [] });
    }

    const profile = profileResult.rows[0];
    const customer = profile.company ?? profile.name ?? profile.email;

    const subscriptionResult = await query(
      "select * from subscriptions where customer = $1 order by created_at desc limit 1",
      [customer],
    );

    if (!subscriptionResult.rows.length) {
      return res.json({ profile: normalizeProfile(profile), subscription: null, invoices: [] });
    }

    const subscription = subscriptionResult.rows[0];
    const invoices = await query(
      `
      select invoices.*, subscriptions.public_id as subscription_public_id
      from invoices
      join subscriptions on subscriptions.id = invoices.subscription_id
      where subscriptions.id = $1
      order by invoices.created_at desc
      `,
      [subscription.id],
    );

    res.json({
      profile: normalizeProfile(profile),
      subscription: normalizeSubscription(subscription),
      invoices: invoices.rows.map(normalizeInvoice),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load portal subscription" });
  }
});

const port = Number(process.env.PORT || 8081);
app.listen(port, () => {
  console.log(`API server listening on ${port}`);
});
