-- Store one shared estimated value on the catalog pin, visible to all users.
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
    raise exception 'You must be signed in to edit shared pin values.';
  end if;
  if new_catalog_value is not null and new_catalog_value < 0 then
    raise exception 'Pin value must be zero or greater.';
  end if;

  update public.pins
     set catalog_value = new_catalog_value
   where id = target_pin_id;

  if not found then
    raise exception 'Pin was not found.';
  end if;
end;
$$;

revoke all on function public.set_pin_catalog_value(uuid, numeric) from public;
grant execute on function public.set_pin_catalog_value(uuid, numeric) to authenticated;
