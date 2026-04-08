
-- 1. Key function
CREATE OR REPLACE FUNCTION public.private_encryption_key()
RETURNS text LANGUAGE sql IMMUTABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT 'schoolcare_enc_key_2024_s3cur3!'::text; $$;

REVOKE ALL ON FUNCTION public.private_encryption_key() FROM public;
REVOKE ALL ON FUNCTION public.private_encryption_key() FROM anon;
REVOKE ALL ON FUNCTION public.private_encryption_key() FROM authenticated;

-- 2. Encrypt existing data
UPDATE visits
SET student_name = extensions.armor(extensions.pgp_sym_encrypt(student_name, 'schoolcare_enc_key_2024_s3cur3!'))
WHERE student_name NOT LIKE '-----BEGIN PGP MESSAGE-----%';

UPDATE waiting_queue
SET student_name = extensions.armor(extensions.pgp_sym_encrypt(student_name, 'schoolcare_enc_key_2024_s3cur3!'))
WHERE student_name NOT LIKE '-----BEGIN PGP MESSAGE-----%';

-- 3. Trigger function
CREATE OR REPLACE FUNCTION public.encrypt_student_name()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.student_name IS NOT NULL AND NEW.student_name NOT LIKE '-----BEGIN PGP MESSAGE-----%' THEN
    NEW.student_name := extensions.armor(extensions.pgp_sym_encrypt(NEW.student_name, public.private_encryption_key()));
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Triggers
DROP TRIGGER IF EXISTS encrypt_student_name_on_insert ON visits;
DROP TRIGGER IF EXISTS encrypt_student_name_on_update ON visits;
CREATE TRIGGER encrypt_student_name_on_insert BEFORE INSERT ON visits FOR EACH ROW EXECUTE FUNCTION public.encrypt_student_name();
CREATE TRIGGER encrypt_student_name_on_update BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION public.encrypt_student_name();

DROP TRIGGER IF EXISTS encrypt_student_name_on_insert ON waiting_queue;
DROP TRIGGER IF EXISTS encrypt_student_name_on_update ON waiting_queue;
CREATE TRIGGER encrypt_student_name_on_insert BEFORE INSERT ON waiting_queue FOR EACH ROW EXECUTE FUNCTION public.encrypt_student_name();
CREATE TRIGGER encrypt_student_name_on_update BEFORE UPDATE ON waiting_queue FOR EACH ROW EXECUTE FUNCTION public.encrypt_student_name();

-- 5. RPC: decrypted visits
CREATE OR REPLACE FUNCTION public.get_visits_decrypted(p_teacher_id uuid, p_start_date timestamptz DEFAULT NULL, p_end_date timestamptz DEFAULT NULL)
RETURNS TABLE(
  id uuid, teacher_id uuid, student_grade integer, student_class text, student_number integer,
  student_name text, visit_type text, health_issue text, treatment text, medication text,
  self_treatment_item text, status text, temperature text, visited_at timestamptz, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT v.id, v.teacher_id, v.student_grade, v.student_class, v.student_number,
    extensions.pgp_sym_decrypt(extensions.dearmor(v.student_name), public.private_encryption_key())::text as student_name,
    v.visit_type, v.health_issue, v.treatment, v.medication,
    v.self_treatment_item, v.status, v.temperature, v.visited_at, v.created_at, v.updated_at
  FROM visits v
  WHERE v.teacher_id = p_teacher_id
    AND (p_start_date IS NULL OR v.visited_at >= p_start_date)
    AND (p_end_date IS NULL OR v.visited_at < p_end_date)
  ORDER BY v.visited_at DESC;
$$;

-- 6. RPC: decrypted queue
CREATE OR REPLACE FUNCTION public.get_queue_decrypted(p_teacher_id uuid)
RETURNS TABLE(
  id uuid, teacher_id uuid, student_grade integer, student_class text,
  student_number integer, student_name text, created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT q.id, q.teacher_id, q.student_grade, q.student_class, q.student_number,
    extensions.pgp_sym_decrypt(extensions.dearmor(q.student_name), public.private_encryption_key())::text as student_name,
    q.created_at
  FROM waiting_queue q
  WHERE q.teacher_id = p_teacher_id
  ORDER BY q.created_at ASC;
$$;
