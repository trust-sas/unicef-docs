import createMiddleware from 'next-intl/middleware'

import { routing } from './integrations/i18n/routing'

export default createMiddleware(routing)

// see https://next-intl-docs.vercel.app/docs/routing/middleware
export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|next|.*\\..*).*)'],
}
