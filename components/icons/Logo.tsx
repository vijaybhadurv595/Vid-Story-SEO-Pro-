
import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M16.5 7.5l-9 9" stroke="url(#grad1)" />
        <path d="M16.5 16.5l-9-9" stroke="url(#grad1)" />
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#grad1)" />
    </svg>
);