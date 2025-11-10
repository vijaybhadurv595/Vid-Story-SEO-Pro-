
import React, { useState, useRef } from 'react';
import { VIDEO_CATEGORIES, VIDEO_LANGUAGES, VIDEO_CATEGORY_TRANSLATIONS, VIDEO_LANGUAGE_TRANSLATIONS } from '../constants';
import type { VideoCategory, VideoLanguage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';


interface InputFormProps {
    onSubmit: (inputData: { inputText: string; videoFile: File | null }, category: VideoCategory, language: VideoLanguage, isThinkingMode: boolean) => void;
    isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
    const [inputText, setInputText] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [category, setCategory] = useState<VideoCategory>(VIDEO_CATEGORIES[0]);
    const [language, setLanguage] = useState<VideoLanguage>(VIDEO_LANGUAGES[0]);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                alert('Please upload a valid video file.');
                return;
            }
            // Gemini API has a file size limit, but a client-side limit provides better UX.
            // 200MB limit
            if (file.size > 200 * 1024 * 1024) { 
                alert('File size is too large. Please upload a video smaller than 200MB.');
                return;
            }
            setVideoFile(file);
            setInputText(''); // Clear text input
        }
    };

    const handleRemoveFile = () => {
        setVideoFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        if (videoFile) {
            handleRemoveFile(); // Clear file if user starts typing
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ inputText, videoFile }, category, language, isThinkingMode);
    };

    const characterCount = inputText.length;
    const isSubmitDisabled = isLoading || (!inputText.trim() && !videoFile);

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700/50 p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
            <fieldset disabled={isLoading}>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1 text-slate-100">1. Provide Your Content</h2>
                    <p className="text-sm text-slate-400">Paste a video idea, a full script, or upload a video file.</p>
                </div>
                
                <div className="relative">
                    <textarea
                        value={inputText}
                        onChange={handleTextChange}
                        placeholder="e.g., 'Tell a story about how a robot saved a kitten' or paste your full video script here..."
                        className="w-full h-48 bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 resize-none"
                        maxLength={15000} // Increased character limit
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                        {characterCount} / 15000
                    </div>
                </div>

                <div className="flex items-center justify-center my-4">
                    <span className="flex-grow h-px bg-slate-700"></span>
                    <span className="mx-4 text-sm font-semibold text-slate-500">OR</span>
                    <span className="flex-grow h-px bg-slate-700"></span>
                </div>

                <div>
                    {videoFile ? (
                        <div className="flex items-center justify-between bg-slate-900 border border-emerald-500/30 rounded-md p-3">
                             <div className="flex items-center space-x-3 overflow-hidden">
                                <VideoCameraIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                <span className="text-sm text-slate-300 truncate font-medium" title={videoFile.name}>
                                    {videoFile.name}
                                </span>
                            </div>
                            <button 
                                onClick={handleRemoveFile} 
                                type="button" 
                                className="p-1 rounded-full hover:bg-slate-700 transition-colors"
                                aria-label="Remove video file"
                            >
                                <XCircleIcon className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <VideoCameraIcon className="w-8 h-8 mb-2 text-slate-500" />
                                <p className="mb-1 text-sm text-slate-400"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-slate-500">Video file (Max 200MB)</p>
                            </div>
                            <input id="video-upload" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="video/*" />
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">2. Choose Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as VideoCategory)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
                        >
                            {VIDEO_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {VIDEO_CATEGORY_TRANSLATIONS[cat]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">3. Choose Language</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as VideoLanguage)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
                        >
                            {VIDEO_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {VIDEO_LANGUAGE_TRANSLATIONS[lang]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <span className="flex-grow flex flex-col pr-4">
                            <span className="text-sm font-medium text-slate-300 flex items-center">
                                <BrainCircuitIcon className="w-5 h-5 mr-2 text-purple-400 flex-shrink-0" />
                                Thinking Mode
                            </span>
                            <span className="text-xs text-slate-500">
                                Slower, but higher-quality results for complex ideas.
                            </span>
                        </span>
                        <button
                            type="button"
                            className={`${
                                isThinkingMode ? 'bg-purple-600' : 'bg-slate-700'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                            role="switch"
                            aria-checked={isThinkingMode}
                            onClick={() => setIsThinkingMode(!isThinkingMode)}
                        >
                            <span
                                aria-hidden="true"
                                className={`${
                                    isThinkingMode ? 'translate-x-5' : 'translate-x-0'
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>
                </div>


                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
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
                                Generate SEO Pack
                            </>
                        )}
                    </button>
                </div>
            </fieldset>
        </form>
    );
};
