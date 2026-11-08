-- Triggers and functions (handover 6.3).
-- Rules used everywhere here:
--  * every "security definer" function sets search_path explicitly;
--  * execute is revoked from PUBLIC, anon and authenticated, then granted only where needed;
--  * public quiz reads/writes (start_response, finish_response, track_open, rate_limit_hit) are
--    called by server code with the service role, so they are NOT granted to anon/authenticated.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

-- ---------------------------------------------------------------------------
-- Plan limits: the ONE place for the default numbers on the database side.
-- NOTE: the same numbers (5 quizzes / 15 pages / 500 finished responses) exist in
-- src/lib/plan/limits.ts (written in another phase). A test must compare them.
-- A "custom" plan with an empty limit falls back to the free defaults.
-- ---------------------------------------------------------------------------
create function private.plan_limits(p_profile_id uuid)
returns table (max_quizzes int, max_pages int, max_responses int)
language sql stable security definer
set search_path = ''
as $$
  select coalesce(p.max_quizzes, 5), coalesce(p.max_pages, 15), coalesce(p.max_responses, 500)
  from public.profiles p
  where p.id = p_profile_id
$$;
revoke all on function private.plan_limits(uuid) from public, anon, authenticated;
grant execute on function private.plan_limits(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- New person -> profile row
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    left(coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      ''
    ), 100)
  );
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- quizzes.updated_at ("Edited 2 days ago"). A change of only finished_count is not an edit.
-- ---------------------------------------------------------------------------
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.finished_count is distinct from old.finished_count
     and (to_jsonb(new) - 'finished_count' - 'updated_at') = (to_jsonb(old) - 'finished_count' - 'updated_at') then
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end;
$$;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

create trigger quizzes_touch_updated_at
  before update on public.quizzes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- quizzes.finished_count kept in step with responses
-- ---------------------------------------------------------------------------
create function public.bump_finished_count()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'finished' then
      update public.quizzes set finished_count = finished_count + 1 where id = new.quiz_id;
    end if;
  elsif tg_op = 'UPDATE' then
    if old.status <> 'finished' and new.status = 'finished' then
      update public.quizzes set finished_count = finished_count + 1 where id = new.quiz_id;
    elsif old.status = 'finished' and new.status <> 'finished' then
      update public.quizzes set finished_count = greatest(finished_count - 1, 0) where id = new.quiz_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'finished' then
      update public.quizzes set finished_count = greatest(finished_count - 1, 0) where id = old.quiz_id;
    end if;
  end if;
  return null;
end;
$$;
revoke all on function public.bump_finished_count() from public, anon, authenticated;

create trigger responses_bump_finished_count
  after insert or update of status or delete on public.responses
  for each row execute function public.bump_finished_count();

-- ---------------------------------------------------------------------------
-- A normal person may change only profiles.name. (Invoker rights on purpose: current_user is
-- then the role of the caller. The service role and the database owner are not restricted.)
-- ---------------------------------------------------------------------------
create function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if (to_jsonb(new) - 'name') is distinct from (to_jsonb(old) - 'name') then
      raise exception 'profile_columns_protected' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.protect_profile_columns() from public, anon, authenticated;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------------------------------------------------------------------------
-- Quiz limit per person (last line of defence behind the server action)
-- ---------------------------------------------------------------------------
create function public.enforce_quiz_limit()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_max   int;
  v_count int;
begin
  -- one insert at a time per owner, so two parallel inserts cannot both take the last slot
  perform pg_advisory_xact_lock(hashtextextended('quiz_limit:' || new.owner_id::text, 0));
  select l.max_quizzes into v_max from private.plan_limits(new.owner_id) l;
  select count(*) into v_count from public.quizzes where owner_id = new.owner_id;
  if v_count >= coalesce(v_max, 5) then
    raise exception 'quiz_limit_reached' using errcode = 'P0001', detail = 'limit=' || coalesce(v_max, 5);
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_quiz_limit() from public, anon, authenticated;

create trigger quizzes_enforce_limit
  before insert on public.quizzes
  for each row execute function public.enforce_quiz_limit();

-- ---------------------------------------------------------------------------
-- Slug holds (handover 6.9, decision D3 = 30 days)
--  * a held slug cannot be taken by another owner (error 23505, like a taken slug);
--  * deleting a quiz, or changing its slug, holds the old slug for its owner;
--  * the owner taking the slug back removes the hold.
-- ---------------------------------------------------------------------------
create function public.enforce_slug_hold()
returns trigger
language plpgsql
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

create trigger quizzes_enforce_slug_hold
  before insert or update of slug on public.quizzes
  for each row execute function public.enforce_slug_hold();

create function public.manage_slug_holds()
returns trigger
language plpgsql security definer
set search_path = public, extensions
as $$
begin
  if tg_op = 'DELETE' then
    -- when the whole account is being deleted the profile is already gone: no hold then
    if exists (select 1 from public.profiles p where p.id = old.owner_id) then
      insert into public.slug_holds (slug, owner_id, expires_at)
      values (old.slug, old.owner_id, now() + interval '30 days')
      on conflict (slug) do update set owner_id = excluded.owner_id, expires_at = excluded.expires_at;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.slug is distinct from old.slug then
      insert into public.slug_holds (slug, owner_id, expires_at)
      values (old.slug, old.owner_id, now() + interval '30 days')
      on conflict (slug) do update set owner_id = excluded.owner_id, expires_at = excluded.expires_at;
      delete from public.slug_holds where slug = new.slug and owner_id = new.owner_id;
    end if;
  else
    delete from public.slug_holds where slug = new.slug and owner_id = new.owner_id;
  end if;
  return null;
end;
$$;
revoke all on function public.manage_slug_holds() from public, anon, authenticated;

create trigger quizzes_manage_slug_holds
  after insert or update of slug or delete on public.quizzes
  for each row execute function public.manage_slug_holds();

-- ---------------------------------------------------------------------------
-- RPC save_draft(quiz_id, base_version, doc)  -- called by the logged-in person
-- Returns jsonb: {status: ok|conflict|not_found|invalid|too_large|too_many_pages|unauthorized, ...}
-- ---------------------------------------------------------------------------
create function public.save_draft(p_quiz_id uuid, p_base_version int, p_doc jsonb)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_owner     uuid;
  v_max_pages int;
  v_name      text;
  v_new       int;
  v_current   int;
begin
  if v_uid is null then
    return jsonb_build_object('status', 'unauthorized');
  end if;

  select q.owner_id into v_owner from public.quizzes q where q.id = p_quiz_id;
  if v_owner is null or v_owner <> v_uid then
    return jsonb_build_object('status', 'not_found');
  end if;

  if p_doc is null or jsonb_typeof(p_doc) <> 'object' or coalesce(jsonb_typeof(p_doc -> 'pages'), '') <> 'array' then
    return jsonb_build_object('status', 'invalid');
  end if;
  if octet_length(p_doc::text) > 1048576 then
    return jsonb_build_object('status', 'too_large');
  end if;

  select l.max_pages into v_max_pages from private.plan_limits(v_owner) l;
  if jsonb_array_length(p_doc -> 'pages') > coalesce(v_max_pages, 15) then
    return jsonb_build_object('status', 'too_many_pages', 'limit', coalesce(v_max_pages, 15));
  end if;

  v_name := left(btrim(coalesce(p_doc ->> 'name', '')), 100);

  update public.quizzes
     set draft = p_doc,
         draft_version = draft_version + 1,
         name = coalesce(nullif(v_name, ''), name)
   where id = p_quiz_id and owner_id = v_uid and draft_version = p_base_version
  returning draft_version into v_new;

  if v_new is null then
    select q.draft_version into v_current from public.quizzes q where q.id = p_quiz_id;
    return jsonb_build_object('status', 'conflict', 'current_version', v_current);
  end if;
  return jsonb_build_object('status', 'ok', 'version', v_new);
end;
$$;
revoke all on function public.save_draft(uuid, int, jsonb) from public, anon, authenticated;
grant execute on function public.save_draft(uuid, int, jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RPC publish_quiz(quiz_id, base_version): copy draft -> published.
-- (The strict validation runs in the server action first; this re-checks the page count.)
-- ---------------------------------------------------------------------------
create function public.publish_quiz(p_quiz_id uuid, p_base_version int)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_owner     uuid;
  v_draft     jsonb;
  v_max_pages int;
  v_ver       int;
  v_current   int;
begin
  if v_uid is null then
    return jsonb_build_object('status', 'unauthorized');
  end if;

  select q.owner_id, q.draft into v_owner, v_draft from public.quizzes q where q.id = p_quiz_id;
  if v_owner is null or v_owner <> v_uid then
    return jsonb_build_object('status', 'not_found');
  end if;

  select l.max_pages into v_max_pages from private.plan_limits(v_owner) l;
  if coalesce(jsonb_typeof(v_draft -> 'pages'), '') <> 'array' then
    return jsonb_build_object('status', 'invalid');
  end if;
  if jsonb_array_length(v_draft -> 'pages') > coalesce(v_max_pages, 15) then
    return jsonb_build_object('status', 'too_many_pages', 'limit', coalesce(v_max_pages, 15));
  end if;

  update public.quizzes
     set published = draft,
         published_version = draft_version,
         published_at = now()
   where id = p_quiz_id and owner_id = v_uid and draft_version = p_base_version
  returning published_version into v_ver;

  if v_ver is null then
    select q.draft_version into v_current from public.quizzes q where q.id = p_quiz_id;
    return jsonb_build_object('status', 'conflict', 'current_version', v_current);
  end if;
  return jsonb_build_object('status', 'ok', 'version', v_ver);
end;
$$;
revoke all on function public.publish_quiz(uuid, int) from public, anon, authenticated;
grant execute on function public.publish_quiz(uuid, int) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RPC slug_available(slug, quiz_id)  -- logged-in people; a convenience only,
-- the real guarantee is the unique index.
-- NOTE: the reserved list and the format rule are also in src/lib/slug.ts (decision D12).
-- ---------------------------------------------------------------------------
create function public.slug_available(p_slug text, p_quiz_id uuid default null)
returns jsonb
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('available', false, 'reason', 'unauthorized');
  end if;
  if p_slug is null or char_length(p_slug) not between 3 and 60 or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    return jsonb_build_object('available', false, 'reason', 'invalid');
  end if;
  if p_slug = any (array['new','edit','preview','admin','api','www','app','quiz','login','register']) then
    return jsonb_build_object('available', false, 'reason', 'reserved');
  end if;
  if exists (
    select 1 from public.quizzes q
    where q.slug = p_slug::citext and (p_quiz_id is null or q.id <> p_quiz_id)
  ) then
    return jsonb_build_object('available', false, 'reason', 'taken');
  end if;
  if exists (
    select 1 from public.slug_holds h
    where h.slug = p_slug::citext and h.expires_at > now() and h.owner_id <> v_uid
  ) then
    return jsonb_build_object('available', false, 'reason', 'held');
  end if;
  return jsonb_build_object('available', true);
end;
$$;
revoke all on function public.slug_available(text, uuid) from public, anon, authenticated;
grant execute on function public.slug_available(text, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Public quiz RPCs: SERVER CODE ONLY (service role)
-- ---------------------------------------------------------------------------

-- start_response: creates a response if the quiz can take answers.
create function public.start_response(p_slug text, p_token_hash text)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_quiz       public.quizzes%rowtype;
  v_status     public.account_status_t;
  v_max        int;
  v_response   uuid;
begin
  if p_token_hash is null or char_length(p_token_hash) < 32 then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into v_quiz from public.quizzes q where q.slug = p_slug::citext;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if v_quiz.published is null then
    return jsonb_build_object('status', 'not_published');
  end if;
  select p.status into v_status from public.profiles p where p.id = v_quiz.owner_id;
  if v_status is distinct from 'active' then
    return jsonb_build_object('status', 'owner_suspended');
  end if;
  if not v_quiz.accepting_responses then
    return jsonb_build_object('status', 'closed');
  end if;
  select l.max_responses into v_max from private.plan_limits(v_quiz.owner_id) l;
  if v_quiz.finished_count >= coalesce(v_max, 500) then
    return jsonb_build_object('status', 'full');
  end if;

  insert into public.responses (quiz_id, quiz_version, token_hash)
  values (v_quiz.id, v_quiz.published_version, p_token_hash)
  returning id into v_response;

  return jsonb_build_object('status', 'open', 'response_id', v_response, 'quiz_version', v_quiz.published_version);
end;
$$;
revoke all on function public.start_response(text, text) from public, anon, authenticated;
grant execute on function public.start_response(text, text) to service_role;

-- finish_response: marks a response finished. The quiz row is locked first, so two people
-- finishing at the same moment cannot both take the last slot.
create function public.finish_response(p_response_id uuid, p_token_hash text)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_quiz_id  uuid;
  v_quiz     public.quizzes%rowtype;
  v_resp     public.responses%rowtype;
  v_status   public.account_status_t;
  v_max      int;
begin
  select r.quiz_id into v_quiz_id from public.responses r where r.id = p_response_id;
  if v_quiz_id is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  select * into v_quiz from public.quizzes q where q.id = v_quiz_id for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  select * into v_resp from public.responses r where r.id = p_response_id for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if v_resp.token_hash <> p_token_hash then
    return jsonb_build_object('status', 'bad_token');
  end if;
  if v_resp.status = 'finished' then
    return jsonb_build_object('status', 'already_finished');
  end if;

  if v_quiz.published is null then
    return jsonb_build_object('status', 'not_published');
  end if;
  select p.status into v_status from public.profiles p where p.id = v_quiz.owner_id;
  if v_status is distinct from 'active' then
    return jsonb_build_object('status', 'owner_suspended');
  end if;
  if not v_quiz.accepting_responses then
    return jsonb_build_object('status', 'closed');
  end if;
  select l.max_responses into v_max from private.plan_limits(v_quiz.owner_id) l;
  if v_quiz.finished_count >= coalesce(v_max, 500) then
    return jsonb_build_object('status', 'full');
  end if;

  update public.responses
     set status = 'finished', finished_at = now(), updated_at = now()
   where id = p_response_id;
  return jsonb_build_object('status', 'finished');
end;
$$;
revoke all on function public.finish_response(uuid, text) from public, anon, authenticated;
grant execute on function public.finish_response(uuid, text) to service_role;

-- track_open: "People who opened it" counter (published quizzes only)
create function public.track_open(p_quiz_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.quiz_daily_stats (quiz_id, day, opened)
  select q.id, (now() at time zone 'utc')::date, 1
  from public.quizzes q
  where q.id = p_quiz_id and q.published is not null
  on conflict (quiz_id, day) do update set opened = public.quiz_daily_stats.opened + 1;
end;
$$;
revoke all on function public.track_open(uuid) from public, anon, authenticated;
grant execute on function public.track_open(uuid) to service_role;

-- rate_limit_hit: fixed-window counter. Returns true when the caller is still allowed.
create function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits   int;
begin
  if p_key is null or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;
