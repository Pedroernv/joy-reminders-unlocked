CREATE TABLE public.pdf_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text,
  file_url text NOT NULL,
  storage_path text,
  total_pages integer NOT NULL DEFAULT 0,
  last_page_read integer NOT NULL DEFAULT 1,
  bookmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdf_documents TO authenticated;
GRANT ALL ON public.pdf_documents TO service_role;
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pdfs" ON public.pdf_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.study_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_id uuid REFERENCES public.pdf_documents(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'reading' CHECK (type IN ('reading','homework')),
  title text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  start_page integer,
  target_page integer,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_schedules TO authenticated;
GRANT ALL ON public.study_schedules TO service_role;
ALTER TABLE public.study_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own schedules" ON public.study_schedules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pdf_documents_user ON public.pdf_documents(user_id, created_at DESC);
CREATE INDEX idx_study_schedules_user_time ON public.study_schedules(user_id, start_time);

CREATE TRIGGER update_pdf_documents_updated_at BEFORE UPDATE ON public.pdf_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_study_schedules_updated_at BEFORE UPDATE ON public.study_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();