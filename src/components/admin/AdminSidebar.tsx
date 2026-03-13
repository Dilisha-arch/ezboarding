/**
 * src/components/admin/AdminSidebar.tsx
 * The collapsible sidebar navigation for the admin panel.
 */
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Building2, Menu, X, LogOut, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Moderation Queue', href: '/admin/queue', icon: Inbox },
    { name: 'Properties', href: '/admin/properties', icon: Building2 },
    // { name: 'Users', href: '/admin/users', icon: Users }, // Future MVP
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 md:w-72 shrink-0">
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
                <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">
                        b
                    </div>
                    <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
                        Admin<span className="text-sidebar-primary">.lk</span>
                    </span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="px-2 pb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    Menu
                </div>
                {NAV_ITEMS.map((item) => {
                    // Exact match for dashboard to prevent active state bleeding, startsWith for others
                    const isActive = item.href === '/admin' 
                        ? pathname === '/admin' 
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm' 
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60'}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-sidebar-border">
                <Link 
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                    <ExternalLink className="w-5 h-5 text-sidebar-foreground/60" />
                    Go to Site
                </Link>
                {/* auth() handles real signout via standard next-auth flows, this is just a UI placeholder for the form if needed */}
                <form action="/api/auth/signout" method="POST">
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-red-50 hover:text-red-600 transition-colors mt-1">
                        <LogOut className="w-5 h-5 text-sidebar-foreground/60 group-hover:text-red-500" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Fixed) */}
            <div className="hidden md:block sticky top-0 h-screen">
                <SidebarContent />
            </div>

            {/* Mobile Header & Toggle */}
            <div className="md:hidden flex items-center justify-between h-16 px-4 bg-sidebar border-b border-sidebar-border sticky top-0 z-40">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-sidebar-primary rounded-md flex items-center justify-center text-sidebar-primary-foreground font-bold leading-none">
                        b
                    </div>
                </Link>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 -mr-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 md:hidden bg-sidebar"
                        >
                            <SidebarContent />
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground bg-sidebar-accent/50 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
