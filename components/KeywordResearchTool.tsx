
import React, { useState, useCallback } from 'react';
import { generateKeywordSuggestions } from '../services/geminiService';
import type { KeywordSuggestion, GroundingChunk } from '../types';
import { Loader } from './Loader';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { CopyButton } from './CopyButton';
import { LinkIcon } from './icons/LinkIcon';

const KeywordResearchTool: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError("Please enter a topic to research.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        setSources([]);
        setHasSearched(true);

        try {
            const { suggestions: result, sources: groundingSources } = await generateKeywordSuggestions(topic);
            const filteredResults = result.filter(
                (keyword) => keyword.volume === 'High' && keyword.competition === 'Low'
            );
            setSuggestions(filteredResults);
            setSources(groundingSources);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const getBadgeClass = (level: 'High' | 'Medium' | 'Low') => {
        switch (level) {
            case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-slate-700 text-slate-300 border-slate-600';
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <Loader />;
        }
        if (error) {
            return <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">{error}</div>;
        }
        if (suggestions.length > 0) {
            return (
                <>
                    <div className="bg-slate-800 border border-slate-700/50 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                        <h3 className="p-4 text-md font-semibold text-slate-300 bg-slate-900/50">
                            Showing keywords with <span className="font-bold text-emerald-400">Low Competition</span> & <span className="font-bold text-red-400">High Volume</span>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Keyword</th>
                                        <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">Volume</th>
                                        <th className="p-4 text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">Competition</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {suggestions.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-700/40 transition-colors duration-200 group">
                                            <td className="p-4 text-slate-300 relative">
                                                <span>{item.keyword}</span>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CopyButton textToCopy={item.keyword} />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBadgeClass(item.volume)}`}>
                                                    {item.volume}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBadgeClass(item.competition)}`}>
                                                    {item.competition}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {sources.length > 0 && (
                        <div className="mt-6 animate-fade-in">
                            <h4 className="text-md font-semibold text-slate-300 mb-3 flex items-center">
                                <LinkIcon className="w-5 h-5 mr-2 text-slate-400" />
                                Sources from Google Search
                            </h4>
                            <ul className="space-y-2 text-sm list-disc list-inside bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                                {sources.map((source, index) => (
                                    source.web && (
                                        <li key={index}>
                                            <a 
                                                href={source.web.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                                                title={source.web.uri}
                                            >
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            );
        }
        if (hasSearched) {
            return (
               <div className="flex items-center justify-center h-full bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8 animate-fade-in">
                   <div className="text-center">
                       <div className="flex justify-center items-center mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800">
                          <MagnifyingGlassIcon className="h-8 w-8 text-slate-500" />
                       </div>
                       <h3 className="mt-4 text-lg font-medium text-slate-300">No Keywords Found</h3>
                       <p className="mt-1 text-sm text-slate-500">Could not find keywords with high volume and low competition. Try a broader topic.</p>
                   </div>
               </div>
           );
       }
        return (
            <div className="flex items-center justify-center h-full bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8 animate-fade-in">
                <div className="text-center">
                    <div className="flex justify-center items-center mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800">
                       <MagnifyingGlassIcon className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-300">Your keyword results will appear here</h3>
                    <p className="mt-1 text-sm text-slate-500">Enter a topic and discover high-potential keywords.</p>
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
                            Keyword Research Tool
                        </h2>
                        <label htmlFor="topic-input" className="block text-sm font-medium text-slate-400 mb-2">
                            Enter a topic or seed keyword to find related long-tail keywords.
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                id="topic-input"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., 'vintage camera restoration'"
                                className="flex-grow w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !topic.trim()}
                                className="flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-md hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                        Find Keywords
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

export default KeywordResearchTool;
