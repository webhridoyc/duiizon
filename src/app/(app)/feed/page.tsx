
"use client";

import { FeedHeader } from "@/components/app/feed-header";
import { Stories } from "@/components/app/stories";
import { PostCard } from "@/components/app/post-card";
import { usePosts } from "@/context/post-context";

export default function FeedPage() {
  const { posts } = usePosts();

  return (
    <div className="max-w-2xl mx-auto">
      <FeedHeader />
      <Stories />
      <div className="mt-6 flex flex-col gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
