'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerLandlord } from '@/lib/actions/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'login' | 'register';
}

export default function AuthModal({
    isOpen,
    onClose,
    defaultMode = 'login',
}: AuthModalProps) {
    const router = useRouter();

    // State
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset states when switching modes
    const switchMode = () => {
        setIsLogin((prev) => !prev);
        setName('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
    };

    if (!isOpen) return null;

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin && password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                // --- LOGIN FLOW ---
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    toast.error('Invalid email or password. Please try again.');
                } else {
                    toast.success('Signed in successfully!');
                    onClose();
                    router.refresh();
                }
            } else {
                // --- REGISTRATION FLOW ---
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);

                const result = await registerLandlord(formData);

                if (!result.success) {
                    toast.error(result.error);
                } else {
                    toast.success('Account created successfully!');

                    // Auto-login immediately after successful registration
                    const loginResult = await signIn('credentials', {
                        email,
                        password,
                        redirect: false,
                    });

                    if (!loginResult?.error) {
                        onClose();
                        router.refresh();
                    } else {
                        // Fallback just in case auto-login fails
                        setIsLogin(true);
                        setPassword('');
                        setConfirmPassword('');
                    }
                }
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn('google', { callbackUrl: '/dashboard' });
        } catch {
            toast.error('Google sign-in failed. Please try again.');
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header with Branding */}
                <div className="flex flex-col items-center p-8 pb-6 border-b border-gray-100 text-center relative bg-gray-50/30">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <img src="/logo.png" alt="Logo Icon" className="h-16 w-auto object-contain mb-2 drop-shadow-sm" />
                    <img src="/brand.png" alt="ezboarding" className="h-6 w-auto object-contain mb-4" />

                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {isLogin
                            ? 'Sign in to manage your listings'
                            : 'Join as a landlord to list your property'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">

                        {/* Full Name Input (Register Only) */}
                        {!isLogin && (
                            <div className="space-y-1 relative">
                                <Label htmlFor="auth-name" className="sr-only">Full Name</Label>
                                <div className="relative">
                                    <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                    <Input
                                        id="auth-name"
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        autoComplete="name"
                                        className="pl-10 h-10"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-1 relative">
                            <Label htmlFor="auth-email" className="sr-only">Email Address</Label>
                            <div className="relative">
                                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <Input
                                    id="auth-email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoComplete="email"
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1 relative">
                            <Label htmlFor="auth-password" className="sr-only">Password</Label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <Input
                                    id="auth-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={isLoading}
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    className="pl-10 pr-10 h-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input (Register Only) */}
                        {!isLogin && (
                            <div className="space-y-1 relative">
                                <Label htmlFor="auth-confirm-password" className="sr-only">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                    <Input
                                        id="auth-confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        disabled={isLoading}
                                        autoComplete="new-password"
                                        className="pl-10 pr-10 h-10"
                                    />
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isLogin ? 'Signing in…' : 'Creating account…'}
                                </>
                            ) : isLogin ? (
                                'Sign In'
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="shrink-0 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">or continue with</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 font-medium"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Google
                    </Button>
                </div>

                {/* Footer Toggle */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}