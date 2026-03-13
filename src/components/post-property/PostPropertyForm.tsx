/**
 * src/components/post-property/PostPropertyForm.tsx
 * The Complete 6-Step Landlord Wizard with Dynamic University Selection.
 */
"use client";

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, PropertyFormValues } from '@/lib/validations/property';
import { University } from '@/types';
import { createProperty } from '@/lib/actions/createProperty';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Plus, Trash2, Check, Upload, MessageSquare } from 'lucide-react';

const STEPS = [
    { id: 'basics', title: 'Basic Details', fields: ['title', 'description', 'propertyType', 'genderRestriction'] },
    { id: 'pricing', title: 'Pricing', fields: ['pricePerMonth', 'rentNegotiable', 'keyMoneyMonths', 'utilitiesIncluded'] },
    { id: 'location', title: 'Location', fields: ['address', 'closestUniversities'] },
    { id: 'layout', title: 'Layout', fields: ['totalRooms', 'occupancySetup', 'bedsPerRoom', 'totalBathrooms', 'bathroomType'] },
    { id: 'amenities', title: 'Amenities', fields: ['furnitureStatus', 'mealsIncluded', 'amenityIds', 'houseRules'] },
    { id: 'media', title: 'Media & Contact', fields: ['photos', 'contactNumber', 'isWhatsApp'] },
];

// Adding props to accept server-fetched universities
interface PostPropertyFormProps {
    universities: University[];
    amenities: { id: string; name: string; category: string }[];
}

export default function PostPropertyForm({ universities, amenities }: PostPropertyFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submissionRef = useRef(false); // <-- Guard against double-submit
    const router = useRouter();

    const form = useForm<PropertyFormValues>({
        // Note: `as any` is necessary due to a known type inference issue between
        // @hookform/resolvers and Zod v4's z.coerce (infers `unknown` instead of `number`).
        // Runtime validation works correctly — this is purely a TS limitation.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(propertySchema) as any,
        mode: 'onChange',
        defaultValues: {
            amenityIds: [],
            photos: [], // In a real app, this would be File objects or URLs
            utilitiesIncluded: true,
            mealsIncluded: false,
            isWhatsApp: false,
            bathroomType: 'SHARED',
            closestUniversities: [{ universityId: '', facultyId: '', distanceKm: 0 }],
        },
    });

    const { fields: uniFields, append: appendUni, remove: removeUni } = useFieldArray({
        control: form.control,
        name: "closestUniversities",
    });

    const handleNext = async () => {
        const fieldsToValidate = STEPS[currentStep].fields as (keyof PropertyFormValues)[];
        const isStepValid = await form.trigger(fieldsToValidate);

        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmit = async (data: PropertyFormValues) => {
        // Guard against double submission
        if (submissionRef.current) return;
        submissionRef.current = true;
        setIsSubmitting(true);

        try {
            const spots = data.occupancySetup === 'SINGLE'
                ? data.totalRooms
                : data.totalRooms * (data.bedsPerRoom || 1);

            const result = await createProperty({
                ...data,
                lat: data.lat ?? undefined,
                lng: data.lng ?? undefined,
                totalSpots: spots,
                availableSpots: spots,
            });

            if (result.success) {
                toast.success("Property submitted! Our team will review it shortly.");
                router.push('/dashboard');
                // Note: We intentionally DO NOT reset submissionRef here to prevent double clicks during the redirect
            } else {
                toast.error(result.error || "Failed to submit property. Please try again.");
                submissionRef.current = false; // Allow retry on error
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
            submissionRef.current = false; // Allow retry on error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const currentPhotos = form.getValues('photos');
            const newPhotoUrls = [...currentPhotos];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Get presigned URL
                const presignRes = await fetch('/api/upload/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type,
                        fileSize: file.size,
                    }),
                });

                if (!presignRes.ok) throw new Error('Failed to get presigned URL');

                const { url, key } = await presignRes.json();

                // Upload to R2 directly
                const uploadRes = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });

                if (!uploadRes.ok) throw new Error('Failed to upload file');

                // Assume R2 public URL pattern
                // Use NEXT_PUBLIC_R2_PUBLIC_URL from env
                const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-placeholder.r2.dev';
                newPhotoUrls.push(`${baseUrl}/${key}`);
            }

            form.setValue('photos', newPhotoUrls, { shouldValidate: true });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Image upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* HEADER & BREADCRUMBS */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Post a Property</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base mb-4 font-medium text-gray-400">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <span className={`${currentStep === index ? 'text-primary font-bold' : currentStep > index ? 'text-gray-900' : ''}`}>
                                {currentStep === index ? `[${index + 1}] ` : `${index + 1}. `}{step.title}
                            </span>
                            {index < STEPS.length - 1 && <span>&gt;</span>}
                        </React.Fragment>
                    ))}
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">

                    {/* STEP 1: BASICS */}
                    {currentStep === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-700">Listing Title *</FormLabel>
                                    <FormControl><Input placeholder="e.g., Spacious Annex near University Main Gate" className="h-12" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-700">Description *</FormLabel>
                                    <FormControl><Textarea placeholder="Describe the place, distance to bus routes, etc." className="min-h-[120px]" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="propertyType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Property Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["BOARDING_ROOM", "HOSTEL", "ANNEX", "HOUSE"].map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="genderRestriction" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Suitable For *</FormLabel>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { value: 'BOYS_ONLY', label: 'Boys Only' },
                                                { value: 'GIRLS_ONLY', label: 'Girls Only' },
                                                { value: 'NO_RESTRICTION', label: 'Any Gender' },
                                            ].map(opt => (
                                                <Button key={opt.value} type="button" variant={field.value === opt.value ? "default" : "outline"} onClick={() => field.onChange(opt.value)} className="h-12">
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PRICING */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="pricePerMonth" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Monthly Rent (Rs.) *</FormLabel>
                                        <FormControl><Input type="number" className="h-12" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="rentNegotiable" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Rent Negotiability *</FormLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["FIXED", "NEGOTIABLE"].map(opt => (
                                                <Button key={opt} type="button" variant={field.value === opt ? "default" : "outline"} onClick={() => field.onChange(opt)} className="h-12">{opt}</Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="keyMoneyMonths" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-700">Advance / Key Money *</FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {[0, 1, 2, 3, 6].map(m => (
                                            <Button key={m} type="button" variant={field.value === m ? "default" : "outline"} onClick={() => field.onChange(m)}>
                                                {m === 0 ? 'None' : `${m} Months`}
                                            </Button>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {/* STEP 3: LOCATION (Real Multi-Uni Selection) */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-700">Street Address *</FormLabel>
                                    <FormControl><Input placeholder="Full Address" className="h-12" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
                                <FormLabel className="font-bold text-gray-900">Nearby Universities & Faculties *</FormLabel>
                                {uniFields.map((field, index) => {
                                    const watchedUniId = form.watch(`closestUniversities.${index}.universityId`);
                                    const facultyOptions = universities.find(u => u.id === watchedUniId)?.faculties || [];
                                    return (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-white rounded-lg border shadow-sm items-end">
                                            <FormField control={form.control} name={`closestUniversities.${index}.universityId`} render={({ field: f }) => (
                                                <FormItem className="md:col-span-4">
                                                    <FormLabel className="text-xs">University</FormLabel>
                                                    <FormControl>
                                                        <SearchableSelect
                                                            options={universities.map(u => ({ value: u.id, label: u.name }))}
                                                            value={f.value}
                                                            onValueChange={(val) => { f.onChange(val); form.setValue(`closestUniversities.${index}.facultyId`, ''); }}
                                                            placeholder="Select Uni"
                                                            searchPlaceholder="Search university..."
                                                            className="h-10"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`closestUniversities.${index}.facultyId`} render={({ field: f }) => (
                                                <FormItem className="md:col-span-5">
                                                    <FormLabel className="text-xs">Faculty / Campus</FormLabel>
                                                    <FormControl>
                                                        <SearchableSelect
                                                            options={facultyOptions.map(fac => ({ value: fac.id, label: fac.name }))}
                                                            value={f.value}
                                                            onValueChange={f.onChange}
                                                            placeholder="Select Faculty"
                                                            searchPlaceholder="Search faculty..."
                                                            className="h-10"
                                                            disabled={!watchedUniId}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`closestUniversities.${index}.distanceKm`} render={({ field: f }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-xs">Dist (km)</FormLabel>
                                                    <FormControl><Input type="number" step="0.1" {...f} value={f.value || ''} onChange={e => f.onChange(Number(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" className="md:col-span-1 text-red-500 hover:text-red-700" onClick={() => removeUni(index)} disabled={uniFields.length === 1}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                                <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendUni({ universityId: '', facultyId: '', distanceKm: 0 })}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Another University
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: LAYOUT */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="totalRooms" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Total Rooms</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="totalBathrooms" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Total Bathrooms</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="occupancySetup" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Occupancy *</FormLabel>
                                    <div className="flex gap-4">
                                        {["SINGLE", "SHARED"].map(opt => (
                                            <Button key={opt} type="button" variant={field.value === opt ? "default" : "outline"} onClick={() => field.onChange(opt)} className="flex-1">{opt}</Button>
                                        ))}
                                    </div>
                                    <FormMessage />
                                    {form.watch('occupancySetup') === 'SHARED' && (
                                        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                            <FormField control={form.control} name="bedsPerRoom" render={({ field: f }) => (
                                                <FormItem><FormLabel className="text-sm">Beds per room</FormLabel><FormControl><Input type="number" {...f} value={f.value || ''} onChange={e => f.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                    )}
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="bathroomType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Bathroom Type *</FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'ATTACHED', label: 'Attached (En-suite)' },
                                            { value: 'SHARED', label: 'Shared / Common' },
                                        ].map(opt => (
                                            <Button key={opt.value} type="button" variant={field.value === opt.value ? 'default' : 'outline'} onClick={() => field.onChange(opt.value)} className="h-12">
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {/* STEP 5: AMENITIES */}
                    {currentStep === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="furnitureStatus" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Furniture *</FormLabel>
                                        <div className="flex gap-2">
                                            {["FURNISHED", "UNFURNISHED"].map(opt => (
                                                <Button key={opt} type="button" variant={field.value === opt ? "default" : "outline"} onClick={() => field.onChange(opt)} className="flex-1 text-xs">{opt}</Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="mealsIncluded" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Meals Provided? *</FormLabel>
                                        <div className="flex gap-2">
                                            <Button type="button" variant={field.value ? "default" : "outline"} onClick={() => field.onChange(true)} className="flex-1">Yes</Button>
                                            <Button type="button" variant={!field.value ? "default" : "outline"} onClick={() => field.onChange(false)} className="flex-1">No</Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="amenityIds" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Amenities</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {amenities.map((amenity) => {
                                            const selected = field.value?.includes(amenity.id);
                                            return (
                                                <button
                                                    key={amenity.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = field.value || [];
                                                        field.onChange(
                                                            selected
                                                                ? current.filter((id) => id !== amenity.id)
                                                                : [...current, amenity.id]
                                                        );
                                                    }}
                                                    className={`p-3 text-left border rounded-xl text-sm transition-all ${selected ? 'border-primary bg-primary/5 font-bold text-primary' : 'bg-white'}`}
                                                >
                                                    <div>{amenity.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{amenity.category}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="houseRules" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">House Rules</FormLabel>
                                    <FormControl><Textarea placeholder="e.g., No loud music after 10pm, No smoking inside, Visitors allowed until 8pm..." className="min-h-[100px]" {...field} /></FormControl>
                                    <FormDescription>Optional — let tenants know about any rules.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {/* STEP 6: MEDIA & CONTACT */}
                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-10 border-2 border-dashed rounded-2xl bg-gray-50 flex flex-col items-center text-center relative overflow-hidden">
                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="font-bold text-gray-700">Drag and drop photos here</p>
                                <p className="text-xs text-gray-500 mt-1">Upload at least 3 photos (Bedroom, Bathroom, Kitchen)</p>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg, image/png, image/webp"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />

                                {isUploading ? (
                                    <Button type="button" variant="secondary" className="mt-4" disabled>Uploading...</Button>
                                ) : (
                                    <Button type="button" variant="secondary" className="mt-4 pointer-events-none">Select Photos</Button>
                                )}

                                {form.watch('photos').length > 0 && <p className="mt-2 text-green-600 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> {form.watch('photos').length} Photos Uploaded</p>}
                                <FormMessage>{form.formState.errors.photos?.message}</FormMessage>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Primary Contact Number *</FormLabel>
                                        <FormControl><Input placeholder="+94 7X XXX XXXX" className="h-12" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="isWhatsApp" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 space-y-0 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <FormControl><input type="checkbox" className="w-5 h-5 accent-green-600" checked={field.value} onChange={field.onChange} /></FormControl>
                                        <div className="flex items-center gap-2 text-green-700 font-bold">
                                            <MessageSquare className="w-4 h-4" /> Available on WhatsApp
                                        </div>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}

                    {/* FOOTER BUTTONS */}
                    <div className="mt-10 pt-6 border-t flex justify-between">
                        <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 0} className="font-bold h-12 px-8">BACK</Button>
                        {currentStep < STEPS.length - 1 ? (
                            <Button type="button" onClick={handleNext} className="h-12 px-10 font-bold bg-primary hover:bg-primary/90">NEXT STEP</Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting || isUploading} className="h-12 px-10 font-bold bg-green-600 hover:bg-green-700">
                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT LISTING'}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
