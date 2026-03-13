import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyForEdit } from '@/lib/data/landlord/dashboard';
import EditPropertyForm from './EditPropertyForm';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: 'Edit Listing - ezboarding Dashboard',
};

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'LANDLORD') {
        notFound();
    }

    const { id } = await params;
    
    try {
        const property = await getPropertyForEdit(id);
        if (!property) {
            notFound();
        }
        
        return <EditPropertyForm property={property} />;
    } catch {
        notFound();
    }
}
