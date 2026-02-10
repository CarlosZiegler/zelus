import { createContext } from 'react-router'

import type { Session } from './auth.server'

export const sessionContext = createContext<Session | null>(null)
