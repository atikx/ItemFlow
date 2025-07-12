ALTER TABLE "itemLogs" DROP CONSTRAINT "itemLogs_eventId_events_id_fk";
--> statement-breakpoint
ALTER TABLE "itemLogs" DROP CONSTRAINT "itemLogs_issuedBy_members_id_fk";
--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_issuedBy_members_id_fk" FOREIGN KEY ("issuedBy") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;