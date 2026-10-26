import { NextRequest, NextResponse } from "next/server"

const publicRoutes = [
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/register', whenAuthenticated: 'redirect' },
  { path: '/cadastro', whenAuthenticated: 'redirect' },
  { path: '/', whenAuthenticated: 'next' },
] as const

const validRoutes = [
  "/",
  "/sign-in",
  "/register",
  "/admin",
  "/cadastro",
]

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isValidRoute = validRoutes.find((route) => route === path)

  if (!isValidRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  const publicRoute = publicRoutes.find((route) => route.path === path)

  // Verifica o cookie de sessão do Better Auth (http e https/secure)
  const sessionCookie = request.cookies.get('better-auth.session_token')
  
  const authToken = sessionCookie?.value
  
  // 1. Usuário não autenticado tentando acessar rota privada
  if (!authToken && !publicRoute) {
    return NextResponse.redirect(new URL(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE, request.url))
  }

  // 2. Usuário autenticado acessando rota pública configurada para redirecionar
  if (authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Ignora:
     * - Rotas de API (/api)
     * - Recursos estáticos do Next (_next/static, _next/image)
     * - Favicon e arquivos de mídia/imagens (.png, .jpg, .svg, .webp, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}