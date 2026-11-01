-- Make the pin value entered when a collection item is added a shared catalog value.
-- This is intentionally triggered by a new collection item so personal purchase-cost
-- edits later do not unexpectedly change the shared catalog value.

alter table public.pins
  add column if not exists catalog_value numeric(10,2);

create or replace function public.set_shared_pin_value_from_collection_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.purchase_cost is not null and new.purchase_cost >= 0 then
    update public.pins
       set catalog_value = new.purchase_cost
     where id = new.pin_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_shared_pin_value_from_collection_insert
on public.collection_items;

create trigger trg_shared_pin_value_from_collection_insert
after insert on public.collection_items
for each row
execute function public.set_shared_pin_value_from_collection_insert();

revoke all on function public.set_shared_pin_value_from_collection_insert() from public;
grant execute on function public.set_shared_pin_value_from_collection_insert() to authenticated;
