import { DefaultSession } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';
import { Role } from '@prisma/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: Role;
        } & DefaultSession['user'];
    }

    interface User {
        role: Role;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: Role;
    }
}

declare module '@auth/core/adapters' {
    interface AdapterUser {
        role: Role;
    }
}