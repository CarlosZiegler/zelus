import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'

import { organization } from './auth'

export const suppliers = pgTable(
  'suppliers',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    name: text('name').notNull(),
    category: text('category').notNull(),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    address: text('address'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [index('suppliers_org_id_idx').on(t.orgId)],
)
