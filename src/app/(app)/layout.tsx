
"use client";

import { PostProvider } from "@/context/post-context";
import { DataProvider, useData } from "@/context/data-context";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { CreatePost } from "@/components/app/create-post";
import { Loader2 } from "lucide-react";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCreateMenuOpen, isLoading, currentUser } = useData();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }

  return (
    <PostProvider>
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
          {children}
        </main>
        {isCreateMenuOpen && <CreatePost />}
        {currentUser && <MobileBottomNav />}
      </div>
    </PostProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </DataProvider>
  );
}
