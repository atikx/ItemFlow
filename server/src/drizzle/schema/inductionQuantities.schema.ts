import { pgTable, text, real, uuid, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations.schema';
import { relations } from 'drizzle-orm';
import { inductionEvaluations } from './inductionEvaluations.schema';

export const inductionQualities = pgTable('inductionQualities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  weightage: real('weightage').notNull(),
  organisationId: uuid('organisationId')
    .references(() => organisations.id, { onDelete: 'cascade' })
    .notNull(),
});

export const inductionQualitiesRelations = relations(
  inductionQualities,
  ({ one, many }) => ({
    organisation: one(organisations, {
      fields: [inductionQualities.organisationId],
      references: [organisations.id],
    }),
    evaluations: many(inductionEvaluations),
  }),
);
