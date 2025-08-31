
'use server';

import {
  suggestUsername,
  type SuggestUsernameInput,
  type SuggestUsernameOutput,
} from '@/ai/flows/suggest-username';

export async function suggestUsernameAction(
  input: SuggestUsernameInput
): Promise<SuggestUsernameOutput> {
  return await suggestUsername(input);
}
