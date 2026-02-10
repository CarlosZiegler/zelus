import { Outlet, NavLink } from 'react-router'

import type { Route } from './+types/_layout'
import { orgAdminMiddleware } from '~/lib/auth/middleware'
import { cn } from '~/lib/utils'

export const middleware: Route.MiddlewareFunction[] = [orgAdminMiddleware]

export default function AdminLayout() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Administração</h1>

      <nav className="bg-border mt-4 flex gap-px overflow-hidden rounded-2xl border">
        <TabLink to="/admin/associations">Associações</TabLink>
        <TabLink to="/admin/invites">Convites</TabLink>
      </nav>

      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  )
}

function TabLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex-1 py-2 text-center text-sm font-medium transition-colors',
          isActive
            ? 'bg-card text-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground',
        )
      }
    >
      {children}
    </NavLink>
  )
}
