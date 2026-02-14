export type QuoteStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Expired";

export interface QuoteLineItem {
  id: string;
  name: string;
  category: "IT SLA" | "MSSP" | "Cybersecurity";
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  slaTier: string;
  kpiTags: string[];
}

export interface QuoteSummary {
  id: string;
  name: string;
  customer: string;
  contact: string;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string;
  owner: string;
  region: string;
  items: QuoteLineItem[];
  assumptions: string[];
  terms: string[];
}

export interface ContractSummary {
  id: string;
  quoteId: string;
  customer: string;
  status: "Active" | "Pending" | "Renewal";
  startDate: string;
  renewalDate: string;
  slaTier: string;
  serviceLevels: string[];
  kpis: { label: string; target: string; measurement: string }[];
  supportModel: string;
  escalation: { level: string; response: string; owner: string }[];
}

export const serviceCatalog: QuoteLineItem[] = [
  {
    id: "managed-it",
    name: "Managed IT Support",
    category: "IT SLA",
    description: "24/7 monitoring, unlimited remote support, patching, and reporting.",
    unit: "per device",
    quantity: 25,
    unitPrice: 220,
    slaTier: "Standard response",
    kpiTags: ["Monthly reporting", "Proactive monitoring"],
  },
  {
    id: "cybersecurity-addon",
    name: "Cybersecurity Add-On",
    category: "Cybersecurity",
    description: "Threat detection, EDR, and firewall management.",
    unit: "per device",
    quantity: 25,
    unitPrice: 125,
    slaTier: "Enhanced protection",
    kpiTags: ["Threat detection", "EDR coverage"],
  },
  {
    id: "backup-addon",
    name: "Backup & Disaster Recovery",
    category: "Cybersecurity",
    description: "Encrypted backups, off-site replication, and DR testing.",
    unit: "per device",
    quantity: 25,
    unitPrice: 75,
    slaTier: "Recovery-ready",
    kpiTags: ["Encrypted backups", "Off-site replication"],
  },
];

export const quotes: QuoteSummary[] = [
  {
    id: "Q-2026-0211",
    name: "FinNova MSSP + IT SLA",
    customer: "FinNova Credit Union",
    contact: "Nadia Patel",
    status: "Sent",
    createdAt: "Feb 11, 2026",
    expiresAt: "Mar 12, 2026",
    owner: "Sophie Grant",
    region: "US-East",
    items: [
      serviceCatalog[0],
      serviceCatalog[2],
      serviceCatalog[3],
    ],
    assumptions: [
      "Customer provides endpoint inventory weekly.",
      "SOC tooling access granted within 10 business days.",
      "IR retainer is shared across two sites.",
    ],
    terms: [
      "12-month term with annual renewal option.",
      "Monthly billing in arrears via ACH.",
      "Service credits apply after SLA breach review.",
    ],
  },
  {
    id: "Q-2026-0207",
    name: "Horizon Health Cybersecurity Suite",
    customer: "Horizon Health",
    contact: "Luis Alvarez",
    status: "Viewed",
    createdAt: "Feb 7, 2026",
    expiresAt: "Mar 9, 2026",
    owner: "Marina Kovac",
    region: "US-Central",
    items: [
      serviceCatalog[4],
      serviceCatalog[5],
    ],
    assumptions: [
      "Endpoint telemetry fed into existing EDR.",
      "Quarterly compliance workshops included.",
    ],
    terms: [
      "6-month initial term with auto-renewal.",
      "Quarterly invoicing in advance.",
    ],
  },
  {
    id: "Q-2026-0203",
    name: "Atlas Logistics Support SLA",
    customer: "Atlas Logistics",
    contact: "Priya Singh",
    status: "Accepted",
    createdAt: "Feb 3, 2026",
    expiresAt: "Mar 3, 2026",
    owner: "Ivan Petrova",
    region: "US-West",
    items: [
      serviceCatalog[1],
      serviceCatalog[0],
    ],
    assumptions: [
      "Dedicated escalation manager assigned within 5 days of signature.",
    ],
    terms: [
      "24-month agreement with 3% annual uplift.",
      "Monthly QBRs included.",
    ],
  },
];

export const contracts: ContractSummary[] = [
  {
    id: "CTR-2026-010",
    quoteId: "Q-2026-0203",
    customer: "Atlas Logistics",
    status: "Active",
    startDate: "Feb 5, 2026",
    renewalDate: "Feb 5, 2028",
    slaTier: "Gold 1-hr response",
    serviceLevels: ["99.9% uptime", "24/7 coverage", "Monthly SLA reporting"],
    kpis: [
      { label: "MTTR", target: "< 60 minutes", measurement: "Incident clock" },
      { label: "First response", target: "< 1 hour", measurement: "Ticket acknowledgement" },
      { label: "CSAT", target: ">= 92%", measurement: "Quarterly survey" },
    ],
    supportModel: "Dedicated service manager + on-call escalation engineer.",
    escalation: [
      { level: "L1", response: "15 min", owner: "Service Desk" },
      { level: "L2", response: "45 min", owner: "Systems Team" },
      { level: "L3", response: "90 min", owner: "Engineering" },
      { level: "Exec", response: "2 hours", owner: "Service Director" },
    ],
  },
  {
    id: "CTR-2026-012",
    quoteId: "Q-2026-0211",
    customer: "FinNova Credit Union",
    status: "Pending",
    startDate: "Mar 15, 2026",
    renewalDate: "Mar 15, 2027",
    slaTier: "Platinum 15-min response",
    serviceLevels: ["99.95% uptime", "24/7 SOC coverage", "Weekly threat briefing"],
    kpis: [
      { label: "MTTD", target: "< 15 minutes", measurement: "SIEM events" },
      { label: "MTTR", target: "< 90 minutes", measurement: "Containment time" },
      { label: "Risk reduction", target: ">= 30%", measurement: "Quarterly review" },
    ],
    supportModel: "SOC pod with dedicated IR lead and compliance analyst.",
    escalation: [
      { level: "SOC", response: "15 min", owner: "Analyst on duty" },
      { level: "IR", response: "30 min", owner: "Incident lead" },
      { level: "Exec", response: "1 hour", owner: "VP Security" },
    ],
  },
];
