import { auth } from '~/lib/auth/auth.server'

export function loader({ request }: { request: Request }) {
  return auth.handler(request)
}

export function action({ request }: { request: Request }) {
  return auth.handler(request)
}
