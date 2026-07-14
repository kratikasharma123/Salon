-- SalonPro workspace access helpers and minimal RLS policies.

create or replace function public.is_org_member(p_organization_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_business_owner(p_organization_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
      and om.role = 'Business Owner'
  );
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.is_org_business_owner(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_business_owner(uuid) to authenticated;

alter table public.roles enable row level security;
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.permissions enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "Authenticated users can read roles" on public.roles;
create policy "Authenticated users can read roles"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "Members can read their organizations" on public.organizations;
create policy "Members can read their organizations"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

drop policy if exists "Business owners can update their organizations" on public.organizations;
create policy "Business owners can update their organizations"
on public.organizations
for update
to authenticated
using (public.is_org_business_owner(id))
with check (public.is_org_business_owner(id));

drop policy if exists "Users can read profiles in their organization" on public.profiles;
create policy "Users can read profiles in their organization"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_org_member(organization_id)
);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Members can read organization memberships" on public.organization_members;
create policy "Members can read organization memberships"
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can read organization permissions" on public.permissions;
create policy "Members can read organization permissions"
on public.permissions
for select
to authenticated
using (true);

drop policy if exists "Members can read organization activity logs" on public.activity_logs;
create policy "Members can read organization activity logs"
on public.activity_logs
for select
to authenticated
using (public.is_org_member(organization_id));

grant select on public.roles to authenticated;
grant select on public.organizations to authenticated;
grant update on public.organizations to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant select on public.organization_members to authenticated;
grant select on public.permissions to authenticated;
grant select on public.activity_logs to authenticated;

create or replace function public.get_my_workspace()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object(
      'profile', to_jsonb(p),
      'organization', to_jsonb(o),
      'membership', to_jsonb(om)
    )
    from public.profiles p
    join public.organizations o
      on o.id = p.organization_id
    left join public.organization_members om
      on om.organization_id = p.organization_id
     and om.user_id = p.id
    where p.id = auth.uid()
    limit 1
  ), '{}'::jsonb);
$$;

revoke all on function public.get_my_workspace() from public, anon;
grant execute on function public.get_my_workspace() to authenticated;
