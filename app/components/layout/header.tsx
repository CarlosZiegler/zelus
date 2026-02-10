import { Form } from 'react-router'

import { Button } from '~/components/ui/button'

type HeaderProps = {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-background flex h-14 items-center justify-between border-b px-4 lg:px-8">
      <div className="lg:hidden">
        <span className="text-sm font-semibold">Zelus</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">{user.name}</span>
        <Form method="post" action="/auth/signout">
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </Form>
      </div>
    </header>
  )
}
