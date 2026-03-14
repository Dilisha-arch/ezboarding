'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Mail, Lock, User, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerLandlord } from '@/lib/actions/auth';

type FieldErrors = Record<string, string[]>;

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Field-level errors from server validation
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const isSignIn = mode === 'signin';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Clear previous field errors for fresh attempt
        setFieldErrors({});

        if (!isSignIn && password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            if (isSignIn) {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    toast.error('Invalid email or password.');
                } else {
                    toast.success('Welcome back!');
                    router.push(callbackUrl);
                    router.refresh();
                }
            } else {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('confirmPassword', confirmPassword);

                const result = await registerLandlord(formData);

                // result is discriminated by `success` and (on failure) has a `type`
                if (!result.success) {
                    // handle different failure types gracefully
                    // expected result.type values: 'validation' | 'duplicate' | 'ratelimit' | 'server'
                    // NOTE: adapt strings below if your server uses different `type` names
                    // validation -> surface fieldErrors where possible
                    // duplicate/ratelimit/server -> toast the error
                    // keep a fallback to toast the error message
                    // (We assume server returns `fieldErrors` only for validation failures.)
                    // type assertion instead of 'any' to appease ESLint
                    type RegisterErrorResult = {
                        success: false;
                        type?: string;
                        error: string;
                        fieldErrors?: FieldErrors;
                    };
                    const errResult = result as RegisterErrorResult;
                    const errType = errResult.type;

                    if (errType === 'validation') {
                        // show field errors in the UI and a toast for the first error
                        const errors = errResult.fieldErrors;
                        setFieldErrors(errors ?? {});
                        const firstError =
                            errors && Object.values(errors).flatMap((v) => v)[0];
                        toast.error(firstError ?? result.error);
                    } else if (errType === 'duplicate') {
                        toast.error(result.error);
                    } else if (errType === 'ratelimit') {
                        toast.error(result.error);
                    } else {
                        // server or unknown
                        toast.error(result.error);
                    }
                } else {
                    toast.success('Account created! Please sign in with your new credentials.');
                    setMode('signin');
                    // Clear sensitive fields
                    setPassword('');
                    setConfirmPassword('');
                    setFieldErrors({});
                }
            }
        } catch (err) {
            console.error('[SIGNUP_ERROR]', err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const switchMode = () => {
        setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
        setName('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setFieldErrors({});
    };

    // helper to clear field error when user edits the field
    const clearFieldError = (field: string) =>
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });

    return (
        <div className="w-full max-w-md">
            {/* Brand Header */}
            <div className="text-center mb-8 flex flex-col items-center">
                <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
                    <Image src="/logo.png" alt="Logo" width={96} height={96} className="h-24 w-auto object-contain mb-2 drop-shadow-md" />
                    <Image src="/brand.png" alt="ezboarding" width={128} height={32} className="h-8 w-auto object-contain" />
                </Link>
                <p className="text-gray-500 text-sm mt-4 font-medium">Student housing made simple</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isSignIn ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    {isSignIn ? 'Sign in to manage your property listings.' : 'Join ezboarding to reach thousands of students.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isSignIn && (
                        <div className="space-y-1">
                            <Label htmlFor="name" className="sr-only">Full Name</Label>
                            <div className="relative">
                                <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                                    required
                                    disabled={isLoading}
                                    className="pl-10 h-10 rounded-xl"
                                />
                            </div>
                            {fieldErrors.name && <p className="text-sm text-red-500 mt-1">{fieldErrors.name[0]}</p>}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="email" className="sr-only">Email Address</Label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                                required
                                disabled={isLoading}
                                autoComplete="email"
                                className="pl-10 h-10 rounded-xl"
                            />
                        </div>
                        {fieldErrors.email && <p className="text-sm text-red-500 mt-1">{fieldErrors.email[0]}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password" className="sr-only">Password</Label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                                required
                                minLength={8}
                                disabled={isLoading}
                                className="pl-10 pr-10 h-10 rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {fieldErrors.password && <p className="text-sm text-red-500 mt-1">{fieldErrors.password[0]}</p>}
                    </div>

                    {!isSignIn && (
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                                    required
                                    disabled={isLoading}
                                    className="pl-10 h-10 rounded-xl"
                                />
                            </div>
                            {fieldErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword[0]}</p>}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-10 rounded-xl font-bold" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isSignIn ? 'Signing in…' : 'Creating account…'}
                            </>
                        ) : isSignIn ? (
                            'Sign In'
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>



                <p className="mt-8 text-center text-sm text-gray-500">
                    {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={switchMode}
                        className="text-blue-600 hover:underline font-bold"
                    >
                        {isSignIn ? 'Create one' : 'Sign in'}
                    </button>
                </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>
                <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> &{' '}
                    <Link href="/privacy" className="underline hover:text-gray-600">Privacy</Link>
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 px-4 py-12">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-gray-500 font-medium">Loading EZBoarding Secure Auth...</p>
                </div>
            }>
                <SignInForm />
            </Suspense>
        </div>
    );
}