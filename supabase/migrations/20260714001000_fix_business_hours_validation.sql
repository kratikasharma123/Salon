-- Allow closed days during business-hours validation while still validating open days.

create or replace function public.is_valid_business_hours(p_business_hours jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select p_business_hours is not null
    and jsonb_typeof(p_business_hours) = 'object'
    and (
      select bool_and(
        p_business_hours ? day_key
        and jsonb_typeof(p_business_hours->day_key) = 'object'
        and jsonb_typeof(p_business_hours->day_key->'isOpen') = 'boolean'
        and (
          (p_business_hours->day_key->>'isOpen')::boolean = false
          or (
            jsonb_typeof(p_business_hours->day_key->'open') = 'string'
            and jsonb_typeof(p_business_hours->day_key->'close') = 'string'
            and (p_business_hours->day_key->>'open') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
            and (p_business_hours->day_key->>'close') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
            and (p_business_hours->day_key->>'close') > (p_business_hours->day_key->>'open')
          )
        )
      )
      from unnest(array['monday','tuesday','wednesday','thursday','friday','saturday','sunday']) as day_key
    );
$$;
