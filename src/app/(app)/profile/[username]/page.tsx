
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePosts } from "@/context/post-context";
import { useData } from "@/context/data-context";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Camera, UserPlus, Check, MessageSquare, ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { logProfileVisit } from "@/lib/logging";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params.username === 'string' ? params.username : '';
  const { posts } = usePosts();
  const { users, currentUser, isLoading: isDataLoading, logProfileVisit, toggleFollow, startConversation } = useData();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isNotFound, setIsNotFound] = useState(false);
  
  const isFollowing = useMemo(() => {
    if (!currentUser || !user) return false;
    return currentUser.followingIds?.includes(user.id);
  }, [currentUser, user]);

  useEffect(() => {
    if (!isDataLoading && users.length > 0) {
      const foundUser = users.find(u => u.username === username);
      if (foundUser) {
        setUser(foundUser);
        setIsNotFound(false);
        if (currentUser) {
            logProfileVisit(currentUser, foundUser);
        }
      } else {
        setUser(null);
        setIsNotFound(true);
      }
    }
  }, [username, users, isDataLoading, currentUser, logProfileVisit]);
  
  const isCurrentUser = user?.id === currentUser?.id;
  const userPosts = posts.filter(p => p.user.username === user?.username);
  
  const [coverImage, setCoverImage] = useState("https://picsum.photos/id/1018/1000/300");
  const [avatarImage, setAvatarImage] = useState<string | undefined>(user?.avatar);

  useEffect(() => {
    if (user) {
      setAvatarImage(user.avatar);
    }
  }, [user]);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<string | undefined>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFollow = async () => {
    if (!currentUser || !user) return;
    await toggleFollow(user);
  };
  
  const handleMessage = async () => {
    if (!currentUser || !user) return;
    const conversationId = await startConversation(user);
    if (conversationId) {
      router.push('/messages');
    }
  };

  if (isDataLoading || user === undefined) {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
        <div className="flex min-h-[80vh] w-full flex-col items-center justify-center text-center">
            <Card className="p-8">
                <UserX className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="mt-2 text-muted-foreground">
                    Sorry, the user @{username} could not be found.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/feed">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Feed
                    </Link>
                </Button>
            </Card>
        </div>
    );
  }
  
  if (!user) {
     // This case should ideally not be hit if the logic above is correct,
     // but it's a fallback.
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="overflow-hidden rounded-2xl">
        <div className="relative h-40 w-full group">
            <Image 
                src={coverImage}
                alt="Cover image" 
                fill 
                className="object-cover"
                data-ai-hint="mountain landscape"
                priority
            />
            {isCurrentUser && (
              <>
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg" 
                  onChange={(e) => handleFileChange(e, setCoverImage as any)}
                />
                <Button size="icon" variant="secondary" onClick={() => coverInputRef.current?.click()} className="absolute bottom-4 right-4 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5" />
                  <span className="sr-only">Change cover image</span>
                </Button>
              </>
            )}
        </div>
        <div className="relative p-6 -mt-16">
          <div className="flex justify-center">
            <div className="relative group">
                <Avatar className="w-28 h-28 border-4 border-card">
                  <AvatarImage src={avatarImage} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isCurrentUser && (
                   <>
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => handleFileChange(e, setAvatarImage)}
                    />
                    <Button size="icon" variant="secondary" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Change profile picture</span>
                    </Button>
                   </>
                )}
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.category && (
              <Badge variant="secondary" className="mt-2">{user.category}</Badge>
            )}
            <p className="mt-4 text-sm max-w-md mx-auto">{user.bio}</p>
          </div>
          <div className="flex justify-around my-6 text-center">
            <div>
                <p className="font-bold text-lg">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posting</p>
            </div>
            <div>
                <p className="font-bold text-lg">{user.followers}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
                <p className="font-bold text-lg">{user.following}</p>
                <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
          {isCurrentUser ? (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
              <Button size="lg">Share Profile</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <Button 
                  size="lg" 
                  onClick={handleFollow}
                  variant={isFollowing ? 'secondary' : 'default'}
                >
                  {isFollowing ? <Check className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" size="lg" onClick={handleMessage}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Message
                </Button>
            </div>
          )}
        </div>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 px-2">Posts</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {userPosts.map(post => post.image && (
            <div key={post.id} className="aspect-square relative rounded-lg overflow-hidden border">
               <Image src={post.image} alt="Post image" fill className="object-cover" data-ai-hint="user post"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
