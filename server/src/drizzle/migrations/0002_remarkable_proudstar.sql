CREATE TABLE "inductionContestants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"finalScore" real,
	"organisationId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inductionEvaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contestantId" uuid NOT NULL,
	"qualityId" uuid NOT NULL,
	"score" real NOT NULL,
	"organisationId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inductionContestants" ADD CONSTRAINT "inductionContestants_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inductionEvaluations" ADD CONSTRAINT "inductionEvaluations_contestantId_inductionContestants_id_fk" FOREIGN KEY ("contestantId") REFERENCES "public"."inductionContestants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inductionEvaluations" ADD CONSTRAINT "inductionEvaluations_qualityId_inductionQualities_id_fk" FOREIGN KEY ("qualityId") REFERENCES "public"."inductionQualities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inductionEvaluations" ADD CONSTRAINT "inductionEvaluations_organisationId_organisations_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;