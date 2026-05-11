// /proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const session = request.cookies.get('meme_session');
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
        return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', request.url));
    }
    // Si no hay sesión y no estoy en el login -> Pa' fuera (al login)
    if (!session && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si ya tengo sesión y quiero ir al login -> Pa' dentro (al dashboard)
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Asegúrate de que el matcher cubra tus rutas protegidas
export const config = {
    matcher: ['/', '/dashboard/:path*', '/ordenes/:path*', '/insumos/:path*', '/operarios/:path*', '/usuarios/:path*', '/maquinas/:path*'],
};