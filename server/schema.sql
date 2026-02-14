create extension if not exists "pgcrypto";

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  name text not null,
  customer text not null,
  contact_name text,
  contact_email text,
  region text,
  owner text,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  expires_at date,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  assumptions jsonb not null default '[]',
  terms jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);

create index if not exists quotes_status_idx on quotes(status);
create index if not exists quotes_customer_idx on quotes(customer);
create index if not exists quotes_public_id_idx on quotes(public_id);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  unit text,
  quantity numeric(12,2) not null,
  unit_price numeric(12,2) not null,
  sla_tier text,
  kpi_tags jsonb not null default '[]'
);

create index if not exists quote_items_quote_id_idx on quote_items(quote_id);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  quote_id uuid unique not null references quotes(id) on delete cascade,
  customer text not null,
  status text not null default 'Pending',
  owner text,
  start_date date,
  renewal_date date,
  notice_date date,
  sla_tier text,
  service_levels jsonb not null default '[]',
  kpis jsonb not null default '[]',
  support_model text,
  escalation jsonb not null default '[]',
  billing_cycle text,
  billing_currency text default 'USD',
  mrr numeric(12,2) not null default 0,
  arr numeric(12,2) not null default 0,
  payment_terms text,
  invoicing_day int,
  health_score int,
  risk_level text,
  last_qbr date,
  next_qbr date,
  auto_renew boolean not null default true,
  contacts jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_status_idx on contracts(status);
create index if not exists contracts_public_id_idx on contracts(public_id);
create index if not exists contracts_customer_idx on contracts(customer);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contracts_set_updated_at on contracts;
create trigger contracts_set_updated_at
before update on contracts
for each row execute function set_updated_at();
