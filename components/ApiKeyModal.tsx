import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    currentApiKey: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
    const [keyInput, setKeyInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setKeyInput(currentApiKey || '');
            setError('');
        }
    }, [currentApiKey, isOpen]);


    const handleSave = () => {
        if (keyInput.trim().length < 30) {
            setError('Please enter a valid API key. It should be at least 30 characters long.');
            return;
        }
        setError('');
        onSave(keyInput.trim());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg border border-slate-700 m-4">
                <h2 id="modal-title" className="text-2xl font-bold text-slate-100">Set Your API Key</h2>
                <p className="mt-2 text-slate-400">
                    You need a Google AI API key to use this application. You can get one from the{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                        Google AI Studio
                    </a>.
                </p>
                <div className="mt-6">
                    <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300">
                        Google Gemini API Key
                    </label>
                    <input
                        id="api-key-input"
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Enter your API key here"
                        className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
                        aria-describedby="api-key-error"
                    />
                    {error && <p id="api-key-error" className="mt-2 text-sm text-red-400">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors"
                    >
                        Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};
