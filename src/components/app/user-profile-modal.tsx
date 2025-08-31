
'use client';

import type { User } from '@/lib/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 border-0 rounded-2xl">
        <div className="relative h-32 w-full">
          <Image
            src="https://picsum.photos/id/1015/425/128"
            alt="Cover image"
            fill
            className="object-cover rounded-t-2xl"
            data-ai-hint="river mountain"
          />
        </div>
        <div className="relative p-6 pt-0 -mt-12">
          <Avatar className="w-24 h-24 border-4 border-card mx-auto">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center mt-4">
            <DialogTitle className="text-xl font-bold">{user.name}</DialogTitle>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            <p className="mt-2 text-sm max-w-xs mx-auto">{user.bio}</p>
          </div>
          <div className="flex justify-around my-4 text-center text-sm">
            <div>
              <p className="font-bold">{user.followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold">{user.following}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
          <Button asChild className="w-full rounded-full h-12 font-bold">
            <Link href={`/profile/${user.username}`} onClick={onClose}>View Full Profile</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
