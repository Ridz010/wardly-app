create or replace function public.consume_daily_quota(p_key text, p_limit integer)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_start timestamptz;
    v_hits integer;
begin
    v_start := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';

    loop
        update public.rate_limits
           set hits = hits + 1
         where bucket = 'scan-daily'
           and key = p_key
           and window_start = v_start
        returning hits into v_hits;

        exit when found;

        begin
            insert into public.rate_limits (bucket, key, window_start, hits)
            values ('scan-daily', p_key, v_start, 1);
            v_hits := 1;
            exit;
        exception when unique_violation then
            null;
        end;
    end loop;

    return query
    select v_hits <= p_limit, greatest(p_limit - v_hits, 0), v_start + interval '1 day';
end;
$$;

create or replace function public.peek_daily_quota(p_key text, p_limit integer)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_start timestamptz;
    v_hits integer;
begin
    v_start := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta';

    select hits into v_hits
      from public.rate_limits
     where bucket = 'scan-daily' and key = p_key and window_start = v_start;

    v_hits := coalesce(v_hits, 0);

    return query
    select v_hits < p_limit, greatest(p_limit - v_hits, 0), v_start + interval '1 day';
end;
$$;

revoke all on function public.consume_daily_quota(text, integer) from public, anon, authenticated;
revoke all on function public.peek_daily_quota(text, integer) from public, anon, authenticated;
grant execute on function public.consume_daily_quota(text, integer) to service_role;
grant execute on function public.peek_daily_quota(text, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'content-images',
    'content-images',
    true,
    4194304,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;
