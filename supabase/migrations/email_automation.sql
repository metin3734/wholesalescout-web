-- WholesaleScout — Email Automation Tables
-- Supabase Dashboard > SQL Editor'da çalıştır

-- Email şablonları
CREATE TABLE IF NOT EXISTS email_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE,
  name        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body_html   TEXT,
  body_text   TEXT,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_templates" ON email_templates
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Email kuyruğu
CREATE TABLE IF NOT EXISTS email_queue (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users ON DELETE CASCADE,
  brand_id       UUID REFERENCES brands(id) ON DELETE SET NULL,
  template_id    UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  to_email       TEXT NOT NULL,
  to_name        TEXT,
  brand_name     TEXT,
  subject        TEXT NOT NULL,
  body_html      TEXT,
  body_text      TEXT,
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','sent','failed','cancelled')),
  scheduled_at   TIMESTAMPTZ DEFAULT now(),
  sent_at        TIMESTAMPTZ,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_queue" ON email_queue
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- İndeksler
CREATE INDEX IF NOT EXISTS email_queue_status_idx    ON email_queue (status, scheduled_at);
CREATE INDEX IF NOT EXISTS email_queue_user_idx      ON email_queue (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS email_queue_sent_at_idx   ON email_queue (sent_at) WHERE status = 'sent';

-- Varsayılan şablon trigger
CREATE OR REPLACE FUNCTION ensure_single_default_template()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE email_templates
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS single_default_template ON email_templates;
CREATE TRIGGER single_default_template
  AFTER INSERT OR UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_template();
