-- enforce_slug_hold must read slug_holds, which browser roles cannot read (RLS on, no policy, no grant).
-- So it has to run with definer rights, like the other trigger functions that touch private tables.
create or replace function public.enforce_slug_hold()
returns trigger
language plpgsql security definer
set search_path = public, extensions
as $$
begin
  if tg_op = 'INSERT' or new.slug is distinct from old.slug then
    if exists (
      select 1 from public.slug_holds h
      where h.slug = new.slug and h.expires_at > now() and h.owner_id <> new.owner_id
    ) then
      raise exception 'slug_held' using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_slug_hold() from public, anon, authenticated;
