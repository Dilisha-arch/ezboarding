import React from 'react';
import PhotoGallery from './PhotoGallery';

interface PropertyImageGalleryProps {
    coverImage: string | null;
    images: string[];
    title: string;
}

export default function PropertyImageGallery({ coverImage, images, title }: PropertyImageGalleryProps) {
    const allPhotos: string[] = [];
    
    if (coverImage) {
        allPhotos.push(coverImage);
    }
    
    if (images && images.length > 0) {
        // filter out duplicates if the coverImage is also in the images array
        const uniqueImages = images.filter(img => img !== coverImage);
        allPhotos.push(...uniqueImages);
    }

    return <PhotoGallery photos={allPhotos} alt={title} priority={true} />;
}
