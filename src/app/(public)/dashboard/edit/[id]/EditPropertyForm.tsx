"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Home, DollarSign, AlertTriangle } from 'lucide-react';
import { quickUpdateProperty } from '@/lib/actions/updateProperty';
import { PropertyType } from '@prisma/client';
import { toast } from 'sonner'; // <-- 1. Import sonner instead of react-hot-toast

type PropertyData = {
    id: string;
    title: string;
    description: string;
    pricePerMonth: number;
    keyMoneyMonths: number;
    availableSpots: number;
    totalSpots: number;
    status: string;
    propertyType: PropertyType;
};

export default function EditPropertyForm({ property }: { property: PropertyData }) {
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    // Note: We completely removed the `error` state variable here!

    const [formData, setFormData] = useState({
        title: property.title,
        description: property.description,
        pricePerMonth: property.pricePerMonth,
        keyMoneyMonths: property.keyMoneyMonths,
        availableSpots: property.availableSpots,
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // 2. Trigger a loading toast and save its ID
        const toastId = toast.loading('Saving changes...');

        try {
            const result = await quickUpdateProperty(property.id, formData);

            if (!result.success) {
                // 3. Replace loading toast with error
                toast.error(result.error, { id: toastId });
                setIsSaving(false);
                return;
            }

            // 4. Replace loading toast with success
            toast.success('Property updated successfully!', { id: toastId });
            router.push('/dashboard');
            router.refresh();
        } catch (e) {
            console.error(e);
            toast.error("An unexpected error occurred.", { id: toastId });
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'title' || name === 'description' ? value : Number(value)
        }));
    };

    return (
        <main className="bg-gray-50 min-h-screen pb-20">
            {/* STICKY TOP BAR */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">Edit Property</h1>
                            <p className="text-xs text-gray-500 font-medium hidden sm:block">ID: {property.id} • Status: {property.status}</p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        form="edit-property-form"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-70"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <form id="edit-property-form" onSubmit={handleSave} className="max-w-4xl mx-auto px-4 space-y-8">

                {/* SECTION 1: CRITICAL AVAILABILITY & PRICE */}
                <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                    {formData.availableSpots === 0 && (
                        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs font-bold text-center py-1">
                            Currently marked as Fully Occupied
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6 mt-2">
                        <DollarSign className="w-6 h-6 text-primary" /> Pricing & Availability
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Available Spots</label>
                            <input
                                type="number" name="availableSpots" min={0} max={property.totalSpots} required
                                value={formData.availableSpots} onChange={handleChange}
                                className={`w-full h-12 px-4 rounded-xl border ${formData.availableSpots === 0 ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300 bg-white'}`}
                            />
                            <p className="text-xs text-gray-500 mt-2">Max spots: {property.totalSpots}. Set to 0 to hide from searches.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent (Rs.)</label>
                            <input
                                type="number" name="pricePerMonth" min={1000} step={500} required
                                value={formData.pricePerMonth} onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Key Money (Months)</label>
                            <input
                                type="number" name="keyMoneyMonths" min={0} max={12} required
                                value={formData.keyMoneyMonths} onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white"
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 2: BASIC DETAILS */}
                <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <Home className="w-6 h-6 text-primary" /> Basic Information
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Listing Title</label>
                            <input
                                type="text" name="title" maxLength={120} minLength={10} required
                                value={formData.title} onChange={handleChange}
                                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-2">{formData.title.length}/120 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Property Type (Locked)</label>
                            <div className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center text-gray-500 capitalize">
                                {property.propertyType.replaceAll('_', ' ').toLowerCase()}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description" rows={5} minLength={50} required
                                value={formData.description} onChange={handleChange}
                                className="w-full p-4 rounded-xl border border-gray-300 bg-white resize-y"
                            />
                            <p className="text-xs text-gray-500 mt-2">Minimum 50 characters required.</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: LOCATION & MEDIA LOCK */}
                <section className="bg-gray-100 p-6 md:p-8 rounded-2xl border border-gray-200 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Need to change Location or Photos?</h3>
                    <p className="text-sm text-gray-600 max-w-lg mx-auto">
                        To ensure the security of our platform and prevent fraudulent bait-and-switch listings, updating the physical location or property photos requires a manual review. Please contact support.
                    </p>
                </section>
            </form>
        </main>
    );
}