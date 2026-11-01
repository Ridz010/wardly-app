import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export const proxy = (req: NextRequest) => updateSession(req)

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
}