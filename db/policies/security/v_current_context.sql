ALTER VIEW security.v_current_context SET (security_invoker = true);

-- Views don’t use RLS directly, so we do NOT need policies here.
-- The WHERE clause already ties it to auth.uid().
-- (If Supabase complains about querying this view from the client,
-- you can instead expose a helper RPC function.)
