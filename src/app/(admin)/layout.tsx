/**
 * src/app/(admin)/layout.tsx
 * Admin shell layout protecting all admin routes.
 */
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar Navigation */}
            <AdminSidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {children}
            </main>
        </div>
    );
}
