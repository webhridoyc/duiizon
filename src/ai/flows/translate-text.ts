
'use server';
/**
 * @fileOverview A text translation AI agent.
 *
 * - translateText - A function that translates text to a specified language.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {TranslateTextInputSchema, TranslateTextOutputSchema} from './types';

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a professional translator. Your task is to translate the given text into the specified language.

Text to translate: "{{text}}"
Target language: {{language}}

Please provide the translated text in the output format.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input: TranslateTextInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
