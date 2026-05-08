-- ============================================================
-- Money Pay — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Properties
create table if not exists mp_properties (
  id text primary key,
  name text not null,
  address text not null,
  created_at timestamptz default now()
);

-- Flats (belong to a property)
create table if not exists mp_flats (
  id text primary key,
  property_id text not null references mp_properties(id) on delete cascade,
  name text not null,
  rent integer not null default 0,
  status text not null default 'Vacant',
  tenant_id text,
  created_at timestamptz default now()
);

-- Tenants
create table if not exists mp_tenants (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  aadhaar text,
  alt_phone text,
  dob text,
  gender text,
  current_address text,
  permanent_address text,
  govt_id text,
  vehicle_no text,
  remarks text,
  flat_id text,
  property_id text,
  rent integer default 0,
  deposit integer default 0,
  status text default 'Active',
  kyc_status text default 'Pending',
  joining_date text,
  move_in_date text,
  agreement_end_date text,
  occupation text,
  emergency_contact text,
  created_at timestamptz default now()
);

-- Pending Registrations
create table if not exists mp_pending_registrations (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  aadhaar text,
  alt_phone text,
  dob text,
  gender text,
  current_address text,
  permanent_address text,
  govt_id text,
  vehicle_no text,
  remarks text,
  registered_date text,
  created_at timestamptz default now()
);

-- Dues
create table if not exists mp_dues (
  id text primary key,
  tenant_id text not null,
  category text not null,
  amount integer not null,
  due_date text not null,
  status text not null default 'Pending',
  created_at timestamptz default now()
);

-- Payments
create table if not exists mp_payments (
  id text primary key,
  tenant_id text not null,
  category text not null,
  amount integer not null,
  date text not null,
  remark text,
  created_at timestamptz default now()
);

-- Expenses
create table if not exists mp_expenses (
  id text primary key,
  description text not null,
  category text not null,
  amount integer not null,
  date text not null,
  remark text,
  created_at timestamptz default now()
);

-- Maintenance Requests
create table if not exists mp_maintenance_requests (
  id text primary key,
  tenant_id text not null,
  category text not null,
  description text not null,
  priority text not null,
  status text not null default 'Open',
  date_raised text not null,
  date_resolved text,
  admin_note text,
  created_at timestamptz default now()
);

-- Notices
create table if not exists mp_notices (
  id text primary key,
  title text not null,
  content text not null,
  priority text not null,
  posted_date text not null,
  expiry_date text not null,
  created_at timestamptz default now()
);

-- Agreements
create table if not exists mp_agreements (
  id text primary key,
  tenant_id text not null,
  start_date text not null,
  end_date text not null,
  period_months integer not null,
  lock_in_months integer not null,
  rent_amount integer not null,
  deposit integer not null,
  created_at timestamptz default now()
);

-- Utility Bills
create table if not exists mp_utility_bills (
  id text primary key,
  flat_id text not null,
  tenant_id text not null,
  period text not null,
  previous_reading numeric not null,
  current_reading numeric not null,
  rate_per_unit numeric not null,
  amount integer not null,
  status text not null default 'Pending',
  date text not null,
  created_at timestamptz default now()
);

-- Visitors
create table if not exists mp_visitors (
  id text primary key,
  name text not null,
  phone text,
  tenant_id text not null,
  purpose text not null,
  check_in_time text not null,
  check_out_time text,
  vehicle_no text,
  created_at timestamptz default now()
);

-- Activity Logs
create table if not exists mp_activity_logs (
  id text primary key,
  action text not null,
  details text,
  date text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — Allow all access (for trial/demo)
-- In production: restrict with proper auth policies
-- ============================================================

alter table mp_properties enable row level security;
alter table mp_flats enable row level security;
alter table mp_tenants enable row level security;
alter table mp_pending_registrations enable row level security;
alter table mp_dues enable row level security;
alter table mp_payments enable row level security;
alter table mp_expenses enable row level security;
alter table mp_maintenance_requests enable row level security;
alter table mp_notices enable row level security;
alter table mp_agreements enable row level security;
alter table mp_utility_bills enable row level security;
alter table mp_visitors enable row level security;
alter table mp_activity_logs enable row level security;

create policy "allow_all_properties"             on mp_properties             for all using (true) with check (true);
create policy "allow_all_flats"                  on mp_flats                  for all using (true) with check (true);
create policy "allow_all_tenants"                on mp_tenants                for all using (true) with check (true);
create policy "allow_all_pending_registrations"  on mp_pending_registrations  for all using (true) with check (true);
create policy "allow_all_dues"                   on mp_dues                   for all using (true) with check (true);
create policy "allow_all_payments"               on mp_payments               for all using (true) with check (true);
create policy "allow_all_expenses"               on mp_expenses               for all using (true) with check (true);
create policy "allow_all_maintenance"            on mp_maintenance_requests   for all using (true) with check (true);
create policy "allow_all_notices"                on mp_notices                for all using (true) with check (true);
create policy "allow_all_agreements"             on mp_agreements             for all using (true) with check (true);
create policy "allow_all_utility_bills"          on mp_utility_bills          for all using (true) with check (true);
create policy "allow_all_visitors"               on mp_visitors               for all using (true) with check (true);
create policy "allow_all_activity_logs"          on mp_activity_logs          for all using (true) with check (true);
