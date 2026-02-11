import { eq, and, count } from 'drizzle-orm'

import { db } from '~/lib/db'
import { ticketCategories, tickets } from '~/lib/db/schema'
import { logAuditEvent } from './audit'

export async function listCategories(orgId: string) {
  const result = await db
    .select()
    .from(ticketCategories)
    .where(eq(ticketCategories.orgId, orgId))
    .orderBy(ticketCategories.label)

  return result
}

export async function createCategory(orgId: string, label: string, userId: string) {
  const [category] = await db
    .insert(ticketCategories)
    .values({
      orgId,
      label,
    })
    .returning()

  await logAuditEvent({
    orgId,
    userId,
    action: 'ticket_category.created',
    entityType: 'ticket_category',
    entityId: category.id,
    metadata: { label },
  })

  return category
}

export async function deleteCategory(orgId: string, categoryId: string, userId: string) {
  const [ticketCount] = await db
    .select({ count: count() })
    .from(tickets)
    .where(and(eq(tickets.orgId, orgId), eq(tickets.categoryId, categoryId)))

  if (ticketCount && ticketCount.count > 0) {
    throw new Error('Categoria em uso. Remova a categoria dos tickets antes de apagar.')
  }

  const [deleted] = await db
    .delete(ticketCategories)
    .where(and(eq(ticketCategories.id, categoryId), eq(ticketCategories.orgId, orgId)))
    .returning()

  if (deleted) {
    await logAuditEvent({
      orgId,
      userId,
      action: 'ticket_category.deleted',
      entityType: 'ticket_category',
      entityId: categoryId,
      metadata: { label: deleted.label },
    })
  }

  return deleted ?? null
}
