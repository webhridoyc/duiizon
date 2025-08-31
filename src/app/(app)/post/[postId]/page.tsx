
"use client";

import { useParams } from "next/navigation";
import { usePosts } from "@/context/post-context";
import { PostCard } from "@/components/app/post-card";
import { Comments } from "@/components/app/comments";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostDetailPage() {
  const params = useParams();
  const postId = typeof params.postId === 'string' ? params.postId : '';
  const { posts } = usePosts();

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/feed">
                    <ArrowLeft />
                </Link>
            </Button>
            <h1 className="text-xl font-bold">Post</h1>
        </div>
        <PostCard post={post} />
        <div className="mt-8">
            <Comments post={post} />
        </div>
    </div>
  );
}
