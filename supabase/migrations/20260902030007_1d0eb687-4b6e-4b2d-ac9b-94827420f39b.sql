create or replace function public.get_student_visits_decrypted(
  p_teacher_id uuid,
  p_grade integer,
  p_class text,
  p_number integer,
  p_limit integer default 50
)
returns table(
  id uuid,
  teacher_id uuid,
  student_grade integer,
  student_class text,
  student_number integer,
  student_name text,
  visit_type text,
  health_issue text,
  treatment text,
  medication text,
  self_treatment_item text,
  status text,
  temperature text,
  visited_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select v.id, v.teacher_id, v.student_grade, v.student_class, v.student_number,
    extensions.pgp_sym_decrypt(extensions.dearmor(v.student_name), public.private_encryption_key())::text as student_name,
    v.visit_type, v.health_issue, v.treatment, v.medication,
    v.self_treatment_item, v.status, v.temperature, v.visited_at, v.created_at, v.updated_at
  from visits v
  where v.teacher_id = p_teacher_id
    and v.teacher_id = auth.uid()
    and v.student_grade = p_grade
    and v.student_class = p_class
    and v.student_number = p_number
  order by v.visited_at desc
  limit p_limit;
$$;

revoke execute on function public.get_student_visits_decrypted(uuid, integer, text, integer, integer) from public, anon;
grant execute on function public.get_student_visits_decrypted(uuid, integer, text, integer, integer) to authenticated;