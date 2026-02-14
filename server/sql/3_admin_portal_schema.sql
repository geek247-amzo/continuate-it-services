create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  name text,
  role text not null default 'client',
  company text,
  phone text,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_company_idx on profiles(company);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  customer text not null,
  requester_name text,
  requester_email text,
  subject text not null,
  category text,
  priority text not null default 'Medium',
  status text not null default 'Open',
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sla_due_at timestamptz,
  notes jsonb not null default '[]',
  tags jsonb not null default '[]'
);

create index if not exists tickets_status_idx on tickets(status);
create index if not exists tickets_priority_idx on tickets(priority);
create index if not exists tickets_customer_idx on tickets(customer);
create index if not exists tickets_public_id_idx on tickets(public_id);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  customer text not null,
  plan text,
  status text not null default 'Active',
  start_date date,
  renewal_date date,
  billing_cycle text,
  billing_currency text default 'USD',
  mrr numeric(12,2) not null default 0,
  seats int not null default 0,
  add_ons jsonb not null default '[]',
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_status_idx on subscriptions(status);
create index if not exists subscriptions_customer_idx on subscriptions(customer);
create index if not exists subscriptions_public_id_idx on subscriptions(public_id);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  invoice_number text unique not null,
  status text not null default 'Open',
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  due_date date,
  paid_at date,
  created_at timestamptz not null default now()
);

create index if not exists invoices_status_idx on invoices(status);
create index if not exists invoices_subscription_idx on invoices(subscription_id);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period_start date,
  period_end date,
  summary text,
  kpis jsonb not null default '[]',
  issues jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists reports_period_idx on reports(period_start, period_end);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail text,
  actor text,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_idx on activity_log(created_at desc);

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists tickets_set_updated_at on tickets;
create trigger tickets_set_updated_at
before update on tickets
for each row execute function set_updated_at();

drop trigger if exists subscriptions_set_updated_at on subscriptions;
create trigger subscriptions_set_updated_at
before update on subscriptions
for each row execute function set_updated_at();
