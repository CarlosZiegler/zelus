import { pgTable, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core'

import { organization, user } from './auth'
import { fractions } from './fractions'

export const ticketCategories = pgTable(
  'ticket_categories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orgId: text('org_id')
      .notNull()
      .references(() => organization.id),
    label: text('label').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('ticket_categories_org_idx').on(t.orgId)],
)

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
    categoryId: text('category_id').references(() => ticketCategories.id),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] })
      .notNull()
      .default('open'),
    priority: text('priority', { enum: ['urgent', 'high', 'medium', 'low'] }),
    private: boolean('private').notNull().default(false),
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

export const ticketEvents = pgTable(
  'ticket_events',
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
    fromStatus: text('from_status', {
      enum: ['open', 'in_progress', 'resolved', 'closed'],
    }).notNull(),
    toStatus: text('to_status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('ticket_events_ticket_idx').on(t.ticketId)],
)
