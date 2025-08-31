
export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  category?: string;
  followingIds?: string[];
};

export type Post = {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string | number;
  createdAtTimestamp: object;
  liked?: boolean;
};

export type Comment = {
  id: string;
  user: User;
  userId: string;
  text: string;
  createdAt: number | object;
  likes: number;
  likedByCurrentUser?: boolean;
  replies?: Comment[];
}

export type Message = {
    id: string;
    sender: Pick<User, 'id' | 'name' | 'username' | 'avatar'>;
    text: string;
    timestamp: string | number;
}

export type Conversation = {
    id: string;
    participant: User;
    lastMessage: Message;
    unreadCount?: number;
    status?: 'archived' | 'hidden';
}

export type Story = {
  id: string;
  user: User;
  image: string;
  createdAt: number;
};
