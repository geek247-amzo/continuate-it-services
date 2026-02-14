-- Enable RLS
alter table if exists profiles enable row level security;
alter table if exists tickets enable row level security;
alter table if exists subscriptions enable row level security;
alter table if exists invoices enable row level security;
alter table if exists quotes enable row level security;
alter table if exists quote_items enable row level security;
alter table if exists contracts enable row level security;
alter table if exists reports enable row level security;
alter table if exists activity_log enable row level security;

-- Helper: check admin role from profiles
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (auth_user_id, email, name, role, status)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email), 'client', 'Active')
  on conflict (email) do update set auth_user_id = excluded.auth_user_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Profiles: self access
create policy "Profiles: self read"
on public.profiles
for select
to authenticated
using (auth.uid() = auth_user_id or email = (auth.jwt() ->> 'email') or public.is_admin());

create policy "Profiles: self update"
on public.profiles
for update
to authenticated
using (auth.uid() = auth_user_id or email = (auth.jwt() ->> 'email') or public.is_admin());

-- Tickets: admin full access
create policy "Tickets: admin all"
on public.tickets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Tickets: requester read
create policy "Tickets: requester read"
on public.tickets
for select
to authenticated
using (requester_email = (auth.jwt() ->> 'email'));

-- Tickets: requester insert
create policy "Tickets: requester insert"
on public.tickets
for insert
to authenticated
with check (requester_email = (auth.jwt() ->> 'email'));

-- Subscriptions: admin full access
create policy "Subscriptions: admin all"
on public.subscriptions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Subscriptions: customer read
create policy "Subscriptions: customer read"
on public.subscriptions
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and coalesce(p.company, p.name, p.email) = subscriptions.customer
  )
);

-- Invoices: admin full access
create policy "Invoices: admin all"
on public.invoices
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Invoices: customer read via subscription
create policy "Invoices: customer read"
on public.invoices
for select
to authenticated
using (
  exists (
    select 1
    from public.subscriptions s
    join public.profiles p on coalesce(p.company, p.name, p.email) = s.customer
    where p.auth_user_id = auth.uid()
      and s.id = invoices.subscription_id
  )
);

-- Quotes: admin only
create policy "Quotes: admin all"
on public.quotes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Quote items: admin all"
on public.quote_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Contracts: admin only
create policy "Contracts: admin all"
on public.contracts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Reports: admin only
create policy "Reports: admin all"
on public.reports
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Activity log: admin read/write
create policy "Activity log: admin all"
on public.activity_log
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
