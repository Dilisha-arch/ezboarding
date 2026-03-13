import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Creates a Prisma Client.
 * Note: Neon provides its own connection pooling (pgbouncer),
 * so we use the standard PrismaClient with pooler flags in the .env
 */
const prismaClientSingleton = () => {
    const logConfig = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

    return new PrismaClient({ log: logConfig as Prisma.LogLevel[] });
};

export const createExtendedClient = () => {
    return prismaClientSingleton().$extends({
        query: {
            property: {
                // Automatically append { deletedAt: null } to queries to hide soft-deleted records
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async findMany({ args, query }: any) {
                    if (args === undefined) args = {};
                    args.where = { ...args.where, deletedAt: null };
                    return query(args);
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async findFirst({ args, query }: any) {
                    if (args === undefined) args = {};
                    args.where = { ...args.where, deletedAt: null };
                    return query(args);
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async findUnique({ args, query }: any) {
                    if (args === undefined) args = {};
                    const where = args.where ?? {};
                    
                    // If deletedAt is already specified, just run the query safely
                    if ('deletedAt' in where) {
                        return query(args);
                    }

                    // Otherwise, convert the findUnique into a findFirst to allow non-unique fields
                    args.where = { ...where, deletedAt: null };
                    
                    // Use 'this' to call findFirst instead of proceeding with findUnique
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return (this as any).findFirst(args);
                },
            },
        },
        model: {
            property: {
                // Custom method to soft-delete a property instead of permanently removing it
                async softDelete(id: string) {
                    // Use 'this' instead of 'prisma' since 'prisma' is not fully initialized yet
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return (this as any).update({
                        where: { id },
                        data: {
                            deletedAt: new Date(),
                            status: 'ARCHIVED',
                        },
                    });
                },
            },
        },
    });
};

// Extract the exact type of our extended Prisma client
export type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

export type TransactionClient = Omit<
    ExtendedPrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Global pattern to prevent multiple instances during hot-reload in development
const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createExtendedClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;