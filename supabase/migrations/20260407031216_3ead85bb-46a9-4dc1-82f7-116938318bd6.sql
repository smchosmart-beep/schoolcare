ALTER TABLE visits ALTER COLUMN student_class TYPE TEXT USING student_class::TEXT;
ALTER TABLE waiting_queue ALTER COLUMN student_class TYPE TEXT USING student_class::TEXT;