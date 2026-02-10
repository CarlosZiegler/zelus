import type { Route } from '../../+types/root'
import { auth } from './auth.server'
import { sessionContext } from './context'

/**
 * Root-level middleware that resolves the session for every request.
 * Stores session in context (null if not authenticated).
 * Applied in root.tsx so all routes can access session data.
 */
export const sessionMiddleware: Route.MiddlewareFunction = async ({ request, context }, next) => {
  const session = await auth.api.getSession({ headers: request.headers })
  context.set(sessionContext, session)
  return next()
}
