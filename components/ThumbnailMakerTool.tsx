import React, { useState } from 'react';
import { generateFullThumbnail } from '../services/geminiService';
import { Loader } from './Loader';
import { PhotoIcon } from './icons/PhotoIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

export const ThumbnailMakerTool: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError("Please enter a prompt for the thumbnail.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const result = await generateFullThumbnail(prompt);
            setImageUrl(result);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred during image generation.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `thumbnail-${prompt.slice(0, 20).replace(/\s/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        if (isLoading) {
            return <Loader />;
        }
        if (error) {
            return <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">{error}</div>;
        }
        if (imageUrl) {
            return (
                <div className="bg-slate-800 border border-slate-700/50 rounded-lg shadow-lg p-4 animate-fade-in space-y-4">
                    <img 
                        src={imageUrl} 
                        alt={prompt} 
                        className="w-full aspect-video object-cover rounded-md bg-slate-700"
                    />
                    <button
                        onClick={handleDownload}
                        className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white font-bold py-3 px-4 rounded-md hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download Thumbnail
                    </button>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center h-full bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8 animate-fade-in">
                <div className="text-center">
                    <div className="flex justify-center items-center mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800">
                       <PhotoIcon className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-300">Your generated thumbnail will appear here</h3>
                    <p className="mt-1 text-sm text-slate-500">Describe the thumbnail you want to create.</p>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={isLoading}>
                         <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-100">
                            AI Thumbnail Maker
                        </h2>
                        <label htmlFor="thumbnail-prompt" className="block text-sm font-medium text-slate-400 mb-2">
                            Describe the visual elements of your thumbnail. Be descriptive for the best results.
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                id="thumbnail-prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'A scientist looking amazed at a glowing blue potion'"
                                className="flex-grow w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};
