
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CopyButtonProps {
    textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 p-2 bg-slate-700/50 rounded-md hover:bg-slate-600/70 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
            aria-label="Copy to clipboard"
        >
            {copied ? (
                <CheckIcon className="w-5 h-5 text-emerald-400" />
            ) : (
                <ClipboardIcon className="w-5 h-5 text-slate-400" />
            )}
        </button>
    );
};