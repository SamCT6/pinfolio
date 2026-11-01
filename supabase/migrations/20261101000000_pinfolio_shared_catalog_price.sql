-- Shared catalog price, separate from a user's personal collection purchase cost.
alter table public.pins
  add column if not exists catalog_value numeric(10,2);

create or replace function public.set_pin_catalog_value(
  target_pin_id uuid,
  new_catalog_value numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit catalog prices.';
  end if;
  if new_catalog_value is not null and new_catalog_value < 0 then
    raise exception 'Catalog price must be zero or greater.';
  end if;
  update public.pins
     set catalog_value = new_catalog_value
   where id = target_pin_id
     and is_catalog = true;
  if not found then
    raise exception 'Catalog pin was not found.';
  end if;
end;
$$;

revoke all on function public.set_pin_catalog_value(uuid, numeric) from public;
grant execute on function public.set_pin_catalog_value(uuid, numeric) to authenticated;
