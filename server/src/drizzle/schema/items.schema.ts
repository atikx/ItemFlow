import { pgTable, uuid, text, integer, timestamp, uuid as uuidType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { organisations } from './organisations.schema';
import { itemLogs } from './itemLogs.schema';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  quantityTotal: integer('quantityTotal').notNull(),
  quantityAvailable: integer('quantityAvailable').notNull(),
  organisationId: uuidType('organisationId').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const itemRelations = relations(items, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [items.organisationId],
    references: [organisations.id],
  }),
  itemLogs: many(itemLogs),
}));
