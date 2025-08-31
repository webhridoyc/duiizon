
"use client";

import { useState, useEffect } from 'react';
import type { Story, User } from '@/lib/types';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Send, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { logInteraction } from '@/lib/logging';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

export function StoryViewer({ story, onClose }: StoryViewerProps) {
  const { sendStoryReply, currentUser } = useData();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 100 / 5; // 5 second story duration
      });
    }, 1000); // Changed to 1000ms for smoother progress bar

    return () => clearInterval(timer);
  }, [onClose]);
  
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;
    
    try {
        await sendStoryReply(story.user, replyText);
        logInteraction(currentUser, story.id, 'story', 'message');
        toast({ title: "Reply sent!" });
        setReplyText(""); // Clear input after sending
    } catch (error) {
        toast({ title: "Failed to send reply", variant: "destructive"});
    }
  };
  
  const handleLike = () => {
    if (!currentUser) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    if (newLikedState) { // Only log the 'like' action
        logInteraction(currentUser, story.id, 'story', 'like');
        toast({
            title: "Liked story!",
            description: "The author will be notified.",
        });
    } else {
         toast({
            title: "Unliked story"
        });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-in fade-in-0">
      <div className="relative w-full max-w-sm h-[95vh] bg-background rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <Progress value={progress} className="h-1" />
            <div className="flex items-center gap-3 mt-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={story.user.avatar} />
                    <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{story.user.name}</p>
                    <p className="text-xs text-white/80" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{new Date(story.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 text-white rounded-full bg-black/30 hover:bg-black/50" onClick={onClose}>
          <X className="h-6 w-6"/>
        </Button>
        <div className="relative flex-1">
          <Image src={story.image} alt={`Story by ${story.user.name}`} fill className="object-cover" data-ai-hint="user story content" />
        </div>
        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
          <form onSubmit={handleReply} className="flex items-center gap-2">
            <div className="relative flex-1">
                <Input 
                    placeholder="Send Message..."
                    className="bg-black/30 border-white/40 text-white placeholder:text-white/80 rounded-full h-12 pl-5 pr-12 focus-visible:ring-white/50"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                />
                 <Button type="submit" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-white rounded-full hover:bg-white/20">
                    <Send className="h-6 w-6"/>
                </Button>
            </div>
             <Button variant="ghost" size="icon" type="button" className="text-white rounded-full hover:bg-white/20 h-12 w-12" onClick={handleLike}>
                <Heart className={cn("h-7 w-7 transition-all", isLiked && "fill-red-500 text-red-500")} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
