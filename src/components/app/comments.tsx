
"use client";

import { useState } from "react";
import type { Post, Comment } from "@/lib/types";
import { useData } from "@/context/data-context";
import { usePosts } from "@/context/post-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, ThumbsUp, MessageSquare, MoreHorizontal, TrendingUp, Calendar, Trash2, Languages, Loader2, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { translateTextAction } from "@/actions/translate-action";
import { suggestHashtagsAction } from "@/actions/suggest-hashtags-action";
import { Badge } from "@/components/ui/badge";

function CommentCard({ comment, postId }: { comment: Comment, postId: string }) {
  const [showReplies, setShowReplies] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  
  const { currentUser } = useData();
  const { deleteComment, toggleCommentLike } = usePosts();
  const { toast } = useToast();
  
  const handleDelete = async () => {
    try {
      await deleteComment(postId, comment.id);
      toast({ title: "Comment deleted" });
    } catch (error) {
      toast({ title: "Failed to delete comment", variant: "destructive"});
    }
  }
  
  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslatedText(null);
    try {
      const result = await translateTextAction({ text: comment.text, language: 'English' });
      setTranslatedText(result.translatedText);
    } catch (error) {
      toast({ title: "Translation failed", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };
  
  const handleLike = () => {
    if (!currentUser) return;
    toggleCommentLike(postId, comment.id);
  }
  
  const canInteract = !!currentUser;
  const displayText = translatedText || comment.text;

  return (
    <div className="flex items-start gap-4 py-4">
       <Link href={`/profile/${comment.user.username}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <div>
                 <Link href={`/profile/${comment.user.username}`} className="font-semibold hover:underline">{comment.user.name}</Link>
                <span className="text-xs text-muted-foreground ml-2">{new Date(comment.createdAt as number).toLocaleDateString()}</span>
            </div>
             {currentUser?.id === comment.user.id && (
               <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your comment. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
             )}
        </div>
        <p className="text-sm mt-1">{displayText}</p>
        {isTranslating && <p className="text-xs text-muted-foreground mt-1">Translating...</p>}
        {translatedText && (
          <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setTranslatedText(null)}>
            Show original
          </Button>
        )}
        {canInteract && (
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2" onClick={handleLike}>
                    <ThumbsUp className={cn("h-4 w-4", comment.likedByCurrentUser && "fill-primary text-primary")} />
                    <span>{comment.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Reply</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2" onClick={handleTranslate} disabled={isTranslating}>
                   {isTranslating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Languages className="h-4 w-4" />}
                    <span>Translate</span>
                </Button>
            </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
             <Button variant="link" className="p-0 h-auto text-primary text-sm font-semibold mt-2" onClick={() => setShowReplies(!showReplies)}>
                {showReplies ? "Hide Replies" : `See ${comment.replies.length} Replies`}
            </Button>
        )}
      </div>
    </div>
  )
}


export function Comments({ post }: { post: Post }) {
  const { currentUser } = useData();
  const { addComment, comments } = usePosts();
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const postComments = comments[post.id] || [];
  
  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;
    addComment(post.id, newComment);
    setNewComment("");
  };

  const handleSuggestHashtags = async () => {
    if (!newComment.trim()) return;
    setIsSuggesting(true);
    try {
        const result = await suggestHashtagsAction({ postContent: newComment });
        setSuggestedHashtags(result.hashtags);
    } catch (error) {
        toast({ title: "Could not suggest hashtags.", variant: "destructive"});
    } finally {
        setIsSuggesting(false);
    }
  }

  const { toast } = useToast();
  
  const sortedComments = [...postComments].sort((a, b) => {
    if(sortBy === 'newest') {
        return (b.createdAt as number) - (a.createdAt as number);
    }
    return (b.likes || 0) - (a.likes || 0);
  });

  return (
    <Card className="rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Comments ({post.comments})</h2>
            <div className="flex items-center gap-2">
                <Button variant={sortBy === 'popular' ? 'secondary' : 'ghost'} size="sm" onClick={() => setSortBy('popular')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Popular
                </Button>
                <Button variant={sortBy === 'newest' ? 'secondary' : 'ghost'} size="sm" onClick={() => setSortBy('newest')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Newest
                </Button>
            </div>
        </div>

        {currentUser && (
            <div className="flex items-start gap-3 mb-6">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleAddComment(); }} 
                        className="relative flex-1"
                    >
                        <Input 
                            placeholder="Write your comments here..." 
                            className="rounded-full h-12 pr-14 bg-muted border-0 focus-visible:ring-primary"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                    <div className="mt-2 flex items-center gap-2">
                         <Button type="button" variant="outline" size="sm" onClick={handleSuggestHashtags} disabled={isSuggesting || !newComment.trim()}>
                            {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            Suggest Hashtags
                        </Button>
                        <div className="flex flex-wrap gap-1">
                            {suggestedHashtags.map(tag => (
                                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setNewComment(prev => `${prev} ${tag}`)}>{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        <div className="divide-y">
            {sortedComments.map(comment => (
                <CommentCard key={comment.id} comment={comment} postId={post.id} />
            ))}
        </div>
    </Card>
  );
}
