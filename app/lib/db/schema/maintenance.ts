import { pgTable, text, timestamp, numeric, index } from 'drizzle-orm/pg-core'

import { organization, user } from './auth'
import { suppliers } from './suppliers'

export const maintenanceRecords = pgTable(
  'maintenance_records',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    supplierId: text('supplier_id').references(() => suppliers.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    performedAt: timestamp('performed_at').notNull(),
    cost: numeric('cost', { precision: 10, scale: 2 }),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [index('maintenance_records_org_id_idx').on(t.orgId)],
)
