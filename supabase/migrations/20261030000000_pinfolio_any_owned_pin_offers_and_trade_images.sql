-- Allow a member to offer any pin they own, even if they have not marked it tradeable.
-- Pins requested from another member must still be marked tradeable and shared.

create or replace function public.create_trade_proposal(
  p_recipient_id uuid, p_offer_pin_id uuid, p_offer_quantity integer,
  p_request_pin_id uuid, p_request_quantity integer, p_message text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_trade_id uuid; friendship boolean; proposer_stock public.collection_items%rowtype; recipient_stock public.collection_items%rowtype;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  if p_recipient_id = auth.uid() then raise exception 'You cannot trade with yourself.'; end if;
  if p_offer_quantity < 1 or p_request_quantity < 1 then raise exception 'Trade quantities must be at least one.'; end if;
  select exists(select 1 from public.friend_requests fr where fr.status='accepted' and ((fr.sender_id=auth.uid() and fr.receiver_id=p_recipient_id) or (fr.receiver_id=auth.uid() and fr.sender_id=p_recipient_id))) into friendship;
  if not friendship then raise exception 'You must be accepted friends to trade.'; end if;
  select * into proposer_stock from public.collection_items where user_id=auth.uid() and pin_id=p_offer_pin_id for update;
  if not found or proposer_stock.owned_quantity < p_offer_quantity then raise exception 'You do not own enough copies of the offered pin.'; end if;
  select * into recipient_stock from public.collection_items where user_id=p_recipient_id and pin_id=p_request_pin_id and visibility in ('friends','public') for update;
  if not found or recipient_stock.tradeable_quantity < p_request_quantity then raise exception 'That pin is not available to trade in the requested quantity.'; end if;
  insert into public.trades(proposer_id, recipient_id, message) values(auth.uid(), p_recipient_id, nullif(trim(p_message),'')) returning id into new_trade_id;
  insert into public.trade_items(trade_id, owner_id, pin_id, quantity, item_type) values
    (new_trade_id, auth.uid(), p_offer_pin_id, p_offer_quantity, 'offered'),
    (new_trade_id, p_recipient_id, p_request_pin_id, p_request_quantity, 'requested');
  return new_trade_id;
end; $$;
revoke all on function public.create_trade_proposal(uuid,uuid,integer,uuid,integer,text) from public;
grant execute on function public.create_trade_proposal(uuid,uuid,integer,uuid,integer,text) to authenticated;

create or replace function public.counteroffer_trade(
  p_trade_id uuid, p_offer_pin_id uuid, p_offer_quantity integer,
  p_request_pin_id uuid, p_request_quantity integer, p_message text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare old_trade public.trades%rowtype; new_trade_id uuid; own_stock public.collection_items%rowtype; other_stock public.collection_items%rowtype; other_id uuid; friendship boolean;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  select * into old_trade from public.trades where id=p_trade_id for update;
  if not found or (auth.uid() <> old_trade.proposer_id and auth.uid() <> old_trade.recipient_id) then raise exception 'Trade not found.'; end if;
  if old_trade.status <> 'pending' then raise exception 'Only pending trades can be counteroffered.'; end if;
  if p_offer_quantity < 1 or p_request_quantity < 1 then raise exception 'Trade quantities must be at least one.'; end if;
  other_id := case when auth.uid()=old_trade.proposer_id then old_trade.recipient_id else old_trade.proposer_id end;
  select exists(select 1 from public.friend_requests fr where fr.status='accepted' and ((fr.sender_id=auth.uid() and fr.receiver_id=other_id) or (fr.receiver_id=auth.uid() and fr.sender_id=other_id))) into friendship;
  if not friendship then raise exception 'You must still be friends to counteroffer.'; end if;
  select * into own_stock from public.collection_items where user_id=auth.uid() and pin_id=p_offer_pin_id for update;
  if not found or own_stock.owned_quantity < p_offer_quantity then raise exception 'You do not own enough copies of your offered pin.'; end if;
  select * into other_stock from public.collection_items where user_id=other_id and pin_id=p_request_pin_id and visibility in ('friends','public') for update;
  if not found or other_stock.tradeable_quantity < p_request_quantity then raise exception 'The requested pin is not available in that quantity.'; end if;
  update public.trades set status='declined', updated_at=now() where id=old_trade.id;
  insert into public.trades(proposer_id,recipient_id,message) values(auth.uid(),other_id,coalesce(nullif(trim(p_message),''),'Counteroffer')) returning id into new_trade_id;
  insert into public.trade_items(trade_id,owner_id,pin_id,quantity,item_type) values
    (new_trade_id,auth.uid(),p_offer_pin_id,p_offer_quantity,'offered'),
    (new_trade_id,other_id,p_request_pin_id,p_request_quantity,'requested');
  return new_trade_id;
end; $$;
revoke all on function public.counteroffer_trade(uuid,uuid,integer,uuid,integer,text) from public;
grant execute on function public.counteroffer_trade(uuid,uuid,integer,uuid,integer,text) to authenticated;

create or replace function public.respond_to_trade(p_trade_id uuid, p_response text)
returns text language plpgsql security definer set search_path = public as $$
declare tr public.trades%rowtype;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  if p_response not in ('accepted','declined') then raise exception 'Invalid response.'; end if;
  select * into tr from public.trades where id=p_trade_id for update;
  if not found or tr.recipient_id <> auth.uid() then raise exception 'Trade not found.'; end if;
  if tr.status <> 'pending' then raise exception 'This trade is no longer pending.'; end if;
  if p_response='accepted' and exists(
    select 1 from public.trade_items ti
    left join public.collection_items ci on ci.user_id=ti.owner_id and ci.pin_id=ti.pin_id
    where ti.trade_id=tr.id and (
      ci.id is null or
      (ti.item_type='offered' and ci.owned_quantity < ti.quantity) or
      (ti.item_type='requested' and ci.tradeable_quantity < ti.quantity)
    )
  ) then raise exception 'A pin quantity changed or the requested pin is no longer tradeable. The proposal cannot be accepted.'; end if;
  update public.trades set status=p_response, updated_at=now() where id=tr.id;
  return p_response;
end; $$;
revoke all on function public.respond_to_trade(uuid,text) from public;
grant execute on function public.respond_to_trade(uuid,text) to authenticated;

create or replace function public.confirm_trade_completion(p_trade_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare tr public.trades%rowtype; ti record; new_owner uuid;
begin
  if auth.uid() is null then raise exception 'Please sign in.'; end if;
  select * into tr from public.trades where id=p_trade_id for update;
  if not found or (tr.proposer_id <> auth.uid() and tr.recipient_id <> auth.uid()) then raise exception 'Trade not found.'; end if;
  if tr.status <> 'accepted' then raise exception 'Only accepted trades can be completed.'; end if;
  if auth.uid()=tr.proposer_id then
    if tr.proposer_confirmed then return case when tr.recipient_confirmed then 'completed' else 'waiting' end; end if;
    update public.trades set proposer_confirmed=true, updated_at=now() where id=tr.id returning * into tr;
  else
    if tr.recipient_confirmed then return case when tr.proposer_confirmed then 'completed' else 'waiting' end; end if;
    update public.trades set recipient_confirmed=true, updated_at=now() where id=tr.id returning * into tr;
  end if;
  if not (tr.proposer_confirmed and tr.recipient_confirmed) then return 'waiting'; end if;
  if exists(
    select 1 from public.trade_items ti
    left join public.collection_items ci on ci.user_id=ti.owner_id and ci.pin_id=ti.pin_id
    where ti.trade_id=tr.id and (
      ci.id is null or ci.owned_quantity < ti.quantity or
      (ti.item_type='requested' and ci.tradeable_quantity < ti.quantity)
    )
  ) then raise exception 'Inventory changed since the proposal. Please cancel this trade and create a new one.'; end if;
  for ti in select * from public.trade_items where trade_id=tr.id order by id loop
    new_owner := case when ti.owner_id=tr.proposer_id then tr.recipient_id else tr.proposer_id end;
    update public.collection_items
      set owned_quantity=owned_quantity-ti.quantity,
          tradeable_quantity=greatest(0,tradeable_quantity-ti.quantity)
      where user_id=ti.owner_id and pin_id=ti.pin_id;
    delete from public.collection_items where user_id=ti.owner_id and pin_id=ti.pin_id and owned_quantity=0;
    insert into public.collection_items(user_id,pin_id,owned_quantity,tradeable_quantity,purchase_cost,authenticity_status,visibility)
      values(new_owner,ti.pin_id,ti.quantity,0,null,'unknown','private')
      on conflict(user_id,pin_id) do update set owned_quantity=public.collection_items.owned_quantity+excluded.owned_quantity;
  end loop;
  update public.trades set status='completed', updated_at=now() where id=tr.id;
  return 'completed';
end; $$;
revoke all on function public.confirm_trade_completion(uuid) from public;
grant execute on function public.confirm_trade_completion(uuid) to authenticated;
