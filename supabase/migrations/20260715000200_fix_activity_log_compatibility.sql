-- Ensure activity logging stays compatible with the application and never blocks core workflows.

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  module text not null,
  action text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_logs
  add column if not exists id uuid default gen_random_uuid();

alter table public.activity_logs
  add column if not exists organization_id uuid;

alter table public.activity_logs
  add column if not exists user_id uuid;

alter table public.activity_logs
  add column if not exists module text;

alter table public.activity_logs
  add column if not exists action text;

alter table public.activity_logs
  add column if not exists description text;

alter table public.activity_logs
  add column if not exists metadata jsonb default '{}'::jsonb;

alter table public.activity_logs
  add column if not exists created_at timestamptz default now();

create index if not exists activity_logs_organization_created_at_idx on public.activity_logs (organization_id, created_at desc);
create index if not exists activity_logs_user_id_idx on public.activity_logs (user_id);
create index if not exists activity_logs_module_action_idx on public.activity_logs (module, action);

create or replace function public.write_activity_log(
  p_organization_id uuid,
  p_user_id uuid,
  p_module text,
  p_action text,
  p_description text,
  p_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  log_id uuid;
begin
  begin
    insert into public.activity_logs (
      organization_id,
      user_id,
      module,
      action,
      description,
      metadata,
      created_at
    )
    values (
      p_organization_id,
      p_user_id,
      nullif(btrim(coalesce(p_module, '')), ''),
      nullif(btrim(coalesce(p_action, '')), ''),
      nullif(btrim(coalesce(p_description, '')), ''),
      case
        when p_metadata is not null and jsonb_typeof(p_metadata) = 'object' then p_metadata
        else '{}'::jsonb
      end,
      now()
    )
    returning id into log_id;

    return log_id;
  exception
    when others then
      raise warning 'Activity log failed: %', sqlerrm;
      return null;
  end;
end;
$$;

revoke all on function public.write_activity_log(uuid, uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.write_activity_log(uuid, uuid, text, text, text, jsonb) to authenticated;
