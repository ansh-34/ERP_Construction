ALTER TABLE "ProjectTaskImage"
ALTER COLUMN "description" TYPE TEXT
USING CASE
  WHEN "description" IS NULL THEN NULL
  WHEN jsonb_typeof("description"::jsonb) = 'string' THEN "description"::jsonb #>> '{}'
  WHEN jsonb_typeof("description"::jsonb) = 'object' AND ("description"::jsonb ? 'en') THEN "description"::jsonb #>> '{en}'
  ELSE "description"::text
END;
