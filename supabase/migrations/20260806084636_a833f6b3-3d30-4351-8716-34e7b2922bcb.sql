CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color_theme text NOT NULL DEFAULT '#5B7FA6',
  cover_image_url text,
  local_fallback_key text NOT NULL DEFAULT 'default_subject',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX subjects_user_name_idx ON public.subjects (user_id, lower(name));

ALTER TABLE public.pdf_documents
  ADD COLUMN subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL;

ALTER TABLE public.study_schedules
  ADD COLUMN subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL;

CREATE INDEX pdf_documents_subject_id_idx ON public.pdf_documents (subject_id);
CREATE INDEX study_schedules_subject_id_idx ON public.study_schedules (subject_id);