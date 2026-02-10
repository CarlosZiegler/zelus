import { NavLink } from 'react-router'

import { cn } from '~/lib/utils'
import { ZelusLogoTile } from '~/components/brand/zelus-logo-tile'

type SidebarProps = {
  isOrgAdmin: boolean
}

type NavItem = {
  label: string
  to: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Painel', to: '/dashboard' },
  { label: 'Ocorrências', to: '/tickets' },
  { label: 'Frações', to: '/fractions' },
  { label: 'Fornecedores', to: '/suppliers' },
  { label: 'Manutenções', to: '/maintenance' },
  { label: 'Administração', to: '/admin/associations', adminOnly: true },
]

export function Sidebar({ isOrgAdmin }: SidebarProps) {
  const visibleItems = navItems.filter((item) => !item.adminOnly || isOrgAdmin)

  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-56 shrink-0 border-r lg:block">
      <div className="flex h-14 items-center gap-2 px-4">
        <ZelusLogoTile size={24} className="text-primary" />
        <span className="text-sm font-semibold tracking-tight">Zelus</span>
      </div>
      <nav className="mt-2 grid gap-0.5 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
