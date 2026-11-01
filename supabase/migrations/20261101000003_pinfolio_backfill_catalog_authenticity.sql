-- Preserve existing authenticity choices when switching from per-user assessments
-- to one shared authenticity status on each catalog pin.
-- Prefer the catalog creator's saved collection status; otherwise use the most
-- recently updated non-unknown assessment from any owner's collection.

update public.pins p
set authenticity_status = chosen.authenticity_status
from lateral (
  select ci.authenticity_status::text as authenticity_status
  from public.collection_items ci
  where ci.pin_id = p.id
    and ci.authenticity_status is not null
    and ci.authenticity_status::text in (
      'verified_authentic', 'suspected_counterfeit', 'confirmed_counterfeit'
    )
  order by
    (ci.user_id = p.created_by) desc,
    ci.created_at desc nulls last
  limit 1
) as chosen
where p.authenticity_status = 'unknown';

-- For rows that did not have a saved collection assessment, keep 'unknown'.
