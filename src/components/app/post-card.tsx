
import type { Post } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { usePosts } from "@/context/post-context";
import { useData } from "@/context/data-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { logInteraction } from "@/lib/logging";
import { useRouter } from "next/navigation";
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
import { useState } from "react";


export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const { toggleLike, deletePost } = usePosts();
  const { users, currentUser } = useData();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const firstCommenter = users.find(u => u.id !== post.user.id) || users[0];

  const handleCommentClick = () => {
    router.push(`/post/${post.id}`);
  };
  
  const handleLike = () => {
    if (!currentUser) {
        toast({ title: "Please log in to like posts", variant: "destructive" });
        return;
    }
    toggleLike(post.id);
    if (!post.liked) { 
        logInteraction(currentUser, post.id, 'post', 'like');
    }
  }

  const handleShare = () => {
    if (!currentUser) {
        toast({ title: "Please log in to share posts", variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    logInteraction(currentUser, post.id, 'post', 'share');
    toast({ title: "Post link copied to clipboard!" });
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await deletePost(post);
        toast({ title: "Post deleted successfully" });
    } catch (error) {
        toast({ title: "Failed to delete post", variant: "destructive" });
    } finally {
        setIsDeleting(false);
    }
  }

  if (!post.user) {
    return null; 
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Avatar>
          <AvatarImage src={post.user.avatar} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link href={`/profile/${post.user.username}`} className="font-semibold hover:underline">{post.user.name}</Link>
          <p className="text-sm text-muted-foreground">{post.user.bio.split('.')[0]}</p>
        </div>
        <div className="text-sm text-muted-foreground">{post.createdAt as string}</div>
        {currentUser?.id === post.user.id && (
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
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  post and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        )}
      </div>

      {post.image && (
        <div className="aspect-square relative rounded-2xl overflow-hidden border mb-3">
          <Image src={post.image} alt="Post image" fill className="object-cover" data-ai-hint="social media post" priority />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleLike}>
            <Heart className={cn("h-6 w-6", post.liked && "fill-red-500 text-red-500")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleCommentClick}><MessageCircle className="h-6 w-6" /></Button>
        <Button variant="ghost" size="icon" onClick={handleShare}><Send className="h-6 w-6" /></Button>
      </div>
      
      <div className="px-2">
        <p className="font-semibold text-sm mt-1">{post.likes} likes</p>
        <p className="mt-1">
          <Link href={`/profile/${post.user.username}`} className="font-semibold hover:underline">{post.user.username}</Link>
          <span className="text-sm"> {post.content} <Button variant="link" className="h-auto p-0 text-muted-foreground">view more</Button></span>
        </p>
        <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground mt-1" onClick={handleCommentClick}>
          View all {post.comments} comments
        </Button>
        
        {firstCommenter && post.comments > 0 && (
          <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                  <AvatarImage src={firstCommenter.avatar} alt={firstCommenter.name} />
                  <AvatarFallback>{firstCommenter.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm">
                  <Link href={`/profile/${firstCommenter.username}`} className="font-semibold hover:underline">{firstCommenter.username}</Link>
                  <span> So beautiful!</span>
              </p>
          </div>
        )}
      </div>
    </div>
  );
}
