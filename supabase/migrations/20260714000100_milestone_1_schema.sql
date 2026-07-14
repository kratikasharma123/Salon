-- SalonPro Milestone 1 database schema
-- Compatible with Supabase PostgreSQL.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text,
  email text,
  phone text,
  website text,
  logo_url text,
  description text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text,
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  language text not null default 'en',
  date_format text not null default 'DD/MM/YYYY',
  time_format text not null default '12h',
  tax_enabled boolean not null default false,
  tax_name text,
  tax_rate numeric(7,4) not null default 0,
  tax_display_type text not null default 'exclusive',
  business_hours jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_email_format_chk check (
    email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint organizations_time_format_chk check (time_format in ('12h', '24h')),
  constraint organizations_tax_rate_chk check (tax_rate >= 0 and tax_rate <= 100),
  constraint organizations_tax_display_type_chk check (tax_display_type in ('exclusive', 'inclusive')),
  constraint organizations_business_hours_object_chk check (jsonb_typeof(business_hours) = 'object')
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'Business Owner' references public.roles(name) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null references public.roles(name) on update cascade on delete restrict,
  joined_at timestamptz not null default now(),
  constraint organization_members_unique_member unique (organization_id, user_id)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null references public.roles(name) on update cascade on delete cascade,
  module text not null,
  action text not null,
  constraint permissions_unique_role_module_action unique (role, module, action)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  module text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_logs_metadata_object_chk check (jsonb_typeof(metadata) = 'object')
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create index if not exists organizations_email_idx on public.organizations (email);
create index if not exists organizations_onboarding_completed_idx on public.organizations (onboarding_completed);
create index if not exists organizations_country_city_idx on public.organizations (country, city);

create index if not exists profiles_organization_id_idx on public.profiles (organization_id);
create index if not exists profiles_role_idx on public.profiles (role);

create index if not exists organization_members_organization_id_idx on public.organization_members (organization_id);
create index if not exists organization_members_user_id_idx on public.organization_members (user_id);
create index if not exists organization_members_role_idx on public.organization_members (role);

create index if not exists permissions_role_idx on public.permissions (role);
create index if not exists permissions_module_action_idx on public.permissions (module, action);

create index if not exists activity_logs_organization_created_at_idx on public.activity_logs (organization_id, created_at desc);
create index if not exists activity_logs_user_id_idx on public.activity_logs (user_id);
create index if not exists activity_logs_module_action_idx on public.activity_logs (module, action);

comment on table public.organizations is 'SalonPro tenant organizations and business workspace settings.';
comment on table public.profiles is 'Application profile records linked one-to-one with Supabase Auth users.';
comment on table public.organization_members is 'Membership records connecting users to organizations and roles.';
comment on table public.roles is 'Default SalonPro role catalog for future role-based access control.';
comment on table public.permissions is 'Role-to-module/action permission definitions for future authorization.';
comment on table public.activity_logs is 'Organization-scoped activity timeline for future audit and activity feeds.';
