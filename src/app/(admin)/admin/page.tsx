/**
 * src/app/(admin)/admin/page.tsx
 * Admin Dashboard - Key platform metrics and recent activity.
 */
import React from 'react';
import { 
    getDashboardStats, 
    getRecentAdminActions, 
    getListingsByUniversity 
} from '@/lib/data/admin/analytics';
import { requireAdmin } from '@/lib/actions/admin/guard';
import { Users, Building2, Inbox, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mark as dynamic since it relies on real-time database stats
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    await requireAdmin();

    // Fetch all analytics data in parallel
    const [stats, recentActions, universityStats] = await Promise.all([
        getDashboardStats(),
        getRecentAdminActions(10), // Limit to 10 most recent
        getListingsByUniversity(),
    ]);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Platform overview and moderation activity.</p>
            </div>

            {/* TOP METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Landlords</p>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.totalLandlords.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Properties</p>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.totalProperties.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    {stats.pendingReview > 0 && (
                        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                    )}
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.pendingReview.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved Today</p>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.approvedToday.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rejected Today</p>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.rejectedToday.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* RECENT ACTIVITY LOG */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Recent Audit Log</h2>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-0">
                        {recentActions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No recent admin actions recorded.</div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="p-4 font-bold">Action</th>
                                        <th className="p-4 font-bold">Property</th>
                                        <th className="p-4 font-bold">Admin</th>
                                        <th className="p-4 font-bold text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentActions.map((action) => (
                                        <tr key={action.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                    ${action.action === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                      action.action === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                      action.action === 'SUSPENDED' ? 'bg-gray-100 text-gray-800' :
                                                      action.action === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                                                      'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {action.action}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-gray-900 max-w-[200px] truncate" title={action.propertyTitle}>
                                                {action.propertyTitle}
                                                {action.note && <p className="text-xs text-gray-500 font-normal truncate mt-0.5" title={action.note}>{action.note}</p>}
                                            </td>
                                            <td className="p-4 text-gray-600">{action.adminName}</td>
                                            <td className="p-4 text-right text-gray-500 text-xs whitespace-nowrap">
                                                {formatDistanceToNow(new Date(action.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* DISTRIBUTION BY UNIVERSITY */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Coverage (Approved)</h2>
                        <p className="text-xs text-gray-500 mt-1">Listings per University Zone</p>
                    </div>
                    
                    <div className="p-5 flex-1 overflow-y-auto space-y-4">
                        {universityStats.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm">No coverage data available.</div>
                        ) : (
                            universityStats.map((stat, i) => {
                                // Calculate percentage relative to the highest count for the bar width
                                const maxCount = Math.max(...universityStats.map(s => s.count));
                                const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                                
                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{stat.universityName}</span>
                                            <span className="font-bold text-gray-900">{stat.count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
