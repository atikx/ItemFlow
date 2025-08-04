import { pgTable, text, real, uuid, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations.schema';
import { relations } from 'drizzle-orm';
import { inductionContestants } from './inductionContestants.schema';
import { inductionQualities } from './inductionQuantities.schema';


export const inductionEvaluations = pgTable('inductionEvaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  contestantId: uuid('contestantId')
    .references(() => inductionContestants.id, { onDelete: 'cascade' })
    .notNull(),
  qualityId: uuid('qualityId')
    .references(() => inductionQualities.id, { onDelete: 'cascade' })
    .notNull(),
  score: real('score').notNull(),
  organisationId: uuid('organisationId')
    .references(() => organisations.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});


export const inductionEvaluationsRelations = relations(inductionEvaluations, ({ one }) => ({
  contestant: one(inductionContestants, {
    fields: [inductionEvaluations.contestantId],
    references: [inductionContestants.id],
  }),
  quality: one(inductionQualities, {
    fields: [inductionEvaluations.qualityId],
    references: [inductionQualities.id],
  }),
  organisation: one(organisations, {
    fields: [inductionEvaluations.organisationId],
    references: [organisations.id],
  }),
}));