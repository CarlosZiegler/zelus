import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core'

import { organization, user } from './auth'

export const notifications = pgTable(
  'notifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('notifications_org_user_read_idx').on(t.orgId, t.userId, t.readAt)],
)
