
import React from 'react';

export const TextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v18M3 3h9m-9 18h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3h4.5v18h-4.5" />
    </svg>
);
