import type { Route } from './+types/dashboard'
import { requireOrgMember } from '~/lib/auth/rbac'
import { db } from '~/lib/db'
import { tickets, fractions } from '~/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'Painel — Zelus' }]
}

export async function loader({ context }: Route.LoaderArgs) {
  const { org, effectiveRole } = await requireOrgMember(context)

  const [ticketCount] = await db
    .select({ count: count() })
    .from(tickets)
    .where(eq(tickets.orgId, org.id))

  const [openTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(and(eq(tickets.orgId, org.id), eq(tickets.status, 'open')))

  const [fractionCount] = await db
    .select({ count: count() })
    .from(fractions)
    .where(eq(fractions.orgId, org.id))

  return {
    orgName: org.name,
    role: effectiveRole,
    stats: {
      totalTickets: ticketCount?.count ?? 0,
      openTickets: openTickets?.count ?? 0,
      totalFractions: fractionCount?.count ?? 0,
    },
  }
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const { orgName, stats } = loaderData

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{orgName}</h1>
      <p className="text-muted-foreground mt-1 text-sm">Painel de gestão</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Ocorrências" value={stats.totalTickets} />
        <StatCard label="Abertas" value={stats.openTickets} />
        <StatCard label="Frações" value={stats.totalFractions} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="ring-foreground/10 bg-card rounded-xl px-4 py-4 ring-1">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
