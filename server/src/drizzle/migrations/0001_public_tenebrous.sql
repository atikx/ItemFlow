ALTER TABLE "departments" ALTER COLUMN "organisationId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "organisationId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "itemLogs" ALTER COLUMN "itemId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "itemLogs" ALTER COLUMN "eventId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "itemLogs" ALTER COLUMN "issuedBy" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "itemLogs" ALTER COLUMN "organisationId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "itemLogs" ALTER COLUMN "departmentId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "organisationId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "organisationId" SET NOT NULL;