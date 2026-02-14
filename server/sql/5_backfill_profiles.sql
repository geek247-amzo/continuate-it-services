insert into public.profiles (auth_user_id, email, name, role, status)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', u.email),
  'client',
  'Active'
from auth.users u
left join public.profiles p on p.email = u.email
where p.id is null;

-- Promote admin by email (edit as needed)
update public.profiles
set role = 'admin'
where email = 'amrish@continuate.co.za';
