import {
  pgTable,
  uuid,
  integer,
  timestamp,
  text,
  date,
  uuid as uuidType,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { items } from './items.schema';
import { members } from './members.schema';
import { events } from './events.schema';
import { organisations } from './organisations.schema';
import { departments } from './departments.schema';

export const itemLogs = pgTable('itemLogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuidType('itemId')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  eventId: uuidType('eventId')
    .references(() => events.id)
    .notNull(),
  issuedBy: uuidType('issuedBy')
    .references(() => members.id)
    .notNull(),
  quantityIssued: integer('quantityIssued').notNull(),
  expectedReturnDate: timestamp('expectedReturnDate', {
    withTimezone: true,
  }).notNull(),
  returnedAt: timestamp('returnedAt', { withTimezone: true }),
  organisationId: uuidType('organisationId')
    .references(() => organisations.id, { onDelete: 'cascade' })
    .notNull(),
  departmentId: uuidType('departmentId')
    .references(() => departments.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
});

export const itemLogsRelations = relations(itemLogs, ({ one }) => ({
  item: one(items, {
    fields: [itemLogs.itemId],
    references: [items.id],
  }),
  issuedBy: one(members, {
    fields: [itemLogs.issuedBy],
    references: [members.id],
  }),
  event: one(events, {
    fields: [itemLogs.eventId],
    references: [events.id],
  }),
  department: one(departments, {
    fields: [itemLogs.departmentId],
    references: [departments.id],
  }),
  organisation: one(organisations, {
    fields: [itemLogs.organisationId],
    references: [organisations.id],
  }),
}));
