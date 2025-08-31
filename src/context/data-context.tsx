
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Conversation, Message, Story } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, set, push, serverTimestamp, update, get, runTransaction, increment } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { logProfileVisit as logVisit } from '@/lib/logging';

interface DataContextType {
  users: User[];
  currentUser: User | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  stories: Story[];
  updateUser: (user: User) => Promise<void>;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  sendStoryReply: (storyOwner: User, replyText: string) => Promise<void>;
  addStory: (image: string) => Promise<void>;
  isCreateMenuOpen: boolean;
  toggleCreateMenu: (isOpen: boolean) => void;
  isLoading: boolean;
  logProfileVisit: (visitor: User, profile: User) => void;
  toggleFollow: (profileUser: User) => Promise<void>;
  startConversation: (profileUser: User) => Promise<string | null>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  updateConversationStatus: (conversationId: string, status: 'archived' | 'hidden' | null) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const toggleCreateMenu = (isOpen: boolean) => {
    setIsCreateMenuOpen(isOpen);
  };
  
  const logProfileVisit = (visitor: User, profile: User) => {
    logVisit(visitor, profile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setIsLoading(false);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val() || {};
        const usersList: User[] = Object.keys(usersData).map(key => ({
            id: key,
            ...usersData[key],
        }));
        setUsers(usersList);

        if (firebaseUser) {
            let userRecord = usersList.find(u => u.id === firebaseUser.uid);
             if (userRecord) {
                // Fetch following list for the current user
                get(ref(db, `following/${firebaseUser.uid}`)).then(snapshot => {
                    const followingData = snapshot.val() || {};
                    userRecord = { ...userRecord, followingIds: Object.keys(followingData) };
                    setCurrentUser(userRecord);
                });
            }
        }
        
        if (isLoading) {
            if (firebaseUser && !usersList.some(u => u.id === firebaseUser.uid)) {
                // still loading/creating user
            } else {
                 setIsLoading(false);
            }
        }
    }, (error) => {
        console.error("Firebase user read failed: " + error.message);
        setIsLoading(false);
    });

    return () => unsubscribeUsers();
}, [firebaseUser, isLoading]);


  useEffect(() => {
    if (!firebaseUser) {
      if(isLoading) setIsLoading(false);
      return;
    }

    const userRef = ref(db, `users/${firebaseUser.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser({ id: firebaseUser.uid, ...snapshot.val() });
      } else {
        const displayName = firebaseUser.displayName || firebaseUser.email || "New User";
        const match = displayName.match(/(.*) \((.*)\)/);
        let name, username;
        if (match) {
            name = match[1];
            username = match[2];
        } else {
            name = displayName;
            username = (firebaseUser.email?.split('@')[0] || `user${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '');
        }

        const newUser: Omit<User, 'id'> = {
          name: name,
          username: username,
          avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
          bio: 'Just joined!',
          followers: 0,
          following: 0,
          category: 'Personal Account',
        };
        set(userRef, newUser);
        setCurrentUser({id: firebaseUser.uid, ...newUser});
      }
    }).catch(error => {
        console.error("Error fetching user data:", error);
    }).finally(() => {
        setIsLoading(false);
    });

  }, [firebaseUser]);


  useEffect(() => {
    if (!currentUser) return;
    const conversationsRef = ref(db, `user-conversations/${currentUser.id}`);
    const unsubscribe = onValue(conversationsRef, async (snapshot) => {
      const convosData = snapshot.val();
      if (!convosData) {
        setConversations([]);
        return;
      }
      const convoPromises = Object.keys(convosData).map(async (convoId) => {
        const convoInfo = convosData[convoId];
        if (!convoInfo || !convoInfo.participantId) return null;

        const otherUserId = convoInfo.participantId;
        const userSnapshot = await get(ref(db, `users/${otherUserId}`));
        const participant = userSnapshot.val();

        if (!participant) return null;
        
        const lastMessageSnapshot = await get(ref(db, `conversations/${convoId}/lastMessage`));
        const lastMessageData = lastMessageSnapshot.val();
        
        const lastMessage: Message = { 
          id: '', 
          text: lastMessageData?.text || '...', 
          sender: { id: lastMessageData?.senderId || '', name: '', username: '', avatar: ''},
          timestamp: lastMessageData?.timestamp || '',
        };

        return {
          id: convoId,
          participant: {id: otherUserId, ...participant},
          lastMessage,
          unreadCount: convoInfo.unreadCount || 0,
          status: convoInfo.status || null,
        };
      });

      const resolvedConvos = (await Promise.all(convoPromises)).filter(Boolean) as Conversation[];
      resolvedConvos.sort((a, b) => (b.lastMessage.timestamp as number) - (a.lastMessage.timestamp as number));
      setConversations(resolvedConvos);
      
      resolvedConvos.forEach(convo => {
        if (!convo) return;
        const messagesRef = ref(db, `messages/${convo.id}`);
        onValue(messagesRef, (msgSnapshot) => {
          const messagesData = msgSnapshot.val();
          const messagesList: Message[] = messagesData ? Object.keys(messagesData).map(key => ({
            id: key,
            ...messagesData[key]
          })) : [];
          setMessages(prev => ({...prev, [convo.id]: messagesList.sort((a,b) => (a.timestamp as any) - (b.timestamp as any)) }));
        });
      });
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const storiesRef = ref(db, 'stories');
    const unsubscribe = onValue(storiesRef, async (snapshot) => {
      const storiesData = snapshot.val();
      if (!storiesData) {
        setStories([]);
        return;
      }
      
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      const storyPromises = Object.keys(storiesData).map(async (userId) => {
        const userStoriesData = storiesData[userId];
        const userSnapshot = await get(ref(db, `users/${userId}`));
        const user = { id: userId, ...userSnapshot.val() };
        if (!user.name) return []; // Skip if user data is incomplete

        return Object.keys(userStoriesData)
            .filter(storyId => userStoriesData[storyId].createdAt > twentyFourHoursAgo)
            .map(storyId => ({
                id: storyId,
                ...userStoriesData[storyId],
                user,
            }));
      });

      const nestedStories = await Promise.all(storyPromises);
      const flattenedStories = nestedStories.flat().sort((a, b) => b.createdAt - a.createdAt);
      setStories(flattenedStories);
    });

    return () => unsubscribe();
  }, []);

  const updateUser = async (updatedUser: User) => {
    const { id, ...userData } = updatedUser;
    await update(ref(db, `users/${id}`), userData);
  }

  const addMessage = async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
     if(!currentUser) return;
     const messagesRef = ref(db, `messages/${conversationId}`);
     const newMessageRef = push(messagesRef);
     const messageData = { ...message, timestamp: serverTimestamp() };
     await set(newMessageRef, messageData);
     
     const lastMessage = {
        text: message.text,
        senderId: currentUser.id,
        timestamp: serverTimestamp()
     };
     await set(ref(db, `conversations/${conversationId}/lastMessage`), lastMessage);

     const convoSnapshot = await get(ref(db, `conversations/${conversationId}/participants`));
     const participants = convoSnapshot.val();
     if (participants) {
       Object.keys(participants).forEach(participantId => {
         const userConvoRef = ref(db, `user-conversations/${participantId}/${conversationId}`);
         const updates: any = { lastUpdated: serverTimestamp() };
         if (participantId !== currentUser.id) {
           updates.unreadCount = increment(1);
         }
         update(userConvoRef, updates);
       });
     }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!currentUser) return;
    const userConvoRef = ref(db, `user-conversations/${currentUser.id}/${conversationId}`);
    await update(userConvoRef, { unreadCount: 0 });
  };
  
  const updateConversationStatus = async (conversationId: string, status: 'archived' | 'hidden' | null) => {
    if (!currentUser) return;
    const userConvoRef = ref(db, `user-conversations/${currentUser.id}/${conversationId}`);
    await update(userConvoRef, { status: status });
  }

  const sendStoryReply = async (storyOwner: User, replyText: string) => {
    if (!currentUser) return;
    const conversationId = await startConversation(storyOwner);
    if (!conversationId) return;

    const message = {
      sender: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar,
      },
      text: `Replying to your story: ${replyText}`,
    };
    await addMessage(conversationId, message);
    
    router.push('/messages');
  }
  
  const addStory = async (image: string) => {
    if (!currentUser) return;
    const userStoriesRef = ref(db, `stories/${currentUser.id}`);
    await push(userStoriesRef, {
        image,
        createdAt: serverTimestamp(),
    });
  }

  const toggleFollow = async (profileUser: User) => {
    if (!currentUser || currentUser.id === profileUser.id) return;
    
    const currentUserFollowingRef = ref(db, `following/${currentUser.id}/${profileUser.id}`);
    const profileUserFollowersRef = ref(db, `followers/${profileUser.id}/${currentUser.id}`);
    const currentUserRef = ref(db, `users/${currentUser.id}`);
    const profileUserRef = ref(db, `users/${profileUser.id}`);

    const snapshot = await get(currentUserFollowingRef);
    if (snapshot.exists()) {
        // Unfollow
        await set(currentUserFollowingRef, null);
        await set(profileUserFollowersRef, null);
        await runTransaction(currentUserRef, (user) => {
            if (user) user.following = (user.following || 1) - 1;
            return user;
        });
        await runTransaction(profileUserRef, (user) => {
            if (user) user.followers = (user.followers || 1) - 1;
            return user;
        });
    } else {
        // Follow
        await set(currentUserFollowingRef, true);
        await set(profileUserFollowersRef, true);
        await runTransaction(currentUserRef, (user) => {
            if (user) user.following = (user.following || 0) + 1;
            return user;
        });
        await runTransaction(profileUserRef, (user) => {
            if (user) user.followers = (user.followers || 0) + 1;
            return user;
        });
    }
  };

  const startConversation = async (profileUser: User): Promise<string | null> => {
    if (!currentUser || currentUser.id === profileUser.id) return null;

    // Check if a conversation already exists
    const existingConvo = conversations.find(c => c.participant.id === profileUser.id);
    if (existingConvo) {
        return existingConvo.id;
    }

    // Create a new conversation
    const newConversationRef = push(ref(db, 'conversations'));
    const newConversationId = newConversationRef.key;
    if (!newConversationId) return null;

    const conversationData = {
        participants: {
            [currentUser.id]: true,
            [profileUser.id]: true,
        },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
    };
    await set(newConversationRef, conversationData);

    // Add conversation to both users' conversation lists
    await set(ref(db, `user-conversations/${currentUser.id}/${newConversationId}`), { participantId: profileUser.id, lastUpdated: serverTimestamp(), unreadCount: 0 });
    await set(ref(db, `user-conversations/${profileUser.id}/${newConversationId}`), { participantId: currentUser.id, lastUpdated: serverTimestamp(), unreadCount: 0 });
    
    return newConversationId;
  };


  const value = { users, currentUser, conversations, messages, stories, updateUser, addMessage, sendStoryReply, addStory, isCreateMenuOpen, toggleCreateMenu, isLoading, logProfileVisit, toggleFollow, startConversation, markConversationAsRead, updateConversationStatus };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
