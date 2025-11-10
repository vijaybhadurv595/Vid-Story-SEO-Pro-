import React, { useState } from 'react';
import type { GeneratedContent } from '../types';
import { SeoScoreGauge } from './SeoScoreGauge';
import { CopyButton } from './CopyButton';
import { TrashIcon } from './icons/TrashIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ChatBubbleBottomCenterTextIcon } from './icons/ChatBubbleBottomCenterTextIcon';
import { TagIcon } from './icons/TagIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface OutputDisplayProps {
    content: GeneratedContent;
    onClear: () => void;
}

const OutputSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-slate-800/80 border border-slate-700/50 p-4 rounded-lg shadow-md ${className}`}>
        <h3 className="text-lg sm:text-xl font-bold text-cyan-400 mb-3">{title}</h3>
        {children}
    </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, onClear }) => {
    const initialTab = content.isIdea && content.generatedStory ? 'story' : 'titles';
    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs = [
        ...(content.isIdea && content.generatedStory ? [{ id: 'story', label: 'Story', icon: DocumentTextIcon }] : []),
        { id: 'titles', label: 'Titles', icon: TrophyIcon },
        { id: 'descriptions', label: 'Descriptions', icon: ChatBubbleBottomCenterTextIcon },
        { id: 'tags', label: 'Tags & #', icon: TagIcon },
        { id: 'thumbnails', label: 'Thumbnails', icon: PhotoIcon },
    ];

    const TabContent = () => {
        switch (activeTab) {
            case 'story':
                return (
                    <div className="relative p-1">
                        <CopyButton textToCopy={content.generatedStory} />
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content.generatedStory}</p>
                    </div>
                );
            case 'titles':
                return (
                    <ul className="space-y-3">
                        {content.seoTitles.map((title, index) => (
                            <li key={index} className="flex items-start bg-slate-900/50 p-3 rounded-md transition-colors hover:bg-slate-800/60">
                                <span className="text-cyan-400 font-bold mr-3">{index + 1}.</span>
                                <span className="flex-1 text-slate-300">{title}</span>
                                <CopyButton textToCopy={title} />
                            </li>
                        ))}
                    </ul>
                );
            case 'descriptions':
                return (
                    <div className="space-y-6">
                        <OutputSection title="Short Description" className="!p-0 !border-none !bg-transparent !shadow-none">
                            <div className="relative bg-slate-900/50 p-4 rounded-md">
                                <CopyButton textToCopy={content.seoDescription.short} />
                                <p className="text-slate-300">{content.seoDescription.short}</p>
                            </div>
                        </OutputSection>
                        <OutputSection title="Long Description" className="!p-0 !border-none !bg-transparent !shadow-none">
                            <div className="relative bg-slate-900/50 p-4 rounded-md">
                                <CopyButton textToCopy={content.seoDescription.long} />
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content.seoDescription.long}</p>
                            </div>
                        </OutputSection>
                    </div>
                );
            case 'tags':
                return (
                    <div className="space-y-6">
                         <OutputSection title="Tags" className="!p-0 !border-none !bg-transparent !shadow-none">
                            <div className="relative bg-slate-900/50 p-4 rounded-md">
                                <CopyButton textToCopy={content.tags.join(', ')} />
                                <div className="flex flex-wrap gap-2">
                                    {content.tags.map((tag, index) => (
                                        <span key={index} className="bg-slate-700 text-slate-300 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </OutputSection>
                        <OutputSection title="Hashtags" className="!p-0 !border-none !bg-transparent !shadow-none">
                             <div className="relative bg-slate-900/50 p-4 rounded-md">
                                <CopyButton textToCopy={content.hashtags.join(' ')} />
                                <div className="flex flex-wrap gap-3">
                                    {content.hashtags.map((tag, index) => (
                                        <span key={index} className="text-purple-400 font-medium">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </OutputSection>
                    </div>
                );
            case 'thumbnails':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {content.thumbnailIdeas.map((thumbnail, index) => (
                            <div key={index} className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-slate-600">
                                {thumbnail.imageUrl ? (
                                    <img 
                                        src={thumbnail.imageUrl} 
                                        alt={thumbnail.idea} 
                                        className="w-full aspect-video object-cover bg-slate-700"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full aspect-video bg-slate-700 flex items-center justify-center text-center p-4">
                                        <div>
                                            <PhotoIcon className="w-10 h-10 text-slate-500 mx-auto" />
                                            <p className="text-xs text-slate-500 mt-2">Image generation failed</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-3">
                                    <p className="text-slate-300 text-sm leading-relaxed">{thumbnail.idea}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-slate-100">Generated Results</h2>
                <button
                    onClick={onClear}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-rose-500 transition-colors"
                    aria-label="Clear all results"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>Clear All</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg flex flex-col justify-center items-center text-center border border-slate-700/50">
                    <h3 className="text-base sm:text-lg font-bold text-slate-400 mb-2">Detected Language</h3>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">{content.languageDetection.language}</p>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                        <div 
                            className="bg-cyan-500 h-1.5 rounded-full" 
                            style={{ width: `${content.languageDetection.confidence}%` }}
                            title={`Confidence: ${content.languageDetection.confidence}%`}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Confidence: {content.languageDetection.confidence}%</p>
                </div>
                <SeoScoreGauge score={content.seoScore.score} justification={content.seoScore.justification} />
            </div>
            
            <div className="bg-slate-800 border border-slate-700/50 rounded-lg shadow-lg">
                <div className="border-b border-slate-700">
                    <nav className="flex flex-wrap -mb-px px-4" aria-label="Tabs">
                         {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    ${activeTab === tab.id
                                        ? 'border-cyan-400 text-cyan-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                    }
                                    group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 mr-4
                                `}
                                aria-current={activeTab === tab.id ? 'page' : undefined}
                            >
                                <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-5 min-h-[200px] transition-opacity duration-300 animate-fade-in">
                    <TabContent />
                </div>
            </div>
        </div>
    );
};