import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core'

import { organization, user } from './auth'
import { fractions } from './fractions'

export const tickets = pgTable(
  'tickets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    fractionId: text('fraction_id').references(() => fractions.id),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] })
      .notNull()
      .default('open'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [
    index('tickets_org_status_idx').on(t.orgId, t.status),
    index('tickets_org_fraction_idx').on(t.orgId, t.fractionId),
  ],
)

export const ticketComments = pgTable(
  'ticket_comments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => tickets.id),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('ticket_comments_ticket_idx').on(t.ticketId)],
)

export const ticketAttachments = pgTable(
  'ticket_attachments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    ticketId: text('ticket_id').references(() => tickets.id),
    commentId: text('comment_id').references(() => ticketComments.id),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => user.id),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('ticket_attachments_org_ticket_idx').on(t.orgId, t.ticketId)],
)
