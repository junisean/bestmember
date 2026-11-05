create table public.bestmember_records (object_key text primary key, data jsonb not null check (jsonb_typeof(data)='object'), created_at timestamptz not null default now());
create table public.bestfirstday_records (object_key text primary key, data jsonb not null check (jsonb_typeof(data)='object'), created_at timestamptz not null default now());
alter table public.bestmember_records enable row level security;
alter table public.bestfirstday_records enable row level security;
revoke all on public.bestmember_records,public.bestfirstday_records from anon,authenticated;
grant select,insert,update on public.bestmember_records,public.bestfirstday_records to service_role;
create policy deny_direct_client_access on public.bestmember_records for all to anon,authenticated using (false) with check (false);
create policy deny_direct_client_access on public.bestfirstday_records for all to anon,authenticated using (false) with check (false);
