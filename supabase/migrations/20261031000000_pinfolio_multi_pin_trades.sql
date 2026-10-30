-- Multi-pin trade proposals and outside exchanges. Existing trade and collection records are preserved.

create or replace function public.create_trade_proposal_multi(
  p_recipient_id uuid, p_offered_items jsonb, p_requested_items jsonb, p_message text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_trade_id uuid; v_item jsonb; v_pin_id uuid; v_qty integer; v_stock public.collection_items%rowtype; v_friendship boolean;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  if p_recipient_id is null or p_recipient_id=auth.uid() then raise exception 'Choose another trader.'; end if;
  if jsonb_typeof(p_offered_items)<>'array' or jsonb_array_length(p_offered_items)=0 or jsonb_typeof(p_requested_items)<>'array' or jsonb_array_length(p_requested_items)=0 then raise exception 'Select at least one offered pin and one requested pin.'; end if;
  select exists(select 1 from public.friend_requests fr where fr.status='accepted' and ((fr.sender_id=auth.uid() and fr.receiver_id=p_recipient_id) or (fr.receiver_id=auth.uid() and fr.sender_id=p_recipient_id))) into v_friendship;
  if not v_friendship then raise exception 'You must be accepted friends to trade.'; end if;
  for v_item in select value from jsonb_array_elements(p_offered_items) loop
    v_pin_id := (v_item->>'pin_id')::uuid; v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 then raise exception 'Pin quantities must be at least one.'; end if;
    select * into v_stock from public.collection_items where user_id=auth.uid() and pin_id=v_pin_id for update;
    if not found or v_stock.owned_quantity < v_qty then raise exception 'You do not own enough copies of an offered pin.'; end if;
  end loop;
  for v_item in select value from jsonb_array_elements(p_requested_items) loop
    v_pin_id := (v_item->>'pin_id')::uuid; v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 then raise exception 'Pin quantities must be at least one.'; end if;
    select * into v_stock from public.collection_items where user_id=p_recipient_id and pin_id=v_pin_id and visibility in ('friends','public') for update;
    if not found or v_stock.tradeable_quantity < v_qty then raise exception 'A requested pin is not shared and tradeable in that quantity.'; end if;
  end loop;
  insert into public.trades(proposer_id,recipient_id,message) values(auth.uid(),p_recipient_id,nullif(trim(p_message),'')) returning id into v_trade_id;
  for v_item in select value from jsonb_array_elements(p_offered_items) loop
    insert into public.trade_items(trade_id,owner_id,pin_id,quantity,item_type) values(v_trade_id,auth.uid(),(v_item->>'pin_id')::uuid,(v_item->>'quantity')::integer,'offered');
  end loop;
  for v_item in select value from jsonb_array_elements(p_requested_items) loop
    insert into public.trade_items(trade_id,owner_id,pin_id,quantity,item_type) values(v_trade_id,p_recipient_id,(v_item->>'pin_id')::uuid,(v_item->>'quantity')::integer,'requested');
  end loop;
  return v_trade_id;
end; $$;
revoke all on function public.create_trade_proposal_multi(uuid,jsonb,jsonb,text) from public;
grant execute on function public.create_trade_proposal_multi(uuid,jsonb,jsonb,text) to authenticated;

create or replace function public.counteroffer_trade_multi(
  p_trade_id uuid, p_offered_items jsonb, p_requested_items jsonb, p_message text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_old public.trades%rowtype; v_trade_id uuid; v_other uuid; v_item jsonb; v_pin_id uuid; v_qty integer; v_stock public.collection_items%rowtype; v_friendship boolean;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  select * into v_old from public.trades where id=p_trade_id for update;
  if not found or (auth.uid()<>v_old.proposer_id and auth.uid()<>v_old.recipient_id) then raise exception 'Trade not found.'; end if;
  if v_old.status<>'pending' then raise exception 'Only pending trades can be counteroffered.'; end if;
  if jsonb_typeof(p_offered_items)<>'array' or jsonb_array_length(p_offered_items)=0 or jsonb_typeof(p_requested_items)<>'array' or jsonb_array_length(p_requested_items)=0 then raise exception 'Select at least one offered pin and one requested pin.'; end if;
  v_other := case when auth.uid()=v_old.proposer_id then v_old.recipient_id else v_old.proposer_id end;
  select exists(select 1 from public.friend_requests fr where fr.status='accepted' and ((fr.sender_id=auth.uid() and fr.receiver_id=v_other) or (fr.receiver_id=auth.uid() and fr.sender_id=v_other))) into v_friendship;
  if not v_friendship then raise exception 'You must still be accepted friends to counteroffer.'; end if;
  for v_item in select value from jsonb_array_elements(p_offered_items) loop
    v_pin_id := (v_item->>'pin_id')::uuid; v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 then raise exception 'Pin quantities must be at least one.'; end if;
    select * into v_stock from public.collection_items where user_id=auth.uid() and pin_id=v_pin_id for update;
    if not found or v_stock.owned_quantity < v_qty then raise exception 'You do not own enough copies of an offered pin.'; end if;
  end loop;
  for v_item in select value from jsonb_array_elements(p_requested_items) loop
    v_pin_id := (v_item->>'pin_id')::uuid; v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 then raise exception 'Pin quantities must be at least one.'; end if;
    select * into v_stock from public.collection_items where user_id=v_other and pin_id=v_pin_id and visibility in ('friends','public') for update;
    if not found or v_stock.tradeable_quantity < v_qty then raise exception 'A requested pin is no longer available in that quantity.'; end if;
  end loop;
  update public.trades set status='declined',updated_at=now() where id=v_old.id;
  insert into public.trades(proposer_id,recipient_id,message) values(auth.uid(),v_other,coalesce(nullif(trim(p_message),''),'Counteroffer')) returning id into v_trade_id;
  for v_item in select value from jsonb_array_elements(p_offered_items) loop
    insert into public.trade_items(trade_id,owner_id,pin_id,quantity,item_type) values(v_trade_id,auth.uid(),(v_item->>'pin_id')::uuid,(v_item->>'quantity')::integer,'offered');
  end loop;
  for v_item in select value from jsonb_array_elements(p_requested_items) loop
    insert into public.trade_items(trade_id,owner_id,pin_id,quantity,item_type) values(v_trade_id,v_other,(v_item->>'pin_id')::uuid,(v_item->>'quantity')::integer,'requested');
  end loop;
  return v_trade_id;
end; $$;
revoke all on function public.counteroffer_trade_multi(uuid,jsonb,jsonb,text) from public;
grant execute on function public.counteroffer_trade_multi(uuid,jsonb,jsonb,text) to authenticated;

create table if not exists public.outside_pin_exchange_batches (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now()
);
create table if not exists public.outside_pin_exchange_batch_items (
  id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.outside_pin_exchange_batches(id) on delete cascade,
  pin_id uuid not null references public.pins(id), side text not null check(side in ('given','received')), quantity integer not null check(quantity>0), created_at timestamptz not null default now()
);
alter table public.outside_pin_exchange_batches enable row level security;
alter table public.outside_pin_exchange_batch_items enable row level security;
drop policy if exists "Users read own exchange batches" on public.outside_pin_exchange_batches;
create policy "Users read own exchange batches" on public.outside_pin_exchange_batches for select to authenticated using(user_id=auth.uid());
drop policy if exists "Users read own exchange batch items" on public.outside_pin_exchange_batch_items;
create policy "Users read own exchange batch items" on public.outside_pin_exchange_batch_items for select to authenticated using(exists(select 1 from public.outside_pin_exchange_batches b where b.id=batch_id and b.user_id=auth.uid()));
grant select on public.outside_pin_exchange_batches, public.outside_pin_exchange_batch_items to authenticated;

create or replace function public.record_outside_pin_exchange_multi(p_given_items jsonb, p_received_items jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid(); v_batch uuid; v_item jsonb; v_pin uuid; v_qty integer; v_stock public.collection_items%rowtype; v_new jsonb; v_name text; v_received_processed jsonb:='[]'::jsonb;
begin
  if v_user is null then raise exception 'Please sign in.'; end if;
  if jsonb_typeof(p_given_items)<>'array' or jsonb_array_length(p_given_items)=0 or jsonb_typeof(p_received_items)<>'array' or jsonb_array_length(p_received_items)=0 then raise exception 'Add at least one pin given and one pin received.'; end if;
  for v_item in select distinct value->>'pin_id' as pin_id from jsonb_array_elements(p_given_items) loop
    v_pin:=v_item.pin_id::uuid;
    select coalesce(sum((value->>'quantity')::integer),0) into v_qty from jsonb_array_elements(p_given_items) where value->>'pin_id'=v_pin::text;
    if v_qty<1 then raise exception 'Quantities must be at least one.'; end if;
    select * into v_stock from public.collection_items where user_id=v_user and pin_id=v_pin for update;
    if not found or v_stock.owned_quantity<v_qty then raise exception 'You do not own enough copies of a pin you are giving away.'; end if;
  end loop;
  -- Create/validate received pins before applying inventory changes; any failure rolls the entire function back.
  for v_item in select value from jsonb_array_elements(p_received_items) loop
    v_qty:=(v_item->>'quantity')::integer;
    if v_qty<1 then raise exception 'Quantities must be at least one.'; end if;
    v_new:=v_item->'new_pin';
    if v_new is not null and v_new <> 'null'::jsonb then
      v_name:=nullif(trim(v_new->>'name'),''); if v_name is null then raise exception 'Enter a name for each new pin.'; end if;
      insert into public.pins(name,franchise,character_name,image_url,created_by) values(v_name,nullif(trim(v_new->>'franchise'),''),nullif(trim(v_new->>'character_name'),''),nullif(trim(v_new->>'image_url'),''),v_user) returning id into v_pin;
      v_item:=jsonb_set(v_item,'{pin_id}',to_jsonb(v_pin::text),true);
      v_item:=v_item - 'new_pin';
      v_received_processed:=v_received_processed || jsonb_build_array(v_item);
    else
      v_pin:=(v_item->>'pin_id')::uuid;
      if v_pin is null or not exists(select 1 from public.pins where id=v_pin) then raise exception 'Choose a valid catalog pin or create a new one.'; end if;
      v_received_processed:=v_received_processed || jsonb_build_array(v_item);
    end if;
  end loop;
  insert into public.outside_pin_exchange_batches(user_id) values(v_user) returning id into v_batch;
  for v_item in select value from jsonb_array_elements(p_given_items) loop
    v_pin:=(v_item->>'pin_id')::uuid; v_qty:=(v_item->>'quantity')::integer;
    update public.collection_items set owned_quantity=owned_quantity-v_qty, tradeable_quantity=greatest(0,tradeable_quantity-v_qty) where user_id=v_user and pin_id=v_pin;
    delete from public.collection_items where user_id=v_user and pin_id=v_pin and owned_quantity<=0;
    insert into public.outside_pin_exchange_batch_items(batch_id,pin_id,side,quantity) values(v_batch,v_pin,'given',v_qty);
  end loop;
  for v_item in select value from jsonb_array_elements(v_received_processed) loop
    v_pin:=(v_item->>'pin_id')::uuid; v_qty:=(v_item->>'quantity')::integer;
    insert into public.collection_items(user_id,pin_id,owned_quantity,tradeable_quantity,visibility) values(v_user,v_pin,v_qty,0,'private')
      on conflict(user_id,pin_id) do update set owned_quantity=public.collection_items.owned_quantity+excluded.owned_quantity;
    insert into public.outside_pin_exchange_batch_items(batch_id,pin_id,side,quantity) values(v_batch,v_pin,'received',v_qty);
  end loop;
  return v_batch;
end; $$;
revoke all on function public.record_outside_pin_exchange_multi(jsonb,jsonb) from public;
grant execute on function public.record_outside_pin_exchange_multi(jsonb,jsonb) to authenticated;
