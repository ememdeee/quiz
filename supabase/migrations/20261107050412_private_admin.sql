-- Admin helpers (handover 6.3). They live ONLY in the "private" schema, which is not exposed
-- through the API (config.toml [api] schemas = ["public"]) and is not usable by anon/authenticated.
-- They return counts and profile data, NEVER response content.
-- Only the service role may execute them. (How server code reaches a non-exposed schema, for
-- example a direct database connection or thin wrappers, is decided in Phase 11.)

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create function private.admin_overview()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'users_total',         (select count(*) from public.profiles),
    'users_suspended',     (select count(*) from public.profiles where status = 'suspended'),
    'users_new_7d',        (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'quizzes_total',       (select count(*) from public.quizzes),
    'quizzes_published',   (select count(*) from public.quizzes where published is not null),
    -- decision D19: only finished responses are counted
    'responses_finished',  (select coalesce(sum(finished_count), 0) from public.quizzes)
  )
$$;
revoke all on function private.admin_overview() from public, anon, authenticated;
grant execute on function private.admin_overview() to service_role;

create function private.admin_users_page(p_search text default null, p_limit int default 25, p_offset int default 0)
returns table (
  id uuid, email text, name text, role public.role_t, plan public.plan_t, status public.account_status_t,
  created_at timestamptz, last_sign_in_at timestamptz, quiz_count bigint, finished_responses bigint
)
language sql stable security definer
set search_path = ''
as $$
  select p.id, u.email::text, p.name, p.role, p.plan, p.status, p.created_at, u.last_sign_in_at,
         (select count(*) from public.quizzes q where q.owner_id = p.id),
         (select coalesce(sum(q.finished_count), 0)::bigint from public.quizzes q where q.owner_id = p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  where p_search is null or p_search = ''
     or strpos(lower(coalesce(u.email, '')), lower(p_search)) > 0
     or strpos(lower(p.name), lower(p_search)) > 0
  order by p.created_at desc
  limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0)
$$;
revoke all on function private.admin_users_page(text, int, int) from public, anon, authenticated;
grant execute on function private.admin_users_page(text, int, int) to service_role;

create function private.admin_user_detail(p_user_id uuid)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id, 'email', u.email, 'name', p.name, 'role', p.role, 'plan', p.plan, 'status', p.status,
    'suspended_at', p.suspended_at, 'max_quizzes', p.max_quizzes, 'max_pages', p.max_pages,
    'max_responses', p.max_responses, 'brand_unlocked', p.brand_unlocked,
    'can_hide_powered_by', p.can_hide_powered_by, 'custom_domain', p.custom_domain,
    'admin_notes', p.admin_notes, 'created_at', p.created_at, 'last_sign_in_at', u.last_sign_in_at,
    'quiz_count', (select count(*) from public.quizzes q where q.owner_id = p.id),
    'finished_responses', (select coalesce(sum(q.finished_count), 0) from public.quizzes q where q.owner_id = p.id)
  )
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = p_user_id
$$;
revoke all on function private.admin_user_detail(uuid) from public, anon, authenticated;
grant execute on function private.admin_user_detail(uuid) to service_role;
