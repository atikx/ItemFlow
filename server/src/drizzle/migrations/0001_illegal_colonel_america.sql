CREATE TABLE "inductionQualities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"weightage" real NOT NULL,
	"organisationId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inductionQualities" ADD CONSTRAINT "inductionQualities_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;