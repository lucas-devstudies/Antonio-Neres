import { MiddlewareConfig, NextRequest, NextResponse } from "next/server"

const publicRoutes = [
    {path:'/sign-in',whenAuthenticated:'redirect'},
    {path:'/register',whenAuthenticated:'redirect'},
    {path:'/',whenAuthenticated:'next'},
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in'

export function middleware(request: NextRequest) {

    const path = request.nextUrl.pathname;
    const publicRoute = publicRoutes.find(route => route.path === path);
    const authToken = request.cookies.get('token');

    if(!authToken && !publicRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
        return NextResponse.redirect(redirectUrl);
    }
    if(authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl);
    }
    if(authToken && !publicRoute) {
        //Checar se o token tá expirado
        return NextResponse.next() 
    }

    return NextResponse.next();
}

export const config: MiddlewareConfig = {
    matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}