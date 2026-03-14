'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Search, PlusCircle, Menu, X, ChevronDown, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);

    const isLoading = status === 'loading';
    const user = session?.user;
    const isAdmin = (user as { role?: string })?.role === 'ADMIN';

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Find Places', href: '/search', icon: Search },
    ];

    // Dynamic color tokens based on scroll state
    const linkBase = scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white';
    const linkActive = scrolled ? 'text-primary' : 'text-white';
    const signInBtn = scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white/80';
    const hamburger = scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-white/80';

    return (
        <>
            <nav
                className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border py-0' : 'bg-transparent py-2'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">

                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                        <Image
                            src="/brand.png"
                            alt="ezboarding"
                            width={112}
                            height={28}
                            className={`h-6 md:h-7 w-auto object-contain transition-all duration-300 ${scrolled ? 'brightness-100' : 'brightness-0 invert'}`}
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`relative text-sm font-semibold transition-colors flex items-center gap-1.5 py-2 ${isActive ? linkActive : linkBase}`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${scrolled ? 'bg-primary' : 'bg-white'}`}
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className={`flex items-center gap-4 border-l pl-6 ${scrolled ? 'border-gray-200' : 'border-white/20'}`}>
                            {!isLoading && (
                                <>
                                    {user ? (
                                        <div className="flex items-center gap-4">
                                            <Link
                                                href="/post-property"
                                                className={`text-sm font-bold px-5 py-2 rounded-full transition-all flex items-center gap-2 shadow-sm hover:scale-105 ${scrolled ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-primary'
                                                    }`}
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                Post Property
                                            </Link>

                                            {/* USER DROPDOWN */}
                                            <div className="relative" ref={userMenuRef}>
                                                <button
                                                    onClick={() => setUserMenuOpen((prev) => !prev)}
                                                    className={`flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors ${scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                                                        }`}
                                                >
                                                    {user.image ? (
                                                        <Image src={user.image} alt={user.name ?? 'Profile'} width={32} height={32} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                                                    ) : (
                                                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white">
                                                            <User className="w-4 h-4 text-primary" />
                                                        </span>
                                                    )}
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${scrolled ? 'text-gray-600' : 'text-white'}`} />
                                                </button>

                                                {/* DROPDOWN MENU */}
                                                <AnimatePresence>
                                                    {userMenuOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                                                        >
                                                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                            </div>
                                                            <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">
                                                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                                                            </Link>
                                                            {isAdmin && (
                                                                <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary">
                                                                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                                                                </Link>
                                                            )}
                                                            <hr className="my-1 border-gray-50" />
                                                            <button onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                                                                <LogOut className="w-4 h-4" /> Sign Out
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsAuthModalOpen(true)} className={`text-sm font-bold transition-colors ${signInBtn}`}>
                                                Sign In
                                            </button>
                                            <button
                                                onClick={() => setIsAuthModalOpen(true)} // Open modal if guest wants to post
                                                className={`text-sm font-extrabold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 ml-2 ${scrolled ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-primary'
                                                    }`}
                                            >
                                                <PlusCircle className="w-4 h-4" /> Post Your Place
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <button className={`md:hidden p-2 focus:outline-none transition-colors ${hamburger}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* MOBILE NAVIGATION DROPDOWN */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-border bg-white absolute w-full shadow-lg overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 rounded-lg text-base font-semibold flex items-center gap-3 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                                            <link.icon className="w-5 h-5" /> {link.name}
                                        </Link>
                                    );
                                })}

                                <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-3">
                                    {user ? (
                                        <>
                                            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                                                {user.image ? <Image src={user.image} alt={user.name ?? ''} width={40} height={40} className="w-10 h-10 rounded-full" /> : <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></span>}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 font-semibold hover:text-primary"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
                                            {isAdmin && <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 font-semibold hover:text-primary"><ShieldCheck className="w-5 h-5" /> Admin Panel</Link>}
                                            <Link href="/post-property" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold"><PlusCircle className="w-5 h-5" /> Post Your Place</Link>
                                            <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-3 py-2 text-red-600 font-semibold"><LogOut className="w-5 h-5" /> Sign Out</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="w-full text-center font-bold text-gray-700 hover:text-primary py-2">Sign In</button>
                                            <button onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} className="w-full bg-primary text-white px-4 py-3 rounded-xl text-center font-bold flex items-center justify-center gap-2"><PlusCircle className="w-5 h-5" /> Post Your Place</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}