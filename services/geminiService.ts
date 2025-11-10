import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VideoLanguage } from '../types';
import type { VideoCategory, GeneratedContent, KeywordSuggestion, GroundingChunk } from '../types';


// Per guidelines, API key is from environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getModel = () => {
    // Per guidelines, use 'gemini-2.5-flash-lite' for low-latency responses.
    return 'gemini-2.5-flash-lite';
};

const getVisionModel = () => {
    // Per guidelines, use 'gemini-2.5-flash-image' for general image generation.
    return 'gemini-2.5-flash-image';
}

const seoContentSchema = {
    type: Type.OBJECT,
    properties: {
        isIdea: { type: Type.BOOLEAN, description: 'True if the user input was a brief idea (< 100 words), false if it was a full script or a video file.' },
        languageDetection: {
            type: Type.OBJECT,
            properties: {
                language: { type: Type.STRING, description: 'Detected language of the script (e.g., "English", "Hindi").' },
                confidence: { type: Type.NUMBER, description: 'Confidence score (0-100) for the language detection.' },
            },
            required: ['language', 'confidence']
        },
        generatedStory: { type: Type.STRING, description: 'If the input was a brief idea, generate a 200-300 word story. If the input was a full script, this should be an empty string. If the input was a video, this should be a concise summary of the video content.' },
        seoTitles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Generate 5 compelling, SEO-friendly titles for the video. Titles should be engaging and include relevant keywords.'
        },
        seoDescription: {
            type: Type.OBJECT,
            properties: {
                short: { type: Type.STRING, description: 'A short, concise description (max 150 characters) for social media snippets.' },
                long: { type: Type.STRING, description: 'A detailed, longer description for the YouTube video page, incorporating keywords naturally (200-300 words).' }
            },
            required: ['short', 'long']
        },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Generate 10-15 relevant tags for YouTube, including broad and specific keywords.'
        },
        hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Generate 3-5 relevant hashtags for social media promotion (must include the # symbol).'
        },
        thumbnailIdeas: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    idea: { type: Type.STRING, description: 'A creative and descriptive idea for a video thumbnail that would be visually appealing.' },
                },
                required: ['idea']
            },
            description: 'Generate 3 distinct and visually appealing thumbnail ideas.'
        },
        seoScore: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: 'An overall SEO score from 1 to 100 based on the potential of the generated content to rank well.' },
                justification: { type: Type.STRING, description: 'A brief justification for the assigned SEO score.' }
            },
            required: ['score', 'justification']
        },
    },
    required: ['isIdea', 'languageDetection', 'generatedStory', 'seoTitles', 'seoDescription', 'tags', 'hashtags', 'thumbnailIdeas', 'seoScore']
};

const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Error in ${context}:`, error);

    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('api key not valid') || message.includes('api key is invalid') || message.includes('permission denied') || message.includes('403') || message.includes('requested entity was not found')) {
            return new Error('Invalid API Key. Please select a valid API key from the dialog and ensure it has the necessary permissions.');
        }

        if (message.includes('failed to fetch')) {
             return new Error('Network error. Could not connect to the API. Please check your internet connection and try again.');
        }
        
        if (message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
            return new Error('API quota exceeded. You may have run out of free credits or hit a rate limit. Please check your Google AI Studio account and try again later.');
        }

        if (message.includes('safety') || message.includes('blocked')) {
            return new Error('The request was blocked due to safety settings. Please adjust your input and try again.');
        }
        
        if (message.includes('did not return an image')) {
            return new Error('The model could not generate an image for this prompt. Please try a different, more descriptive prompt.');
        }
        
        if (message.includes('json') || message.includes('markdown')) {
            return new Error('The model returned an unexpected response format. This might be a temporary issue. Please try again.');
        }
        
        if (message.includes('server error') || message.includes('500')) {
             return new Error('The AI service is currently experiencing issues. Please try again in a few minutes.');
        }

        return new Error(`An unexpected error occurred: ${error.message}. Please try again.`);
    }

    return new Error(`An unknown error occurred while ${context}. Please check the console for details and try again.`);
};

const generateThumbnailImage = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `Create a vibrant, eye-catching, high-contrast YouTube video thumbnail. The image should have clear visuals that represent: "${prompt}". Do not include any text in the image. The style should be photorealistic or cinematic, depending on the subject.`;
        const response = await ai.models.generateContent({
            model: getVisionModel(),
            contents: { parts: [{ text: fullPrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        console.warn("Image data not found in response part for prompt:", prompt);
        return "";
    } catch (e) {
        console.error(`Thumbnail generation failed for prompt "${prompt}":`, e);
        return ""; // Return empty string on failure for graceful degradation
    }
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    const data = await base64EncodedDataPromise;
    return {
        inlineData: { data, mimeType: file.type },
    };
};

export const generateSeoContent = async (
    inputData: { inputText: string; videoFile: File | null },
    category: VideoCategory,
    language: VideoLanguage,
    isThinkingMode: boolean
): Promise<GeneratedContent> => {
    const hasVideo = !!inputData.videoFile;
    const model = hasVideo || isThinkingMode ? 'gemini-2.5-pro' : getModel(); 
    
    let contents: any;

    if (hasVideo) {
        const promptText = `
            You are a YouTube SEO expert and content strategist. Your task is to analyze the provided video file and generate a complete SEO optimization pack. This is a multi-modal analysis that considers both visuals and audio.

            **Video Category:** ${category}
            **Target Language:** ${language === VideoLanguage.AUTO_DETECT ? 'Detect automatically' : language}

            Based on the video content, perform the following actions and return the result in a single JSON object that strictly adheres to the provided schema. The video is the primary source of information.
            1.  **isIdea**: This is a video upload. Set this to 'false'.
            2.  **languageDetection**: Detect the primary spoken language in the video and provide a confidence score.
            3.  **generatedStory**: Crucially, you must generate a detailed summary of the video's content (200-300 words). This summary should accurately reflect the main topics, narrative, and key visual elements discussed or shown in the video. This field must not be empty.
            4.  **seoTitles**: Create 5 highly clickable, SEO-optimized titles based on the video's content and summary.
            5.  **seoDescription**: Write two versions of the description: a short one for social media (under 150 chars) and a long, detailed one for YouTube (200-300 words), using the generated summary as a foundation.
            6.  **tags**: Generate 10-15 relevant YouTube tags based on the video's subject matter.
            7.  **hashtags**: Generate 3-5 relevant hashtags for social media promotion.
            8.  **thumbnailIdeas**: Come up with 3 distinct, creative, and visually compelling ideas for the video thumbnail, based on key moments or themes in the video.
            9.  **seoScore**: Provide an overall SEO score (1-100) and a brief justification based on the video's content potential.
        `;
        const videoPart = await fileToGenerativePart(inputData.videoFile!);
        contents = { parts: [ { text: promptText }, videoPart ] };
    } else {
        const promptText = `
            You are a YouTube SEO expert and content strategist. Your task is to analyze the provided video content and generate a complete SEO optimization pack.

            **Video Category:** ${category}
            **Target Language:** ${language === VideoLanguage.AUTO_DETECT ? 'Detect automatically' : language}
            **Input Text (This could be a brief idea or a full video script):**
            ---
            ${inputData.inputText}
            ---

            Based on the input, perform the following actions and return the result in a single JSON object that strictly adheres to the provided schema.
            1.  **isIdea**: Determine if the input text is a brief idea (less than 100 words) or a full script.
            2.  **languageDetection**: Detect the language of the input text and provide a confidence score.
            3.  **generatedStory**: If the input is an 'idea', expand it into an engaging 200-300 word story or script. If it's already a full script, return an empty string for this field.
            4.  **seoTitles**: Create 5 highly clickable, SEO-optimized titles.
            5.  **seoDescription**: Write two versions of the description: a short one for social media (under 150 chars) and a long, detailed one for YouTube (200-300 words).
            6.  **tags**: Generate 10-15 relevant YouTube tags.
            7.  **hashtags**: Generate 3-5 relevant hashtags for social media.
            8.  **thumbnailIdeas**: Come up with 3 distinct, creative, and visually compelling ideas for the video thumbnail.
            9.  **seoScore**: Provide an overall SEO score (1-100) and a brief justification.
        `;
        contents = promptText;
    }
    
    try {
        const config: any = {
            responseMimeType: 'application/json',
            responseSchema: seoContentSchema,
        };

        if (isThinkingMode && !hasVideo) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }
        
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: config,
        });

        const jsonResponseText = response.text.trim();
        const jsonResponse = JSON.parse(jsonResponseText) as GeneratedContent;
        
        // Concurrently generate images for the thumbnail ideas
        const thumbnailPromises = jsonResponse.thumbnailIdeas.map(async (thumb) => {
            const imageUrl = await generateThumbnailImage(thumb.idea);
            return { ...thumb, imageUrl };
        });

        const thumbnailsWithImages = await Promise.all(thumbnailPromises);
        jsonResponse.thumbnailIdeas = thumbnailsWithImages;

        return jsonResponse;
    } catch (error) {
        throw handleApiError(error, "generating SEO content");
    }
};

export const generateKeywordSuggestions = async (topic: string): Promise<{suggestions: KeywordSuggestion[], sources: GroundingChunk[]}> => {
    const prompt = `
        You are a keyword research specialist. For the given topic, use Google Search to find up-to-date information and generate a list of 15-20 related long-tail keywords that a content creator could target.
        For each keyword, provide an estimated search volume (High, Medium, or Low) and competition level (High, Medium, or Low).

        **Topic:** "${topic}"

        Return the result ONLY as a markdown table with three columns: "Keyword", "Volume", and "Competition". Do not include any other text, introduction, or formatting.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        const text = response.text;
        const suggestions: KeywordSuggestion[] = [];
        const rows = text.trim().split('\n').slice(2); 

        for (const row of rows) {
            const parts = row.split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length >= 3) {
                 const keyword = parts[0];
                 const volume = parts[1] as 'High' | 'Medium' | 'Low';
                 const competition = parts[2] as 'High' | 'Medium' | 'Low';
                 if (keyword && ['High', 'Medium', 'Low'].includes(volume) && ['High', 'Medium', 'Low'].includes(competition)) {
                     suggestions.push({ keyword, volume, competition });
                 }
            }
        }

        if (suggestions.length === 0 && text.length > 0) {
            console.warn("Could not parse markdown table from response:", text);
        }
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks || [];

        return { suggestions, sources };
    } catch (error) {
        throw handleApiError(error, "generating keyword suggestions");
    }
};


export const generateFullThumbnail = async (prompt: string): Promise<string> => {
    try {
        const imageUrl = await generateThumbnailImage(prompt);
        if (!imageUrl) {
            throw new Error("The model did not return an image. Please try a different prompt.");
        }
        return imageUrl;
    } catch (error) {
         throw handleApiError(error, "generating thumbnail");
    }
};

export const generateVideo = async (
    prompt: string,
    image: { imageBytes: string; mimeType: string },
    aspectRatio: '16:9' | '9:16',
    isThinkingMode: boolean
) => {
    try {
        // Per guidelines, create a new GoogleGenAI instance right before making an API call.
        const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = isThinkingMode ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
        
        const operation = await freshAi.models.generateVideos({
            model,
            prompt,
            image,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio,
            }
        });
        return operation;
    } catch (error) {
        throw handleApiError(error, "starting video generation");
    }
};

export const pollVideoOperation = async (operation: any) => {
     try {
        const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const updatedOperation = await freshAi.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        throw handleApiError(error, "polling video generation status");
    }
};