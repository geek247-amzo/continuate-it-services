with q1 as (
  insert into quotes (
    public_id,
    name,
    customer,
    contact_name,
    contact_email,
    region,
    owner,
    status,
    created_at,
    expires_at,
    assumptions,
    terms,
    subtotal,
    total
  ) values (
    'Q-2026-0211',
    'FinNova MSSP + IT SLA',
    'FinNova Credit Union',
    'Nadia Patel',
    'nadia@finnova.co',
    'US-East',
    'Sophie Grant',
    'Sent',
    '2026-02-11T10:00:00Z',
    '2026-03-12',
    '["Customer provides endpoint inventory weekly.","SOC tooling access granted within 10 business days.","IR retainer is shared across two sites."]'::jsonb,
    '["12-month term with annual renewal option.","Monthly billing in arrears via ACH.","Service credits apply after SLA breach review."]'::jsonb,
    14620,
    14620
  )
  returning id
),
q2 as (
  insert into quotes (
    public_id,
    name,
    customer,
    contact_name,
    contact_email,
    region,
    owner,
    status,
    created_at,
    expires_at,
    assumptions,
    terms,
    subtotal,
    total
  ) values (
    'Q-2026-0207',
    'Horizon Health Cybersecurity Suite',
    'Horizon Health',
    'Luis Alvarez',
    'luis@horizonhealth.org',
    'US-Central',
    'Marina Kovac',
    'Viewed',
    '2026-02-07T10:00:00Z',
    '2026-03-09',
    '["Endpoint telemetry fed into existing EDR.","Quarterly compliance workshops included."]'::jsonb,
    '["6-month initial term with auto-renewal.","Quarterly invoicing in advance."]'::jsonb,
    3640,
    3640
  )
  returning id
),
q3 as (
  insert into quotes (
    public_id,
    name,
    customer,
    contact_name,
    contact_email,
    region,
    owner,
    status,
    created_at,
    expires_at,
    assumptions,
    terms,
    subtotal,
    total
  ) values (
    'Q-2026-0203',
    'Atlas Logistics Support SLA',
    'Atlas Logistics',
    'Priya Singh',
    'priya@atlaslogistics.com',
    'US-West',
    'Ivan Petrova',
    'Accepted',
    '2026-02-03T10:00:00Z',
    '2026-03-03',
    '["Dedicated escalation manager assigned within 5 days of signature."]'::jsonb,
    '["24-month agreement with 3% annual uplift.","Monthly QBRs included."]'::jsonb,
    11260,
    11260
  )
  returning id
)
insert into quote_items (quote_id, name, category, description, unit, quantity, unit_price, sla_tier, kpi_tags)
select q1.id, 'IT SLA Guard', 'IT SLA',
  '24/7 monitoring, incident response, and SLA reporting for critical infrastructure.',
  'per site', 2, 1850, 'Platinum 15-min response',
  '["99.95% uptime","MTTR 60m","Monthly QBR"]'::jsonb
from q1
union all
select q1.id, 'MSSP Threat Detection', 'MSSP',
  '24/7 SOC with SIEM onboarding, correlation rules, and incident triage.',
  'per endpoint', 240, 28, 'Threat response 30m',
  '["MTTD 15m","MTTR 90m"]'::jsonb
from q1
union all
select q1.id, 'Incident Response Retainer', 'MSSP',
  'Guaranteed IR hours with pre-built playbooks and forensic readiness.',
  'monthly', 1, 4200, 'On-call 15m',
  '["Containment < 2h","Forensic reporting 72h"]'::jsonb
from q1
union all
select q2.id, 'Vulnerability Management', 'Cybersecurity',
  'Continuous scanning, prioritization, and remediation tracking.',
  'per asset', 320, 8, 'Critical patch 7 days',
  '["Critical risk < 5%","Patch compliance 95%"]'::jsonb
from q2
union all
select q2.id, 'Security Awareness Program', 'Cybersecurity',
  'Phishing simulations, policy training, and quarterly compliance reviews.',
  'per user', 180, 6, 'Training completion 30 days',
  '["Phish click < 3%","Completion 98%"]'::jsonb
from q2
union all
select q3.id, 'Managed Service Desk', 'IT SLA',
  'Tiered L1-L3 support with runbook automation and escalation coverage.',
  'per user', 180, 42, 'Gold 1-hr response',
  '["CSAT 92%","First response < 60m"]'::jsonb
from q3
union all
select q3.id, 'IT SLA Guard', 'IT SLA',
  '24/7 monitoring, incident response, and SLA reporting for critical infrastructure.',
  'per site', 2, 1850, 'Platinum 15-min response',
  '["99.95% uptime","MTTR 60m","Monthly QBR"]'::jsonb
from q3;

insert into contracts (
  public_id,
  quote_id,
  customer,
  status,
  owner,
  start_date,
  renewal_date,
  notice_date,
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
) values (
  'CTR-2026-010',
  (select id from quotes where public_id = 'Q-2026-0203'),
  'Atlas Logistics',
  'Active',
  'Ivan Petrova',
  '2026-02-05',
  '2028-02-05',
  '2027-11-05',
  'Gold 1-hr response',
  '["99.9% uptime","24/7 coverage","Monthly SLA reporting"]'::jsonb,
  '[{"label":"MTTR","target":"< 60 minutes","measurement":"Incident clock"},{"label":"First response","target":"< 1 hour","measurement":"Ticket acknowledgement"},{"label":"CSAT","target":">= 92%","measurement":"Quarterly survey"}]'::jsonb,
  'Dedicated service manager + on-call escalation engineer.',
  '[{"level":"L1","response":"15 min","owner":"Service Desk"},{"level":"L2","response":"45 min","owner":"Systems Team"},{"level":"L3","response":"90 min","owner":"Engineering"},{"level":"Exec","response":"2 hours","owner":"Service Director"}]'::jsonb,
  'Monthly',
  'USD',
  11260,
  135120,
  'Net 15',
  5,
  86,
  'Low',
  '2025-12-15',
  '2026-03-15',
  true,
  '[{"name":"Priya Singh","role":"Operations Director","email":"priya@atlaslogistics.com","phone":"+1 415-555-0141","primary":true},{"name":"Evan Price","role":"IT Manager","email":"evan@atlaslogistics.com","phone":"+1 415-555-0198","primary":false}]'::jsonb
), (
  'CTR-2026-012',
  (select id from quotes where public_id = 'Q-2026-0211'),
  'FinNova Credit Union',
  'Pending',
  'Sophie Grant',
  '2026-03-15',
  '2027-03-15',
  '2026-12-15',
  'Platinum 15-min response',
  '["99.95% uptime","24/7 SOC coverage","Weekly threat briefing"]'::jsonb,
  '[{"label":"MTTD","target":"< 15 minutes","measurement":"SIEM events"},{"label":"MTTR","target":"< 90 minutes","measurement":"Containment time"},{"label":"Risk reduction","target":">= 30%","measurement":"Quarterly review"}]'::jsonb,
  'SOC pod with dedicated IR lead and compliance analyst.',
  '[{"level":"SOC","response":"15 min","owner":"Analyst on duty"},{"level":"IR","response":"30 min","owner":"Incident lead"},{"level":"Exec","response":"1 hour","owner":"VP Security"}]'::jsonb,
  'Monthly',
  'USD',
  14620,
  175440,
  'Net 30',
  10,
  72,
  'Medium',
  '2026-01-20',
  '2026-04-20',
  true,
  '[{"name":"Nadia Patel","role":"VP Risk","email":"nadia@finnova.co","phone":"+1 212-555-0173","primary":true},{"name":"Marcus Lee","role":"Security Lead","email":"marcus@finnova.co","phone":"+1 212-555-0149","primary":false}]'::jsonb
);
