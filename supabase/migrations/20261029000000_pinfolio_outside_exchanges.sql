-- Record a one-step exchange with someone outside Pinfolio.
-- Both inventory changes and the history row commit or roll back together.
create table if not exists public.outside_pin_exchanges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  given_pin_id uuid not null references public.pins(id),
  given_quantity integer not null check (given_quantity > 0),
  received_pin_id uuid not null references public.pins(id),
  received_quantity integer not null check (received_quantity > 0),
  created_at timestamptz not null default now()
);
alter table public.outside_pin_exchanges enable row level security;
drop policy if exists "Users read own outside exchanges" on public.outside_pin_exchanges;
create policy "Users read own outside exchanges" on public.outside_pin_exchanges
  for select to authenticated using (user_id = auth.uid());
grant select on public.outside_pin_exchanges to authenticated;

create or replace function public.record_outside_pin_exchange(
  p_given_pin_id uuid,
  p_given_quantity integer,
  p_received_pin_id uuid default null,
  p_received_quantity integer default 1,
  p_new_pin jsonb default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_stock public.collection_items%rowtype;
  v_received_id uuid;
  v_exchange_id uuid;
  v_new_name text;
begin
  if v_user_id is null then raise exception 'Please sign in to record an exchange.'; end if;
  if p_given_quantity is null or p_given_quantity < 1 then raise exception 'Quantity given must be at least one.'; end if;
  if p_received_quantity is null or p_received_quantity < 1 then raise exception 'Quantity received must be at least one.'; end if;
  if p_given_pin_id = p_received_pin_id and p_new_pin is null then raise exception 'Choose a different pin for the exchange.'; end if;

  select * into v_stock
  from public.collection_items
  where user_id = v_user_id and pin_id = p_given_pin_id
  for update;
  if not found or v_stock.owned_quantity < p_given_quantity then
    raise exception 'You do not own that many copies of the pin you are giving away.';
  end if;

  if p_new_pin is not null then
    v_new_name := nullif(trim(p_new_pin->>'name'), '');
    if v_new_name is null then raise exception 'Enter a name for the new pin.'; end if;
    insert into public.pins(name, franchise, character_name, image_url, created_by)
    values (v_new_name, nullif(trim(p_new_pin->>'franchise'), ''),
            nullif(trim(p_new_pin->>'character_name'), ''),
            nullif(trim(p_new_pin->>'image_url'), ''), v_user_id)
    returning id into v_received_id;
  else
    v_received_id := p_received_pin_id;
    if v_received_id is null or not exists(select 1 from public.pins where id = v_received_id) then
      raise exception 'Choose a valid catalog pin or create a new one.';
    end if;
  end if;

  if v_stock.owned_quantity = p_given_quantity then
    delete from public.collection_items where id = v_stock.id;
  else
    update public.collection_items
    set owned_quantity = owned_quantity - p_given_quantity,
        tradeable_quantity = greatest(0, tradeable_quantity - p_given_quantity)
    where id = v_stock.id;
  end if;

  insert into public.collection_items(user_id, pin_id, owned_quantity, tradeable_quantity, visibility)
  values (v_user_id, v_received_id, p_received_quantity, 0, 'private')
  on conflict (user_id, pin_id) do update
    set owned_quantity = public.collection_items.owned_quantity + excluded.owned_quantity;

  insert into public.outside_pin_exchanges(user_id, given_pin_id, given_quantity, received_pin_id, received_quantity)
  values (v_user_id, p_given_pin_id, p_given_quantity, v_received_id, p_received_quantity)
  returning id into v_exchange_id;
  return v_exchange_id;
end;
$$;
revoke all on function public.record_outside_pin_exchange(uuid,integer,uuid,integer,jsonb) from public;
grant execute on function public.record_outside_pin_exchange(uuid,integer,uuid,integer,jsonb) to authenticated;
