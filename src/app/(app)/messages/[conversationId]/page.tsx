
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useData } from "@/context/data-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus, Phone, Video, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message, Conversation } from "@/lib/types";
import { UserProfileModal } from "@/components/app/user-profile-modal";
import { Skeleton } from "@/components/ui/skeleton";

function ChatSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-4 border-b p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex-1 p-6 space-y-4">
            <div className="flex items-end gap-3 justify-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>
            <div className="flex items-end gap-3 justify-end">
                <Skeleton className="h-16 w-64 rounded-2xl" />
            </div>
             <div className="flex items-end gap-3 justify-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-2xl" />
            </div>
             <div className="flex items-end gap-3 justify-end">
                <Skeleton className="h-12 w-40 rounded-2xl" />
            </div>
        </div>
         <div className="p-4 bg-background border-t">
            <Skeleton className="h-12 w-full rounded-full" />
         </div>
    </div>
  )
}

export default function ConversationPage() {
    const router = useRouter();
    const params = useParams();
    const conversationId = params.conversationId as string;

    const { messages, currentUser, addMessage, conversations, isLoading, markConversationAsRead } = useData();
    const [newMessage, setNewMessage] = useState("");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [conversation, setConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        if (conversations.length > 0) {
            const currentConvo = conversations.find(c => c.id === conversationId);
            setConversation(currentConvo || null);
        }
    }, [conversationId, conversations]);
    
    useEffect(() => {
        if (conversationId) {
            markConversationAsRead(conversationId);
        }
    }, [conversationId, markConversationAsRead]);

    if (isLoading || !currentUser || !conversation) {
        return <ChatSkeleton />;
    }

    const activeMessages = messages[conversation.id] || [];

    const handleSendMessage = () => {
        if (newMessage.trim() === "" || !conversation) return;

        const message: Omit<Message, 'id' | 'timestamp'> = {
            sender: {
                id: currentUser.id,
                name: currentUser.name,
                username: currentUser.username,
                avatar: currentUser.avatar,
            },
            text: newMessage,
        };
        addMessage(conversation.id, message);
        setNewMessage("");
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-card rounded-2xl overflow-hidden">
            <UserProfileModal 
              user={conversation.participant} 
              isOpen={isProfileModalOpen} 
              onClose={() => setIsProfileModalOpen(false)} 
            />
            <div className="flex items-center gap-4 border-b p-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div 
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() => setIsProfileModalOpen(true)}
                >
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.participant.avatar} alt={conversation.participant.name} />
                        <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{conversation.participant.name}</p>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Phone /></Button>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Video /></Button>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-background">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={cn("flex items-end gap-3", msg.sender.id === currentUser.id ? "justify-end" : "justify-start")}>
                  {msg.sender.id !== currentUser.id && <Avatar className="h-8 w-8"><AvatarImage src={msg.sender.avatar} /></Avatar>}
                  <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl", msg.sender.id === currentUser.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                    <p>{msg.text}</p>
                    <p className={cn("text-xs mt-1 text-right", msg.sender.id === currentUser.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{msg.timestamp && new Date(msg.timestamp as number).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-background border-t">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center gap-2">
                <Button variant="ghost" size="icon"><Plus className="h-6 w-6" /></Button>
                <Input
                  placeholder="Type a message..."
                  className="flex-1 rounded-full h-12 pr-12 bg-muted focus-visible:ring-primary"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="absolute right-10 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
        </div>
    );
}
