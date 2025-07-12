ALTER TABLE "itemLogs" ALTER COLUMN "expectedReturnDate" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "itemLogs" ALTER COLUMN "expectedReturnDate" SET NOT NULL;