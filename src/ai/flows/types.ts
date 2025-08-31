
import {z} from 'zod';

// Translation schemas
export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  language: z.string().describe('The target language for translation.'),
});

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});

// Username suggestion schemas
export const SuggestUsernameInputSchema = z.object({
  fullName: z.string().describe("The user's full name."),
});

export const SuggestUsernameOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested usernames.'),
});

// Hashtag suggestion schemas
export const SuggestHashtagsInputSchema = z.object({
  postContent: z.string().describe('The content of the social media post.'),
});

export const SuggestHashtagsOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('A list of suggested hashtags.'),
});
