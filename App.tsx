
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { Loader } from './components/Loader';
import { Logo } from './components/icons/Logo';
import KeywordResearchTool from './components/KeywordResearchTool';
import { ThumbnailMakerTool } from './components/ThumbnailMakerTool';
import { VideoMakerTool } from './components/VideoMakerTool';

import type { GeneratedContent, VideoCategory, VideoLanguage } from './types';
import { generateSeoContent } from './services/geminiService';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('generator');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

    const handleFormSubmit = async (
        inputData: { inputText: string; videoFile: File | null },
        category: VideoCategory,
        language: VideoLanguage,
        isThinkingMode: boolean
    ) => {
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);

        try {
            const content = await generateSeoContent(inputData, category, language, isThinkingMode);
            setGeneratedContent(content);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setGeneratedContent(null);
        setError(null);
    };

    const tabs = [
        { id: 'generator', label: 'SEO Pack Generator' },
        { id: 'keywords', label: 'Keyword Research' },
        { id: 'thumbnails', label: 'Thumbnail Maker' },
        { id: 'video', label: 'Video Maker' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'generator':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                        <div className="lg:min-h-[750px] relative">
                            {isLoading && <Loader />}
                            {error && !isLoading && (
                                <div className="flex items-center justify-center h-full bg-red-900/50 border border-red-700 text-red-300 p-8 rounded-lg animate-fade-in">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}
                            {generatedContent && !isLoading && (
                                <OutputDisplay content={generatedContent} onClear={handleClear} />
                            )}
                            {!isLoading && !error && !generatedContent && (
                                <div className="flex items-center justify-center h-full bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8">
                                    <div className="text-center">
                                        <div className="flex justify-center items-center mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800">
                                           <Logo className="h-8 w-8" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-medium text-slate-300">Your results will appear here</h3>
                                        <p className="mt-1 text-sm text-slate-500">Fill out the form to generate your SEO pack.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'keywords':
                return <KeywordResearchTool />;
            case 'thumbnails':
                return <ThumbnailMakerTool />;
            case 'video':
                return <VideoMakerTool />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-900 text-slate-200 min-h-screen font-sans">
            <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <Logo className="h-8 w-8" />
                            <h1 className="text-xl font-bold text-slate-100 whitespace-nowrap">
                                VidStory SEO Pro
                            </h1>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6 border-b border-slate-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    ${activeTab === tab.id
                                        ? 'border-cyan-400 text-cyan-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                    }
                                    whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="animate-fade-in">
                    {renderTabContent()}
                </div>
            </main>

            <footer className="text-center p-4 mt-8 text-slate-500 text-sm">
                Powered by Google Gemini
            </footer>
        </div>
    );
};

export default App;
