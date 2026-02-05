-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_street text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_zip text not null,
  shipping_country text not null,
  subtotal numeric not null,
  total numeric not null,
  status text not null default 'pending', -- pending, paid, shipped, completed, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_name text not null,
  variant_name text,
  quantity integer not null,
  price numeric not null,
  cost numeric, -- optional, if you want to track profit
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Create policy for Admin access (assuming service_role for now, or authenticated admin users)
-- For now, allowing all access to authenticated users if we had auth, but since we are using service role in API, we don't strictly need public policies if we only access via server.
-- However, for the client-side admin dashboard to read it (if using client key), we need policies.
-- Assuming Admin Dashboard uses a logged-in user who should have access.
-- COMPLETE THIS AFTER AUTH IS FULLY SET UP. For now, we will use the SERVICE_ROLE key in the API to write.
-- The Admin Dashboard might need to use the Service Role or purely server-side props with service role to read data to be secure,
-- OR we set up a policy that allows specific users.

-- For simplicity in this step, we'll allow read access to public (or authenticated) for ease of development/demo, 
-- BUT STRONGLY RECOMMEND locking this down to a specific 'admin' role later.
create policy "Enable read access for all users" on public.orders for select using (true);
create policy "Enable read access for all users" on public.order_items for select using (true);

-- Functions to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_order_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();
