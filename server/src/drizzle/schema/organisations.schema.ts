import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { members } from './members.schema';
import { items } from './items.schema';
import { departments } from './departments.schema';
import { events } from './events.schema';
import { itemLogs } from './itemLogs.schema';

export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const organisationRelations = relations(organisations, ({ many }) => ({
  members: many(members),
  items: many(items),
  departments: many(departments),
  events: many(events),
  itemLogs: many(itemLogs),
}));
