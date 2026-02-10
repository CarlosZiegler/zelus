import { Sidebar } from './sidebar'
import { Header } from './header'

type AppShellProps = {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  isOrgAdmin: boolean
  children: React.ReactNode
}

export function AppShell({ user, isOrgAdmin, children }: AppShellProps) {
  return (
    <div className="flex min-h-svh">
      <Sidebar isOrgAdmin={isOrgAdmin} />
      <div className="flex flex-1 flex-col">
        <Header user={user} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
