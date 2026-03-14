import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth configuration.
 * This file must NOT import Zod, Prisma, bcrypt, or any Node.js-only modules.
 * It is used by middleware.ts which runs in the Edge Runtime.
 */
export const authConfig: NextAuthConfig = {
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).role = token.role;
            }
            return session;
        },
        // This runs in middleware to protect routes
        authorized() {
            return true; // Let middleware.ts handle the logic
        },
    },
};