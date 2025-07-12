import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  uuid as uuidType,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { organisations } from './organisations.schema';
import { itemLogs } from './itemLogs.schema';

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  batch: integer('batch').notNull(),
  organisationId: uuidType('organisationId').references(() => organisations.id, {
    onDelete: 'cascade',
  }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const memberRelations = relations(members, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [members.organisationId],
    references: [organisations.id],
  }),
  itemLogs: many(itemLogs),
}));
