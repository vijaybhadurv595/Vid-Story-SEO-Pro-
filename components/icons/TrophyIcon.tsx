
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 009 0zM19.5 17.25h-15a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m0-9V3.75m-3 6h6" />
        <path strokeLinecap="round" d="M9 2.25h6" />
    </svg>
);