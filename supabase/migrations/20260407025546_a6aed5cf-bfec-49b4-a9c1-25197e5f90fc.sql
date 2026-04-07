
-- Create visits table for health journal records
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  student_grade INT NOT NULL,
  student_class INT NOT NULL,
  student_number INT NOT NULL,
  student_name TEXT NOT NULL,
  visit_type TEXT NOT NULL DEFAULT 'self_treatment',
  health_issue TEXT,
  treatment TEXT,
  medication TEXT,
  self_treatment_item TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own visits" ON public.visits FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Anyone can insert visits" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can update their own visits" ON public.visits FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own visits" ON public.visits FOR DELETE USING (auth.uid() = teacher_id);

-- Create self_treatment_options table
CREATE TABLE public.self_treatment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💊',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.self_treatment_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view self_treatment_options" ON public.self_treatment_options FOR SELECT USING (true);
CREATE POLICY "Teachers can insert their options" ON public.self_treatment_options FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their options" ON public.self_treatment_options FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their options" ON public.self_treatment_options FOR DELETE USING (auth.uid() = teacher_id);

-- Create waiting_queue table
CREATE TABLE public.waiting_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  student_grade INT NOT NULL,
  student_class INT NOT NULL,
  student_number INT NOT NULL,
  student_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waiting_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view waiting_queue" ON public.waiting_queue FOR SELECT USING (true);
CREATE POLICY "Anyone can insert to waiting_queue" ON public.waiting_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can delete from waiting_queue" ON public.waiting_queue FOR DELETE USING (auth.uid() = teacher_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_queue;

-- Timestamp update function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
