export enum VideoCategory {
    DIY = "DIY",
    EDUCATION = "Education",
    ENTERTAINMENT = "Entertainment",
    FINANCE = "Finance",
    FITNESS = "Fitness",
    FOOD = "Food",
    GAMING = "Gaming",
    NEWS = "News",
    STORY = "Story",
    TECHNOLOGY = "Technology",
    TRAVEL = "Travel",
    YOUTUBE_TIPS = "YouTube Tips",
    VIDEO_SCRIPT_WRITING_TOOL = "Video Script Writing Tool"
}

export enum VideoLanguage {
    AUTO_DETECT = "Auto-detect",
    ENGLISH = "English",
    HINDI = "Hindi",
    HINGLISH = "Hinglish"
}

export interface SeoScore {
    score: number;
    justification: string;
}

export interface SeoDescription {
    short: string;
    long: string;
}

export interface LanguageDetection {
    language: string;
    confidence: number;
}

export interface ThumbnailIdea {
    idea: string;
    imageUrl: string;
}

export interface GeneratedContent {
    isIdea: boolean;
    languageDetection: LanguageDetection;
    generatedStory: string;
    seoTitles: string[];
    seoDescription: SeoDescription;
    tags: string[];
    hashtags: string[];
    thumbnailIdeas: ThumbnailIdea[];
    seoScore: SeoScore;
}

export interface KeywordSuggestion {
  keyword: string;
  volume: 'High' | 'Medium' | 'Low';
  competition: 'High' | 'Medium' | 'Low';
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingSource;
}

export interface Clip {
  id: string;
  url: string;
  name: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  position: 'top' | 'center' | 'bottom';
}