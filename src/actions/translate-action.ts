
'use server';

import {
  translateText,
  type TranslateTextInput,
  type TranslateTextOutput,
} from '@/ai/flows/translate-text';

export async function translateTextAction(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return await translateText(input);
}
