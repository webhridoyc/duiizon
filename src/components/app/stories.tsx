
"use client";

import { useState } from 'react';
import { useData } from "@/context/data-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { StoryViewer } from './story-viewer';
import type { Story } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function StoriesSkeleton() {
  return (
    <div className="py-4 border-b">
      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
            </div>
        ))}
      </div>
    </div>
  );
}


export function Stories() {
  const { currentUser, stories } = useData();
  const router = useRouter();
  const [viewingStory, setViewingStory] = useState<Story | null>(null);

  if (!currentUser) {
    return <StoriesSkeleton />;
  }

  const myStories = stories.filter(s => s.user.id === currentUser.id);
  const otherUserStories = stories.filter(s => s.user.id !== currentUser.id);

  // Group stories by user
  const storiesByUser: Record<string, Story[]> = otherUserStories.reduce((acc, story) => {
    if (!acc[story.user.id]) {
      acc[story.user.id] = [];
    }
    acc[story.user.id].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  const handleViewStory = (story: Story) => {
    setViewingStory(story);
  }

  return (
    <>
      <div className="py-4 border-b">
        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
          {/* Your Story */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer" onClick={() => myStories.length > 0 ? handleViewStory(myStories[0]) : router.push('/story/create')}>
             <div className={cn("w-18 h-18 p-1 rounded-full", myStories.length > 0 && "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500")}>
                <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-background">
                      <AvatarImage src={currentUser.avatar} alt="Your story" />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {myStories.length === 0 && (
                        <div className="absolute bottom-0 right-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                            <Plus className="h-4 w-4 text-primary-foreground" />
                        </div>
                    )}
                </div>
             </div>
            <span className="text-xs font-medium">You</span>
          </div>

          {/* Other Stories */}
          {Object.values(storiesByUser).map((userStories) => {
              if (userStories.length === 0) return null;
              const user = userStories[0].user;
              return (
              <div key={user.id} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleViewStory(userStories[0])}>
                  <div className="w-18 h-18 p-1 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                    <Avatar className="w-16 h-16 border-2 border-background">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-medium truncate w-20 text-center">{user.name.split(' ')[0]}</span>
              </div>
              )
           })}
        </div>
      </div>
      {viewingStory && (
        <StoryViewer 
            story={viewingStory}
            onClose={() => setViewingStory(null)}
        />
      )}
    </>
  );
}
