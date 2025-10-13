-- Normalize BrandProfile column names to Prisma's PascalCase with quotes
-- Fixes NOT NULL violations on legacy lowercase columns (e.g., brandname)

DO $$
DECLARE
  rec RECORD;
BEGIN
  -- For each pair (legacy_lower, target_camel)
  FOR rec IN (
    SELECT * FROM (
      VALUES
        ('brandname', 'brandName'),
        ('branddescription', 'brandDescription'),
        ('brandvoicedescription', 'brandVoiceDescription'),
        ('primarygoal', 'primaryGoal'),
        ('dorules', 'doRules'),
        ('dontrules', 'dontRules')
    ) AS t(lower_name, camel_name)
  ) LOOP
    -- Case 1: lower exists and camel does not -> rename
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='BrandProfile' AND column_name=rec.lower_name
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='BrandProfile' AND column_name=rec.camel_name
    ) THEN
      EXECUTE format('ALTER TABLE "BrandProfile" RENAME COLUMN %I TO "%s"', rec.lower_name, rec.camel_name);
    END IF;

    -- Case 2: both exist -> backfill camel from lower where camel is null, then drop lower
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='BrandProfile' AND column_name=rec.lower_name
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='BrandProfile' AND column_name=rec.camel_name
    ) THEN
      EXECUTE format('UPDATE "BrandProfile" SET "%s" = "%s" WHERE "%s" IS NULL', rec.camel_name, rec.lower_name, rec.camel_name);
      -- Drop constraints on the lower column if any (best-effort)
      BEGIN
        EXECUTE format('ALTER TABLE "BrandProfile" DROP CONSTRAINT IF EXISTS %I', 'BrandProfile_'||rec.lower_name||'_key');
        EXECUTE format('ALTER TABLE "BrandProfile" DROP CONSTRAINT IF EXISTS %I', 'BrandProfile_'||rec.lower_name||'_fkey');
      EXCEPTION WHEN others THEN NULL; END;
      EXECUTE format('ALTER TABLE "BrandProfile" DROP COLUMN IF EXISTS %I', rec.lower_name);
    END IF;
  END LOOP;

  -- Ensure NOT NULL on required fields
  BEGIN EXECUTE 'ALTER TABLE "BrandProfile" ALTER COLUMN "brandName" SET NOT NULL'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE "BrandProfile" ALTER COLUMN "industry" SET NOT NULL'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE "BrandProfile" ALTER COLUMN "brandDescription" SET NOT NULL'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE "BrandProfile" ALTER COLUMN "brandVoiceDescription" SET NOT NULL'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE "BrandProfile" ALTER COLUMN "primaryGoal" SET NOT NULL'; EXCEPTION WHEN others THEN NULL; END;
END $$;
