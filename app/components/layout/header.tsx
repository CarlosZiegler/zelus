import { SidebarTrigger } from '~/components/ui/sidebar'

export function Header() {
  return (
    <header className="bg-background relative flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1 size-10" />
    </header>
  )
}
