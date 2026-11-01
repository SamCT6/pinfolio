-- Pinfolio Friends page: allow participants to see profile details for a pending
-- request, and allow authenticated users to read only explicitly shared inventory.

DROP POLICY IF EXISTS "Profiles visible to friend request participants" ON public.profiles;
CREATE POLICY "Profiles visible to friend request participants"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friend_requests fr
    WHERE (fr.sender_id = auth.uid() AND fr.receiver_id = profiles.id)
       OR (fr.receiver_id = auth.uid() AND fr.sender_id = profiles.id)
  )
);

DROP POLICY IF EXISTS "Users read public and friends shared collection items" ON public.collection_items;
CREATE POLICY "Users read public and friends shared collection items"
ON public.collection_items FOR SELECT TO authenticated
USING (
  visibility = 'public'
  OR (visibility = 'friends' AND EXISTS (
    SELECT 1 FROM public.friend_requests fr
    WHERE fr.status = 'accepted'
      AND ((fr.sender_id = auth.uid() AND fr.receiver_id = collection_items.user_id)
        OR (fr.receiver_id = auth.uid() AND fr.sender_id = collection_items.user_id))
  ))
);
