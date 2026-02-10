import { pgTable, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'

import { organization, user } from './auth'
import { fractions } from './fractions'

export const invites = pgTable(
  'invites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    email: text('email').notNull(),
    type: text('type', { enum: ['org', 'fraction'] }).notNull(),
    fractionId: text('fraction_id').references(() => fractions.id),
    role: text('role', {
      enum: ['org_admin', 'fraction_owner_admin', 'fraction_member'],
    }).notNull(),
    token: text('token').notNull(),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => user.id),
    status: text('status', { enum: ['pending', 'accepted', 'expired'] })
      .notNull()
      .default('pending'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('invites_token_idx').on(t.token),
    index('invites_org_status_idx').on(t.orgId, t.status),
  ],
)
