import { eq, and, or, sql, desc } from 'drizzle-orm'

import { db } from '~/lib/db'
import { tickets, ticketCategories, ticketEvents, fractions, user } from '~/lib/db/schema'
import { logAuditEvent } from './audit'

export async function createTicket(
  orgId: string,
  data: {
    title: string
    description: string
    categoryId?: string | null
    fractionId?: string | null
    priority?: 'urgent' | 'high' | 'medium' | 'low' | null
    private?: boolean
  },
  userId: string,
) {
  const [ticket] = await db
    .insert(tickets)
    .values({
      orgId,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId ?? null,
      fractionId: data.fractionId ?? null,
      priority: data.priority ?? null,
      private: data.private ?? false,
      createdBy: userId,
    })
    .returning()

  await logAuditEvent({
    orgId,
    userId,
    action: 'ticket.created',
    entityType: 'ticket',
    entityId: ticket.id,
    metadata: { title: data.title },
  })

  return ticket
}

export async function listTickets(
  orgId: string,
  userId: string,
  filters?: {
    status?: string
    priority?: string
    categoryId?: string
    fractionId?: string
  },
) {
  const conditions = [
    eq(tickets.orgId, orgId),
    or(eq(tickets.private, false), and(eq(tickets.private, true), eq(tickets.createdBy, userId))),
  ]

  if (filters?.status) {
    conditions.push(
      eq(tickets.status, filters.status as (typeof tickets.status.enumValues)[number]),
    )
  }
  if (filters?.priority) {
    conditions.push(
      eq(tickets.priority, filters.priority as (typeof tickets.priority.enumValues)[number]),
    )
  }
  if (filters?.categoryId) {
    conditions.push(eq(tickets.categoryId, filters.categoryId))
  }
  if (filters?.fractionId) {
    conditions.push(eq(tickets.fractionId, filters.fractionId))
  }

  const result = await db
    .select({
      id: tickets.id,
      title: tickets.title,
      status: tickets.status,
      priority: tickets.priority,
      private: tickets.private,
      createdAt: tickets.createdAt,
      categoryLabel: ticketCategories.label,
      creatorName: user.name,
      fractionLabel: fractions.label,
    })
    .from(tickets)
    .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
    .innerJoin(user, eq(tickets.createdBy, user.id))
    .leftJoin(fractions, eq(tickets.fractionId, fractions.id))
    .where(and(...conditions))
    .orderBy(desc(tickets.createdAt))

  return result
}

export async function getTicket(orgId: string, ticketId: string, userId: string) {
  const [ticket] = await db
    .select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      private: tickets.private,
      createdBy: tickets.createdBy,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      categoryId: tickets.categoryId,
      fractionId: tickets.fractionId,
      categoryLabel: ticketCategories.label,
      creatorName: user.name,
      fractionLabel: fractions.label,
    })
    .from(tickets)
    .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
    .innerJoin(user, eq(tickets.createdBy, user.id))
    .leftJoin(fractions, eq(tickets.fractionId, fractions.id))
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, orgId)))
    .limit(1)

  if (!ticket) return null

  if (ticket.private && ticket.createdBy !== userId) {
    return null
  }

  return ticket
}

export async function updateTicket(
  orgId: string,
  ticketId: string,
  data: {
    title?: string
    description?: string
    categoryId?: string | null
    priority?: 'urgent' | 'high' | 'medium' | 'low' | null
    private?: boolean
  },
  userId: string,
) {
  const [updated] = await db
    .update(tickets)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, orgId)))
    .returning()

  if (updated) {
    await logAuditEvent({
      orgId,
      userId,
      action: 'ticket.updated',
      entityType: 'ticket',
      entityId: ticketId,
      metadata: data,
    })
  }

  return updated ?? null
}

export async function updateTicketStatus(
  orgId: string,
  ticketId: string,
  newStatus: 'open' | 'in_progress' | 'resolved' | 'closed',
  userId: string,
) {
  const [current] = await db
    .select({ status: tickets.status })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, orgId)))
    .limit(1)

  if (!current) return null

  const fromStatus = current.status

  const [updated] = await db
    .update(tickets)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, orgId)))
    .returning()

  await db.insert(ticketEvents).values({
    orgId,
    ticketId,
    userId,
    fromStatus,
    toStatus: newStatus,
  })

  await logAuditEvent({
    orgId,
    userId,
    action: 'ticket.status_changed',
    entityType: 'ticket',
    entityId: ticketId,
    metadata: { from: fromStatus, to: newStatus },
  })

  return updated
}
