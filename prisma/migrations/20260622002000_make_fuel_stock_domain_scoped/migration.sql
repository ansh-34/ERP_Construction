WITH grouped AS (
  SELECT
    (array_agg("id" ORDER BY "createdAt", "id"))[1] AS "keeperId",
    "fuelType",
    "uomId",
    "domainId",
    "isDeleted",
    SUM("availableQuantity") AS "availableQuantity",
    SUM("totalRefilledQuantity") AS "totalRefilledQuantity",
    SUM("totalConsumedQuantity") AS "totalConsumedQuantity"
  FROM "InventoryFuelStock"
  GROUP BY "fuelType", "uomId", "domainId", "isDeleted"
)
UPDATE "InventoryFuelStock" stock
SET
  "availableQuantity" = grouped."availableQuantity",
  "totalRefilledQuantity" = grouped."totalRefilledQuantity",
  "totalConsumedQuantity" = grouped."totalConsumedQuantity",
  "updatedAt" = NOW()
FROM grouped
WHERE stock."id" = grouped."keeperId";

WITH mapping AS (
  SELECT
    "id",
    FIRST_VALUE("id") OVER (
      PARTITION BY "fuelType", "uomId", "domainId", "isDeleted"
      ORDER BY "createdAt", "id"
    ) AS "keeperId"
  FROM "InventoryFuelStock"
)
UPDATE "FuelLog" log
SET "inventoryFuelStockId" = mapping."keeperId"
FROM mapping
WHERE log."inventoryFuelStockId" = mapping."id"
  AND mapping."id" <> mapping."keeperId";

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "fuelType", "uomId", "domainId", "isDeleted"
      ORDER BY "createdAt", "id"
    ) AS row_number
  FROM "InventoryFuelStock"
)
DELETE FROM "InventoryFuelStock" stock
USING ranked
WHERE stock."id" = ranked."id" AND ranked.row_number > 1;

ALTER TABLE "InventoryFuelStock"
DROP CONSTRAINT IF EXISTS "InventoryFuelStock_projectId_fkey";

DROP INDEX IF EXISTS "InventoryFuelStock_projectId_fuelType_uomId_domainId_isDeleted_key";
DROP INDEX IF EXISTS "InventoryFuelStock_createdAt_isDeleted_domainId_projectId_idx";

ALTER TABLE "InventoryFuelStock" DROP COLUMN "projectId";

CREATE UNIQUE INDEX "InventoryFuelStock_fuelType_uomId_domainId_isDeleted_key"
ON "InventoryFuelStock"("fuelType", "uomId", "domainId", "isDeleted");
