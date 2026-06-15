// /proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const session = request.cookies.get('meme_session');
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
        return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', request.url));
    }
    if (!session && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Asegúrando de que el matcher cubra las rutas protegidas
export const config = {
    matcher: ['/', '/dashboard/:path*', '/ordenes/:path*', '/insumos/:path*', '/operarios/:path*', '/usuarios/:path*', '/maquinas/:path*'],
};