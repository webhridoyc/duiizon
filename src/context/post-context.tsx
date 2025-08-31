
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Post, User, Comment } from '@/lib/types';
import { db } from '@/lib/firebase';
import { ref, push, onValue, update, increment, get, serverTimestamp, set, remove, runTransaction } from 'firebase/database';
import { useData } from './data-context';
import { deleteImageByUrl } from '@/lib/storage';

interface PostContextType {
  posts: Post[];
  comments: Record<string, Comment[]>;
  addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt' | 'liked'>) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  deletePost: (post: Post) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const { currentUser } = useData();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, async (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const postPromises = Object.keys(postsData).map(async (key) => {
          const post = postsData[key];
          
          const userSnapshot = await get(ref(db, `users/${post.user.id}`));
          const user: User = { id: post.user.id, ...userSnapshot.val() };
          
          let liked = false;
          if (currentUserId) {
            const likeSnapshot = await get(ref(db, `post-likes/${key}/${currentUserId}`));
            liked = likeSnapshot.exists();
          }
          
          const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now';
          
          const commentsRef = ref(db, `comments/${key}`);
          onValue(commentsRef, async (commentSnapshot) => {
            const commentsData = commentSnapshot.val();
            if(commentsData){
              const commentPromises = Object.keys(commentsData).map(async (commentId) => {
                const comment = commentsData[commentId];
                const commentUserSnapshot = await get(ref(db, `users/${comment.userId}`));
                const commentUser : User = { id: comment.userId, ...commentUserSnapshot.val() };
                
                let likedByCurrentUser = false;
                if (currentUserId) {
                    const likeSnapshot = await get(ref(db, `comment-likes/${key}/${commentId}/${currentUserId}`));
                    likedByCurrentUser = likeSnapshot.exists();
                }

                return {
                  id: commentId,
                  ...comment,
                  user: commentUser,
                  createdAt: comment.timestamp,
                  likes: comment.likes || 0,
                  likedByCurrentUser,
                }
              });
              const resolvedComments = await Promise.all(commentPromises);
              setComments(prev => ({...prev, [key]: resolvedComments}));
            } else {
              setComments(prev => ({...prev, [key]: []}));
            }
          });

          return {
            id: key,
            ...post,
            user,
            createdAt,
            liked,
          };
        });
        const resolvedPosts = await Promise.all(postPromises);
        resolvedPosts.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
        setPosts(resolvedPosts);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const addPost = (post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt' | 'liked' | 'createdAtTimestamp'>) => {
    const postsRef = ref(db, 'posts');
    const newPostData = {
      ...post,
      user: { id: post.user.id }, 
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: serverTimestamp(),
    };
    push(postsRef, newPostData);
  };

  const deletePost = async (post: Post) => {
    if (!currentUser || currentUser.id !== post.user.id) return;
    if (post.image) {
      await deleteImageByUrl(post.image);
    }
    await remove(ref(db, `posts/${post.id}`));
    await remove(ref(db, `comments/${post.id}`));
    await remove(ref(db, `post-likes/${post.id}`));
  };

  const deleteComment = async (postId: string, commentId: string) => {
    const commentRef = ref(db, `comments/${postId}/${commentId}`);
    const commentSnapshot = await get(commentRef);
    if (commentSnapshot.exists() && commentSnapshot.val().userId === currentUser?.id) {
        await remove(commentRef);
        await remove(ref(db, `comment-likes/${postId}/${commentId}`));
        await update(ref(db, `posts/${postId}`), {
            comments: increment(-1),
        });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!currentUserId) return;

    const postLikesRef = ref(db, `post-likes/${postId}/${currentUserId}`);
    const postRef = ref(db, `posts/${postId}`);

    const snapshot = await get(postLikesRef);
    if (snapshot.exists()) {
      await set(postLikesRef, null);
      await update(postRef, {
        likes: increment(-1),
      });
    } else {
      await set(postLikesRef, true);
      await update(postRef, {
        likes: increment(1),
      });
    }
  };

  const addComment = (postId: string, commentText: string) => {
     if (!currentUserId) return;
     const postRef = ref(db, `posts/${postId}`);
     update(postRef, {
        comments: increment(1),
     });
    const commentsRef = ref(db, `comments/${postId}`);
    push(commentsRef, { 
        text: commentText, 
        userId: currentUserId,
        likes: 0,
        createdAt: serverTimestamp(),
    });
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
    if (!currentUserId) return;

    const likeRef = ref(db, `comment-likes/${postId}/${commentId}/${currentUserId}`);
    const commentRef = ref(db, `comments/${postId}/${commentId}`);

    const snapshot = await get(likeRef);
    if (snapshot.exists()) {
        await remove(likeRef);
        await runTransaction(commentRef, (comment) => {
            if (comment) {
                comment.likes = (comment.likes || 1) - 1;
            }
            return comment;
        });
    } else {
        await set(likeRef, true);
        await runTransaction(commentRef, (comment) => {
            if (comment) {
                comment.likes = (comment.likes || 0) + 1;
            }
            return comment;
        });
    }
  };

  return (
    <PostContext.Provider value={{ posts, comments, addPost, toggleLike, addComment, deletePost, deleteComment, toggleCommentLike }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
