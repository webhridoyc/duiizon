
'use server';

import {
  suggestHashtags,
  type SuggestHashtagsInput,
  type SuggestHashtagsOutput,
} from '@/ai/flows/suggest-hashtags';

export async function suggestHashtagsAction(
  input: SuggestHashtagsInput
): Promise<SuggestHashtagsOutput> {
  return await suggestHashtags(input);
}
