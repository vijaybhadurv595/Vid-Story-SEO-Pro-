import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, pollVideoOperation } from '../services/geminiService';
import { PhotoIcon } from './icons/PhotoIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { FilmIcon } from './icons/FilmIcon';
import { ScissorsIcon } from './icons/ScissorsIcon';
import { TextIcon } from './icons/TextIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import type { Clip, TextOverlay } from '../types';

// FFmpeg type declaration for global script
declare const FFmpeg: any;

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const fetchFile = async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
};

export const VideoMakerTool: React.FC = () => {
    // Generation State
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    
    // Status State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');
    const [renderProgress, setRenderProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    // API Key & FFmpeg State
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [ffmpeg, setFfmpeg] = useState<any | null>(null);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    
    // Polling & Output State
    const [operation, setOperation] = useState<any | null>(null);
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const pollIntervalRef = useRef<number | null>(null);
    
    // Editor State
    const [clips, setClips] = useState<Clip[]>([]);
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [newOverlay, setNewOverlay] = useState({ text: '', position: 'center' as const });
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    
    const totalDuration = clips.reduce((acc, clip) => acc + (clip.trimEnd - clip.trimStart), 0);

    // Load FFmpeg and check for API key on mount
    useEffect(() => {
        const init = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
            if (FFmpeg) {
                const ffmpegInstance = new FFmpeg.FFmpeg();
                ffmpegInstance.on('log', ({ message }: { message: string }) => console.log(message));
                try {
                    setLoadingMessage('Loading editor tools...');
                    await ffmpegInstance.load({
                        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js'
                    });
                    setFfmpeg(ffmpegInstance);
                    setFfmpegLoaded(true);
                    setLoadingMessage('');
                } catch (err) {
                    setError('Failed to load video editor tools.');
                }
            }
        };
        init();
    }, []);
    
    // Polling logic for video generation
    useEffect(() => {
        if (operation && !operation.done && !pollIntervalRef.current) {
            pollIntervalRef.current = window.setInterval(async () => {
                try {
                    setLoadingMessage('Checking generation status...');
                    const updatedOp = await pollVideoOperation(operation);
                    setOperation(updatedOp);

                    if (updatedOp.done) {
                        setLoadingMessage('Clip is ready!');
                        setIsGenerating(false);
                        clearInterval(pollIntervalRef.current!);
                        pollIntervalRef.current = null;
                        const uri = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                        if (uri) {
                             const videoResponse = await fetch(`${uri}&key=${process.env.API_KEY}`);
                             const videoBlob = await videoResponse.blob();
                             const generatedVideoBlobUrl = URL.createObjectURL(videoBlob);
                             
                             const tempVideo = document.createElement('video');
                             tempVideo.src = generatedVideoBlobUrl;
                             tempVideo.onloadedmetadata = () => {
                                 const newClip: Clip = {
                                     id: `clip-${Date.now()}`,
                                     url: generatedVideoBlobUrl,
                                     name: prompt || `Clip ${clips.length + 1}`,
                                     duration: tempVideo.duration,
                                     trimStart: 0,
                                     trimEnd: tempVideo.duration,
                                 };
                                 setClips(prev => [...prev, newClip]);
                                 setPrompt('');
                             };
                        } else {
                            setError('Generation completed, but no video URL was found.');
                        }
                    } else {
                        setLoadingMessage('Still processing your clip...');
                    }
                } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to poll video status.');
                    setIsGenerating(false);
                    clearInterval(pollIntervalRef.current!);
                    pollIntervalRef.current = null;
                }
            }, 10000);
        }

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [operation, prompt, clips.length]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true); 
            setError(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGenerateClip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !imageFile) {
            setError("Please provide both a prompt and an image.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        setFinalVideoUrl(null);
        setOperation(null);
        setLoadingMessage('Preparing to generate clip...');

        try {
            const imageBytes = await blobToBase64(imageFile);
            const op = await generateVideo(prompt, { imageBytes, mimeType: imageFile.type }, aspectRatio, isThinkingMode);
            setOperation(op);
            setLoadingMessage('Clip generation started. This may take a few minutes.');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            if (errorMessage.toLowerCase().includes('requested entity was not found')) {
                setApiKeySelected(false); 
            }
            setError(errorMessage);
            setIsGenerating(false);
        }
    };

    const handleTrimChange = (id: string, type: 'start' | 'end', value: number) => {
        setClips(clips.map(c => c.id === id ? { ...c, [type === 'start' ? 'trimStart' : 'trimEnd']: value } : c));
    };

    const handleAddOverlay = () => {
        if (!newOverlay.text.trim()) return;
        const newTextOverlay: TextOverlay = {
            id: `overlay-${Date.now()}`,
            text: newOverlay.text,
            startTime: 0,
            endTime: totalDuration,
            position: newOverlay.position,
        };
        setTextOverlays(prev => [...prev, newTextOverlay]);
        setNewOverlay({ text: '', position: 'center' });
    };
    
    const handleUpdateOverlay = (id: string, field: keyof TextOverlay, value: string | number) => {
        setTextOverlays(overlays => overlays.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const handleRenderVideo = async () => {
        if (!ffmpeg || clips.length === 0) return;
        setIsRendering(true);
        setRenderProgress(0);
        setError(null);
        setFinalVideoUrl(null);

        try {
            ffmpeg.on('progress', ({ time }: { time: number }) => {
                setRenderProgress(Math.min(time / totalDuration, 1));
            });

            const inputs: string[] = [];
            const filterComplexParts: string[] = [];
            let concatInputs = '';

            for (let i = 0; i < clips.length; i++) {
                const clip = clips[i];
                const inputFileName = `input${i}.mp4`;
                const fileData = await fetchFile(clip.url);
                await ffmpeg.writeFile(inputFileName, fileData);
                inputs.push('-i', inputFileName);
                filterComplexParts.push(`[${i}:v]trim=start=${clip.trimStart}:end=${clip.trimEnd},setpts=PTS-STARTPTS,scale=1280:720,setsar=1[v${i}];[${i}:a]atrim=start=${clip.trimStart}:end=${clip.trimEnd},asetpts=PTS-STARTPTS[a${i}]`);
                concatInputs += `[v${i}][a${i}]`;
            }

            filterComplexParts.push(`${concatInputs}concat=n=${clips.length}:v=1:a=1[outv][outa]`);
            
            let lastVideoOutput = 'outv';
            for (let i = 0; i < textOverlays.length; i++) {
                const overlay = textOverlays[i];
                const newVideoOutput = `v_overlay_${i}`;
                const yPos = overlay.position === 'top' ? '20' : overlay.position === 'center' ? '(H-text_h)/2' : 'H-th-20';
                const escapedText = overlay.text.replace(/'/g, `\\\\'`).replace(/:/g, `\\\\:`);
                filterComplexParts.push(`[${lastVideoOutput}]drawtext=text='${escapedText}':x=(w-text_w)/2:y=${yPos}:fontsize=48:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:enable='between(t,${overlay.startTime},${overlay.endTime})'[${newVideoOutput}]`);
                lastVideoOutput = newVideoOutput;
            }

            const command = [ ...inputs, '-filter_complex', filterComplexParts.join(';'), '-map', `[${lastVideoOutput}]`, '-map', '[outa]', 'output.mp4' ];
            await ffmpeg.exec(command);

            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
            setFinalVideoUrl(URL.createObjectURL(blob));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Video rendering failed.');
        } finally {
            setIsRendering(false);
            ffmpeg.off('progress');
        }
    };

    const handleDownload = () => {
        if (!finalVideoUrl) return;
        const link = document.createElement('a');
        link.href = finalVideoUrl;
        link.download = `vidstory-pro-final-video.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isLoading = isGenerating || isRendering;
    const isReadyForWork = apiKeySelected && ffmpegLoaded;
    const canRender = clips.length > 0 && !isLoading;

    if (!isReadyForWork) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                {!apiKeySelected ? (
                     <div className="text-center bg-slate-800 border border-slate-700/50 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-slate-100">API Key Required</h2>
                        <p className="mt-2 text-slate-400">
                            To generate video clips, you must select an API key. Ensure billing is enabled for your account.
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline ml-1">Learn more</a>.
                        </p>
                        <button onClick={handleSelectKey} className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Select API Key</button>
                    </div>
                ) : (
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-cyan-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-4 text-lg font-semibold text-slate-300">{loadingMessage || 'Initializing...'}</p>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Generation Form */}
            <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-lg shadow-lg">
                 <form onSubmit={handleGenerateClip}>
                    <fieldset disabled={isLoading}>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-100">1. Generate Clips</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <input id="video-prompt" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt for your clip..." className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500" />
                                <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500">
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                </select>
                            </div>
                            <div>
                                {imagePreview ? (
                                    <div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-full max-h-32 object-contain rounded-md bg-slate-900 p-1 border border-slate-600" /><button onClick={() => { setImageFile(null); setImagePreview(null); }} type="button" className="absolute top-1 right-1 p-1 bg-slate-800/70 rounded-full hover:bg-slate-700"><XCircleIcon className="w-5 h-5 text-slate-400" /></button></div>
                                ) : (
                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full border-2 border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-700/50"><PhotoIcon className="w-8 h-8 text-slate-500" /><p className="text-sm text-slate-400 mt-2">Upload Starting Image</p><input id="image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" /></label>
                                )}
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-md border border-slate-700/50">
                                <span className="flex-grow flex flex-col pr-4">
                                    <span className="text-sm font-medium text-slate-300 flex items-center">
                                        <BrainCircuitIcon className="w-5 h-5 mr-2 text-purple-400 flex-shrink-0" />
                                        Thinking Mode
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Slower, higher-quality clip generation. Good for complex prompts.
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    className={`${isThinkingMode ? 'bg-purple-600' : 'bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                                    role="switch"
                                    aria-checked={isThinkingMode}
                                    onClick={() => setIsThinkingMode(!isThinkingMode)}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`${isThinkingMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading || !prompt.trim() || !imageFile} className="mt-4 w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed">
                            {isGenerating ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{loadingMessage}</> : <><SparklesIcon className="w-5 h-5" />Generate Clip</>}
                        </button>
                    </fieldset>
                </form>
            </div>
            
             {/* Editor UI */}
            <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-lg shadow-lg space-y-6">
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-100">2. Edit Video</h2>
                 
                 {/* Clip Editor */}
                 <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-cyan-400 flex items-center"><FilmIcon className="w-5 h-5 mr-2"/>Clips</h3>
                     {clips.length === 0 && <p className="text-slate-400 text-sm">Generate some clips to start editing.</p>}
                     {clips.map((clip, index) => (
                         <div key={clip.id} className="bg-slate-900/50 p-4 rounded-md border border-slate-700 space-y-3">
                             <div className="flex justify-between items-center">
                                 <p className="font-semibold text-slate-300 truncate pr-4">{index + 1}. {clip.name}</p>
                                 <button onClick={() => setClips(clips.filter(c => c.id !== clip.id))}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-rose-500"/></button>
                             </div>
                             <div className="flex items-center gap-3 text-sm">
                                <video src={clip.url} className="w-24 h-14 rounded bg-black" muted/>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-400"><span>Trim Start: {clip.trimStart.toFixed(1)}s</span><span>Trim End: {clip.trimEnd.toFixed(1)}s</span></div>
                                    <input type="range" min={0} max={clip.duration} value={clip.trimStart} onChange={e => handleTrimChange(clip.id, 'start', parseFloat(e.target.value))} className="w-full"/>
                                    <input type="range" min={0} max={clip.duration} value={clip.trimEnd} onChange={e => handleTrimChange(clip.id, 'end', parseFloat(e.target.value))} className="w-full"/>
                                </div>
                             </div>
                         </div>
                     ))}
                 </div>
                 
                 {/* Text Overlay Editor */}
                 <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-cyan-400 flex items-center"><TextIcon className="w-5 h-5 mr-2"/>Text Overlays</h3>
                     <div className="flex gap-2 items-center">
                         <input type="text" value={newOverlay.text} onChange={e => setNewOverlay({...newOverlay, text: e.target.value})} placeholder="Overlay text..." className="flex-grow bg-slate-900 border border-slate-600 rounded-md p-2 text-sm"/>
                         <select value={newOverlay.position} onChange={e => setNewOverlay({...newOverlay, position: e.target.value as any})} className="bg-slate-900 border border-slate-600 rounded-md p-2 text-sm"><option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option></select>
                         <button onClick={handleAddOverlay} className="p-2 bg-indigo-600 rounded-md hover:bg-indigo-700"><PlusIcon className="w-5 h-5"/></button>
                     </div>
                     {textOverlays.map(overlay => (
                         <div key={overlay.id} className="bg-slate-900/50 p-3 rounded-md border border-slate-700 space-y-2 text-sm">
                             <div className="flex justify-between items-center">
                                 <p className="text-slate-300 truncate pr-4">"{overlay.text}"</p>
                                 <button onClick={() => setTextOverlays(textOverlays.filter(o => o.id !== overlay.id))}><TrashIcon className="w-5 h-5 text-slate-400 hover:text-rose-500"/></button>
                             </div>
                             <div className="flex items-center gap-3">
                                <label>Time (s):</label>
                                <input type="number" value={overlay.startTime} onChange={e => handleUpdateOverlay(overlay.id, 'startTime', parseFloat(e.target.value))} min={0} max={totalDuration} className="w-20 bg-slate-700 p-1 rounded"/>
                                <span>to</span>
                                <input type="number" value={overlay.endTime} onChange={e => handleUpdateOverlay(overlay.id, 'endTime', parseFloat(e.target.value))} min={0} max={totalDuration} className="w-20 bg-slate-700 p-1 rounded"/>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Render and Preview */}
            <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-100">3. Render & Export</h2>
                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-4">{error}</div>}
                
                {isRendering && (
                    <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
                        <div className="bg-cyan-500 h-4 rounded-full text-xs text-center text-white font-bold" style={{ width: `${renderProgress * 100}%` }}>
                            {`${(renderProgress * 100).toFixed(0)}%`}
                        </div>
                    </div>
                )}

                {finalVideoUrl && !isRendering && (
                    <div className="space-y-4 mb-4">
                        <video src={finalVideoUrl} controls className="w-full aspect-video rounded-md bg-black" />
                        <button onClick={handleDownload} className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white font-bold py-3 px-4 rounded-md hover:bg-emerald-700"><ArrowDownTrayIcon className="w-5 h-5"/>Download Video</button>
                    </div>
                )}
                
                <button onClick={handleRenderVideo} disabled={!canRender} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed">
                    {isRendering ? 'Rendering...' : 'Render Final Video'}
                </button>
            </div>
        </div>
    );
};