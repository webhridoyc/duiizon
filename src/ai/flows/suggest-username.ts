
'use server';
/**
 * @fileOverview A username suggestion AI agent.
 *
 * - suggestUsername - A function that suggests usernames.
 * - SuggestUsernameInput - The input type for the suggestUsername function.
 * - SuggestUsernameOutput - The return type for the suggestUsername function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {SuggestUsernameInputSchema, SuggestUsernameOutputSchema} from './types';

export type SuggestUsernameInput = z.infer<typeof SuggestUsernameInputSchema>;
export type SuggestUsernameOutput = z.infer<typeof SuggestUsernameOutputSchema>;

export async function suggestUsername(
  input: SuggestUsernameInput
): Promise<SuggestUsernameOutput> {
  const answer = await suggestUsernameFlow(input);
  return answer;
}

const prompt = ai.definePrompt({
  name: 'suggestUsernamePrompt',
  input: {schema: SuggestUsernameInputSchema},
  output: {schema: SuggestUsernameOutputSchema},
  prompt: `You are a creative assistant. Your goal is to suggest unique and appealing usernames based on the user's full name.

The user's full name is: {{fullName}}.

Please provide 3 username suggestions. The usernames should be in lowercase and without spaces.`,
});

const suggestUsernameFlow = ai.defineFlow(
  {
    name: 'suggestUsernameFlow',
    inputSchema: SuggestUsernameInputSchema,
    outputSchema: SuggestUsernameOutputSchema,
  },
  async (input: SuggestUsernameInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
