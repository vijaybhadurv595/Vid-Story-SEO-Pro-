
import { VideoCategory, VideoLanguage } from './types';

export const VIDEO_CATEGORIES: VideoCategory[] = [
    VideoCategory.DIY,
    VideoCategory.EDUCATION,
    VideoCategory.ENTERTAINMENT,
    VideoCategory.FINANCE,
    VideoCategory.FITNESS,
    VideoCategory.FOOD,
    VideoCategory.GAMING,
    VideoCategory.NEWS,
    VideoCategory.STORY,
    VideoCategory.TECHNOLOGY,
    VideoCategory.TRAVEL,
    VideoCategory.YOUTUBE_TIPS,
    VideoCategory.VIDEO_SCRIPT_WRITING_TOOL,
];

export const VIDEO_LANGUAGES: VideoLanguage[] = [
    VideoLanguage.AUTO_DETECT,
    VideoLanguage.ENGLISH,
    VideoLanguage.HINDI,
    VideoLanguage.HINGLISH,
];

export const VIDEO_CATEGORY_TRANSLATIONS: Record<VideoCategory, string> = {
    [VideoCategory.DIY]: "DIY",
    [VideoCategory.EDUCATION]: "Education",
    [VideoCategory.ENTERTAINMENT]: "Entertainment",
    [VideoCategory.FINANCE]: "Finance",
    [VideoCategory.FITNESS]: "Fitness",
    [VideoCategory.FOOD]: "Food",
    [VideoCategory.GAMING]: "Gaming",
    [VideoCategory.NEWS]: "News",
    [VideoCategory.STORY]: "Story",
    [VideoCategory.TECHNOLOGY]: "Technology",
    [VideoCategory.TRAVEL]: "Travel",
    [VideoCategory.YOUTUBE_TIPS]: "YouTube Tips",
    [VideoCategory.VIDEO_SCRIPT_WRITING_TOOL]: "Video Script Writing Tool"
};

export const VIDEO_LANGUAGE_TRANSLATIONS: Record<VideoLanguage, string> = {
    [VideoLanguage.AUTO_DETECT]: "Auto-detect",
    [VideoLanguage.ENGLISH]: "English",
    [VideoLanguage.HINDI]: "Hindi",
    [VideoLanguage.HINGLISH]: "Hinglish"
};
