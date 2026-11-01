-- Aggregate community authenticity assessments for catalog pins, including pins added by other users.
-- Counts distinct users per status, not duplicate collection copies. Returns no user IDs, notes, or photos.
create or replace function public.get_catalog_authenticity_summary()
returns table (
  pin_id uuid,
  authenticity_status text,
  report_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select ci.pin_id,
         ci.authenticity_status::text as authenticity_status,
         count(distinct ci.user_id)::bigint as report_count
  from public.collection_items ci
  join public.pins p on p.id = ci.pin_id
  where ci.authenticity_status is not null
    and ci.authenticity_status::text in ('verified_authentic', 'suspected_counterfeit', 'confirmed_counterfeit')
  group by ci.pin_id, ci.authenticity_status
  order by ci.pin_id, ci.authenticity_status;
$$;

revoke all on function public.get_catalog_authenticity_summary() from public;
grant execute on function public.get_catalog_authenticity_summary() to authenticated;
