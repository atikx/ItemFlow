import {
  pgTable,
  uuid,
  text,
  timestamp,
  uuid as uuidType,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { organisations } from './organisations.schema';
import { itemLogs } from './itemLogs.schema';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  year: integer('year').notNull(),
  organisationId: uuidType('organisationId')
    .references(() => organisations.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const eventRelations = relations(events, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [events.organisationId],
    references: [organisations.id],
  }),
  itemLogs: many(itemLogs),
}));
