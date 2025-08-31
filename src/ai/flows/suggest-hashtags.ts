
'use server';
/**
 * @fileOverview A hashtag suggestion AI agent.
 *
 * - suggestHashtags - A function that suggests hashtags for a post.
 * - SuggestHashtagsInput - The input type for the suggestHashtags function.
 * - SuggestHashtagsOutput - The return type for the suggestHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {SuggestHashtagsInputSchema, SuggestHashtagsOutputSchema} from './types';

export type SuggestHashtagsInput = z.infer<typeof SuggestHashtagsInputSchema>;
export type SuggestHashtagsOutput = z.infer<typeof SuggestHashtagsOutputSchema>;

export async function suggestHashtags(
  input: SuggestHashtagsInput
): Promise<SuggestHashtagsOutput> {
  const anwser = await suggestHashtagsFlow(input);
  return anwser;
}

const prompt = ai.definePrompt({
  name: 'suggestHashtagsPrompt',
  input: {schema: SuggestHashtagsInputSchema},
  output: {schema: SuggestHashtagsOutputSchema},
  prompt: `You are a social media expert. Your goal is to suggest relevant hashtags for a user's post.

Analyze the following post content and suggest up to 5 relevant hashtags. The hashtags should be in English.

Post Content:
"{{postContent}}"

Please provide the suggested hashtags in the output format.`,
});

const suggestHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestHashtagsFlow',
    inputSchema: SuggestHashtagsInputSchema,
    outputSchema: SuggestHashtagsOutputSchema,
  },
  async (input: SuggestHashtagsInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
