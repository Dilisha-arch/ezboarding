import React from 'react';
import * as Icons from 'lucide-react';

interface AmenityBadgeProps {
    name: string;
    icon?: string | null;
}

export default function AmenityBadge({ name, icon }: AmenityBadgeProps) {
    // Dynamically render icon from lucide-react if provided, otherwise fallback
    let IconComponent = Icons.CheckCircle;

    if (icon && icon in Icons) {
        IconComponent = Icons[icon as keyof typeof Icons] as typeof Icons.CheckCircle;
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <IconComponent className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">{name}</span>
        </div>
    );
}
