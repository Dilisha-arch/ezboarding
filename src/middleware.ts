import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth;
    const role = req.auth?.user?.role;
    const path = nextUrl.pathname;

    // 1. Admin routes protection
    if (path.startsWith('/admin')) {
        if (role !== 'ADMIN') {
            // Rewrite to 404 to prevent route enumeration
            return NextResponse.rewrite(new URL('/not-found', req.url));
        }
        return NextResponse.next();
    }

    // 2. Landlord routes protection — both LANDLORD and ADMIN can access
    const isLandlordRoute = path.startsWith('/post-property') || path.startsWith('/dashboard');
    if (isLandlordRoute) {
        if (!isAuthenticated) {
            const callbackUrl = encodeURIComponent(path);
            return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url));
        }
        if (role !== 'LANDLORD' && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    // 3. Public routes pass through
    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/upload/presign).*)',
    ],
};