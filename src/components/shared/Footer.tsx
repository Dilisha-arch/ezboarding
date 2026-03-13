/**
 * src/components/shared/Footer.tsx
 * Global footer for bodim.lk
 */
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-950 to-gray-900 text-gray-300 py-12 md:py-16 mt-auto">
            <div className="bodim-container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12 border-b border-gray-800 pb-12">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="Logo Icon" className="h-16 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-110" />
                            <img src="/brand.png" alt="ezboarding" className="h-6 w-auto object-contain brightness-0 invert" />
                        </Link>
                        <p className="text-base text-gray-400 leading-relaxed max-w-xs font-medium">
                            Sri Lanka&apos;s premier platform connecting university students with safe, affordable, and verified boarding places.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Explore</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/search" className="hover:text-primary transition-colors">Find a Place</Link></li>
                            <li><Link href="/post-property" className="hover:text-primary transition-colors">Post a Property</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Connect With Us</h3>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail className="w-4 h-4" />
                            <a href="mailto:hello@ezboarding.lk" className="hover:text-white transition-colors">hello@ezboarding.lk</a>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright Row */}
                <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                    <p>&copy; {new Date().getFullYear()} ezboarding. All rights reserved.</p>
                    <p>Designed with ❤️ for Sri Lankan Students.</p>
                </div>
            </div>
        </footer>
    );
}