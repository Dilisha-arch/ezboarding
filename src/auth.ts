/**
 * src/auth.ts
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas/authSchema';
import { authConfig } from '@/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        ...authConfig.providers,
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                // Query user by email where deletedAt is null
                const user = await prisma.user.findFirst({
                    where: { email, deletedAt: null },
                });

                // If no user or no password (OAuth-only account)
                if (!user || !user.passwordHash) return null;

                const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
                if (!passwordsMatch) return null;

                return user;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger }) {
            // trigger === 'signIn' is the semantically correct v5 guard.
            // Fetch the authoritative role from DB on sign-in only.
            if (trigger === 'signIn' && user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { id: true, role: true, name: true, email: true, image: true },
                });

                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.name = dbUser.name;
                    token.email = dbUser.email;
                    token.picture = dbUser.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as { id?: string; role?: string }).id = token.id as string;
                (session.user as { id?: string; role?: string }).role = token.role as string;
            }
            return session;
        },
    },
    events: {
        async signIn({ user, account }) {
            console.log(`[AUTH] User Signed In: ${user.id} via ${account?.provider}`);
        },
    },
});