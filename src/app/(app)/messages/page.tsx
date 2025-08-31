
"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/data-context";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Send, Archive, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


function ConversationsSkeleton() {
  return (
    <div className="max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full mb-4 rounded-full" />
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="flex-1 space-y-2">
        {Array.from({length: 5}).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function MessagesListPage() {
  const { conversations, currentUser, isLoading, updateConversationStatus } = useData();
  const [activeTab, setActiveTab] = useState("All");

  const filteredConversations = useMemo(() => {
    switch(activeTab) {
      case 'Unread':
        return conversations.filter(c => (c.unreadCount || 0) > 0);
      case 'Archived':
        return conversations.filter(c => c.status === 'archived');
      case 'Hidden':
        return conversations.filter(c => c.status === 'hidden');
      case 'All':
      default:
        return conversations.filter(c => c.status !== 'archived' && c.status !== 'hidden');
    }
  }, [conversations, activeTab]);

  if (isLoading || !currentUser) {
    return <ConversationsSkeleton />;
  }

  const tabs = ["All", "Unread", "Archived", "Hidden"];

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col p-4 bg-card rounded-2xl">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button variant="ghost" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </header>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search" className="pl-10 rounded-full bg-background" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        {tabs.map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "secondary"}
            className="rounded-full px-4"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto -mx-2">
        {filteredConversations.length > 0 ? filteredConversations.map((convo) => (
          <div key={convo.id} className="group p-2 rounded-lg flex gap-3 items-center cursor-pointer hover:bg-muted/50 relative">
            <Link
              href={`/messages/${convo.id}`}
              className="flex-1 flex gap-3 items-center"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={convo.participant.avatar} alt={convo.participant.name} />
                <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{convo.participant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {convo.lastMessage.timestamp && new Date(convo.lastMessage.timestamp as number).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.text}</p>
                  {(convo.unreadCount || 0) > 0 && <Badge className="bg-primary h-5 w-5 p-0 flex items-center justify-center text-xs">{convo.unreadCount}</Badge>}
                </div>
              </div>
            </Link>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => updateConversationStatus(convo.id, 'archived')}>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateConversationStatus(convo.id, 'hidden')}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  <span>Hide</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )) : (
          <div className="text-center pt-10">
              <Card className="p-8 bg-background inline-block">
                <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold">No Messages</h2>
                <p className="text-muted-foreground mt-2">There are no messages in this tab.</p>
              </Card>
          </div>
        )}
      </div>
    </div>
  );
}
