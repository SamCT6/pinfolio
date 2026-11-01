-- Aggregate community authenticity assessments for the shared catalog.
-- Returns counts only; it never exposes user IDs, ownership, notes, or photos.
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
         count(*)::bigint as report_count
  from public.collection_items ci
  join public.pins p on p.id = ci.pin_id
  where p.is_catalog = true
    and ci.authenticity_status is not null
    and ci.authenticity_status::text in ('verified_authentic', 'suspected_counterfeit', 'confirmed_counterfeit')
  group by ci.pin_id, ci.authenticity_status
  order by ci.pin_id, ci.authenticity_status;
$$;

revoke all on function public.get_catalog_authenticity_summary() from public;
grant execute on function public.get_catalog_authenticity_summary() to authenticated;
