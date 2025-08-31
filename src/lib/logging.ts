
"use client";

import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import type { User } from '@/lib/types';

type VisitorRole = 'selfVisitor' | 'friendVisitor' | 'strangerVisitor' | 'adminVisitor';
type InteractionType = 'like' | 'comment' | 'share' | 'message';

interface VisitLog {
  visitorId: string;
  profileId: string;
  role: VisitorRole;
  timestamp: object;
}

interface InteractionLog {
  userId: string;
  contentId: string;
  contentType: 'post' | 'story';
  interactionType: InteractionType;
  timestamp: object;
}

/**
 * Logs a profile visit event to the database.
 * @param visitor - The user who is visiting the profile.
 * @param profile - The user whose profile is being visited.
 */
export function logProfileVisit(visitor: User, profile: User): void {
  if (!visitor || !profile) return;

  // Simplified role determination as per the current data model.
  // A 'friend' status would require checking a follow list, which is not currently implemented.
  const role: VisitorRole = visitor.id === profile.id ? 'selfVisitor' : 'strangerVisitor';

  const visitData: Omit<VisitLog, 'timestamp'> & { timestamp: object } = {
    visitorId: visitor.id,
    profileId: profile.id,
    role: role,
    timestamp: serverTimestamp(),
  };

  const visitsRef = ref(db, 'logs/visits');
  push(visitsRef, visitData).catch(error => {
    console.error("Failed to log profile visit:", error);
  });
}

/**
 * Logs a user interaction with a piece of content (post or story).
 * @param user - The user performing the interaction.
 * @param contentId - The ID of the post or story.
 * @param contentType - The type of content ('post' or 'story').
 * @param interactionType - The type of interaction ('like', 'comment', 'share', 'message').
 */
export function logInteraction(
  user: User,
  contentId: string,
  contentType: 'post' | 'story',
  interactionType: InteractionType
): void {
  if (!user || !contentId) return;

  const interactionData: Omit<InteractionLog, 'timestamp'> & { timestamp: object } = {
    userId: user.id,
    contentId: contentId,
    contentType: contentType,
    interactionType: interactionType,
    timestamp: serverTimestamp(),
  };

  const interactionsRef = ref(db, 'logs/interactions');
  push(interactionsRef, interactionData).catch(error => {
      console.error("Failed to log interaction:", error);
  });
}
