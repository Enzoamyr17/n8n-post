-- Step 1: Add the new publishDateTime column (nullable initially)
ALTER TABLE "Post" ADD COLUMN "publishDateTime" TIMESTAMP(3);

-- Step 2: Migrate existing data by combining publishDate and publishTime
-- Combine the date from publishDate and time from publishTime into publishDateTime
UPDATE "Post"
SET "publishDateTime" = ("publishDate"::DATE + "publishTime"::TIME)::TIMESTAMP;

-- Step 3: Make publishDateTime NOT NULL since all rows now have values
ALTER TABLE "Post" ALTER COLUMN "publishDateTime" SET NOT NULL;

-- Step 4: Drop the old publishDate and publishTime columns
ALTER TABLE "Post" DROP COLUMN "publishDate";
ALTER TABLE "Post" DROP COLUMN "publishTime";

-- Step 5: Drop old index and create new one
DROP INDEX IF EXISTS "Post_publishDate_isPublished_idx";
CREATE INDEX "Post_publishDateTime_isPublished_idx" ON "Post"("publishDateTime", "isPublished");
