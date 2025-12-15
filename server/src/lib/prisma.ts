
import { PrismaClient } from '@prisma/client';

// Helper to ensure connection is robust for PgBouncer
const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL;
    if (!url) return undefined;

    // If using Supabase/PgBouncer, we MUST append these params to avoid "prepared statement s0 already exists"
    // and to ensure statement caching is disabled for transaction pooling.
    if (!url.includes('pgbouncer=true')) {
        url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    if (!url.includes('statement_cache_size=0')) {
        url += '&statement_cache_size=0';
    }
    return url;
};

// Singleton pattern to prevent multiple instances
declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
