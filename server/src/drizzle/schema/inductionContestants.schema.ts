import { pgTable, text, real, uuid, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations.schema';
import { relations } from 'drizzle-orm';
import { inductionEvaluations } from './inductionEvaluations.schema';

export const inductionContestants = pgTable('inductionContestants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  finalScore: real('finalScore'),
  organisationId: uuid('organisationId')
    .references(() => organisations.id, { onDelete: 'cascade' })
    .notNull(),
});


export const inductionContestantsRelations  = relations(inductionContestants, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [inductionContestants.organisationId],
    references: [organisations.id],
  }),
  evaluations: many(inductionEvaluations),
}));