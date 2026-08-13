import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Supabase session refresh middleware.
 *
 * Runs on every request to the app (except static assets). Its sole job is to
 * call `supabase.auth.getUser()`, which:
 *   1. Validates the JWT in the `sb-*-auth-token` cookie
 *   2. Triggers a token refresh if the access_token is expired but
 *      refresh_token is still valid (default: access 1h, refresh 7d)
 *   3. Writes the new tokens back into the response cookies via setAll()
 *
 * Why this can't reuse `lib/supabase/server.ts`:
 *   The server.ts client uses `next/headers cookies()`, which only works in
 *   Server Components / Server Actions / Route Handlers. In middleware we
 *   must read/write the `NextRequest` / `NextResponse` cookie jars directly.
 *   Hence this file inlines the standard @supabase/ssr middleware recipe.
 *
 * The matcher below intentionally excludes:
 *   - /_next/static, /_next/image (build artifacts, no need to refresh)
 *   - favicon.ico and common image extensions (static assets)
 */
export async function middleware(request: NextRequest) {
  // Start with a pass-through response. We may need to swap this for a
  // response with mutated cookies if the session gets refreshed.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1) Mutate the *request* cookies so any downstream code in this
          //    middleware run sees the new tokens.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2) Rebuild the response with the (now-updated) request headers,
          //    then write the new tokens to the *response* cookies so the
          //    browser receives them.
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: this single call performs token validation + refresh.
  // We don't act on the returned user here — page-level auth checks live in
  // the server components / actions themselves. The side effect of writing
  // refreshed cookies is what we care about.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - _next/static   (build artifacts)
     *   - _next/image    (image optimization)
     *   - favicon.ico    (favicon)
     *   - common image extensions (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
