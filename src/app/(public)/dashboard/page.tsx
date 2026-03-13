import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Building, Users, Eye, Plus, Edit, CheckCircle2, AlertTriangle } from 'lucide-react';
import { auth } from '@/auth';
import { getLandlordProperties, getLandlordStats } from '@/lib/data/landlord/dashboard';

const statusStyles: Record<string, string> = {
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    SUSPENDED: 'bg-orange-50 text-orange-700 border-orange-200',
    ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default async function LandlordDashboardPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'LANDLORD') {
        redirect('/auth/signin?callbackUrl=%2Fdashboard');
    }

    const [properties, stats] = await Promise.all([
        getLandlordProperties(session.user.id),
        getLandlordStats(session.user.id),
    ]);

    return (
        <main className="bg-gray-50 min-h-screen pt-24 pb-8 md:pt-28">
            <div className="bodim-container max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Welcome back</h1>
                        <p className="text-gray-500 mt-1">Manage your properties and track your performance.</p>
                    </div>
                    <Link href="/post-property" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 shadow-sm">
                        <Plus className="w-5 h-5" /> Post New Property
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Building className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">Active Listings</p>
                            <p className="text-3xl font-extrabold text-gray-900">{stats.activeListings}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                            <Eye className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">Total Profile Views</p>
                            <p className="text-3xl font-extrabold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">Total Inquiries</p>
                            <p className="text-3xl font-extrabold text-gray-900">{stats.totalInquiries.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Your Properties</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Property Details</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold">Price</th>
                                    <th className="p-4 font-bold">Performance</th>
                                    <th className="p-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {properties.map((prop) => (
                                    <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Image
                                                    src={prop.images[0]?.url ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200'}
                                                    alt={prop.title}
                                                    width={64}
                                                    height={64}
                                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                                                />
                                                <div>
                                                    <Link href={`/listing/${prop.id}`} className="font-bold text-gray-900 hover:text-primary line-clamp-1">
                                                        {prop.title}
                                                    </Link>
                                                    <span className="text-xs text-gray-500 font-medium">{prop.nearbyUniversities[0]?.university.shortName ?? 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusStyles[prop.status] ?? statusStyles.ARCHIVED}`}>
                                                {prop.availableSpots > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                                {prop.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-sm font-bold text-gray-900">
                                            Rs. {prop.pricePerMonth.toLocaleString()}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {prop.views} views</span>
                                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {prop.inquiryClicks} inquiries</span>
                                            </div>
                                        </td>

                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/dashboard/edit/${prop.id}`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Listing">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {properties.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            You haven&apos;t posted any properties yet. Click &quot;Post New Property&quot; to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
}
