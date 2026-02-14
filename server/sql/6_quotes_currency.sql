alter table if exists quotes
  add column if not exists currency text not null default 'ZAR';
