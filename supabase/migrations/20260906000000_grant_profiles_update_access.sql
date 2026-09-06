-- Keep RLS as the row-level authorization boundary while ensuring the
-- authenticated Data API role has the table privileges required by UPDATE.
grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;
