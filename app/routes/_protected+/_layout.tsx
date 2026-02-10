import { Outlet, redirect } from 'react-router'

import type { Route } from './+types/_layout'
import { requireAuth } from '~/lib/auth/rbac'
import { db } from '~/lib/db'
import { member } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AppShell } from '~/components/layout/app-shell'

export async function loader({ context }: Route.LoaderArgs) {
  const { session, user } = requireAuth(context)

  const activeOrgId = session.session.activeOrganizationId

  // No active org → send to onboarding
  if (!activeOrgId) {
    const memberships = await db.select().from(member).where(eq(member.userId, user.id)).limit(1)

    if (memberships.length === 0) {
      throw redirect('/onboarding')
    }

    throw redirect('/onboarding')
  }

  // Fetch org member role
  const [memberRow] = await db.select().from(member).where(eq(member.userId, user.id)).limit(1)

  const orgRole = memberRow?.role as string | undefined

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
    },
    orgId: activeOrgId,
    isOrgAdmin: orgRole === 'owner' || orgRole === 'admin',
  }
}

export default function ProtectedLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell user={loaderData.user} isOrgAdmin={loaderData.isOrgAdmin}>
      <Outlet />
    </AppShell>
  )
}
