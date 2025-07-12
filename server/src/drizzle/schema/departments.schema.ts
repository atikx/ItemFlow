import { pgTable, uuid, text, timestamp, uuid as uuidType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { organisations } from './organisations.schema';
import { itemLogs } from './itemLogs.schema';

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  organisationId: uuidType('organisationId').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const departmentRelations = relations(departments, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [departments.organisationId],
    references: [organisations.id],
  }),
  itemLogs: many(itemLogs),
}));
