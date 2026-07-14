-- SalonPro Milestone 1 default role seed data.

insert into public.roles (name, description)
values
  ('Super Admin', 'Platform-level administrator with full system access.'),
  ('Business Owner', 'Primary owner of a salon business workspace.'),
  ('Branch Manager', 'Manager responsible for branch operations and team coordination.'),
  ('Receptionist', 'Front desk user responsible for appointments and customer coordination.'),
  ('Stylist', 'Service provider responsible for salon services and appointments.'),
  ('Accountant', 'Finance user responsible for billing, revenue, and expense tracking.'),
  ('Inventory Manager', 'Inventory user responsible for stock, products, and supplies.')
on conflict (name) do update
set description = excluded.description;
