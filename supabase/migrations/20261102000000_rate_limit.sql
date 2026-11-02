create or replace function public.consume_rate_limit(
    p_bucket text,
    p_key text,
    p_limit integer,
    p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_window timestamptz;
    v_hits integer;
begin
    v_window := to_timestamp(
        floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
    );

    loop
        update public.rate_limits
           set hits = hits + 1
         where bucket = p_bucket
           and key = p_key
           and window_start = v_window
        returning hits into v_hits;

        exit when found;

        begin
            insert into public.rate_limits (bucket, key, window_start, hits)
            values (p_bucket, p_key, v_window, 1);
            v_hits := 1;
            exit;
        exception when unique_violation then
            null;
        end;
    end loop;

    if random() < 0.01 then
        delete from public.rate_limits where window_start < now() - interval '1 day';
    end if;

    return query
    select
        v_hits <= p_limit,
        greatest(p_limit - v_hits, 0),
        v_window + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
