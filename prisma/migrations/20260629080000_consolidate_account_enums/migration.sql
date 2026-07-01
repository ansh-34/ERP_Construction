-- Consolidate duplicate enums: AccountCategoryTypeEnum → AccountCategoryType, NormalBalanceEnum → NormalBalance
-- This migration is DATA-SAFE: it uses ALTER COLUMN … TYPE … USING to cast existing values.

-- 1. Create the canonical enum types (these include EQUITY which the old type lacked).
CREATE TYPE "AccountCategoryType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE "NormalBalance" AS ENUM ('DEBIT', 'CREDIT');

-- 2. Alter columns on AccountCategory to use the new types, casting existing data.
ALTER TABLE "AccountCategory"
  ALTER COLUMN "categoryType" TYPE "AccountCategoryType" USING ("categoryType"::text::"AccountCategoryType"),
  ALTER COLUMN "normalBalance" TYPE "NormalBalance" USING ("normalBalance"::text::"NormalBalance");

-- 3. Drop the now-unused duplicate enum types.
DROP TYPE "AccountCategoryTypeEnum";
DROP TYPE "NormalBalanceEnum";
