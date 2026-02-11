import { Outlet } from 'react-router'

import type { Route } from './+types/_layout'
import { orgAdminMiddleware } from '~/lib/auth/middleware'

export const middleware: Route.MiddlewareFunction[] = [orgAdminMiddleware]

export default function AdminLayout() {
  return <Outlet />
}
