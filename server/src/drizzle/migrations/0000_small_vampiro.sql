CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"organisationId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"organisationId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "itemLogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itemId" uuid NOT NULL,
	"eventId" uuid NOT NULL,
	"issuedBy" uuid NOT NULL,
	"quantityIssued" integer NOT NULL,
	"expectedReturnDate" timestamp with time zone NOT NULL,
	"returnedAt" timestamp with time zone,
	"organisationId" uuid NOT NULL,
	"departmentId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"quantityTotal" integer NOT NULL,
	"quantityAvailable" integer NOT NULL,
	"organisationId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"batch" integer NOT NULL,
	"organisationId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"passwordHash" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "organisations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_itemId_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_issuedBy_members_id_fk" FOREIGN KEY ("issuedBy") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemLogs" ADD CONSTRAINT "itemLogs_departmentId_departments_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;