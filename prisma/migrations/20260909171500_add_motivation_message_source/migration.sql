-- Sync motivation_message with the schema the seed expects.
ALTER TABLE "motivation_message" ADD COLUMN IF NOT EXISTS "source" TEXT;

ALTER TABLE "motivation_message" ALTER COLUMN "lead" SET NOT NULL;
ALTER TABLE "motivation_message" ALTER COLUMN "accent" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "motivation_message_lead_accent_key" ON "motivation_message"("lead", "accent");
