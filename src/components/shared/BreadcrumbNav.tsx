import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbNavProps {
    items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
    return (
        <nav className="flex text-sm text-gray-500 my-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    
                    return (
                        <li key={index} className="flex items-center">
                            {item.href && !isLast ? (
                                <Link 
                                    href={item.href}
                                    className="hover:text-primary transition-colors focus:outline-none"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={`font-medium ${isLast ? 'text-gray-900 truncate max-w-[200px] sm:max-w-[400px]' : ''}`}>
                                    {item.label}
                                </span>
                            )}
                            
                            {!isLast && (
                                <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-gray-400" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
