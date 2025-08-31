
"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/data-context";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { users, currentUser } = useData();

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);
  
  const recommendedUsers = useMemo(() => {
    if (!users || !currentUser) return [];
    return users.filter(user => user.id !== currentUser.id).slice(0, 5);
  }, [users, currentUser]);

  const usersToShow = searchTerm ? filteredUsers : recommendedUsers;

  if (!currentUser) {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <Skeleton className="h-12 w-full mb-6" />
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Search for Users</h1>
        <p className="text-muted-foreground mt-2">Find and connect with others.</p>
      </div>

      <div className="relative mb-6">
        <div className="flex items-center bg-card p-2 rounded-full shadow-lg">
          <SearchIcon className="h-5 w-5 text-muted-foreground ml-3" />
          <Input
            placeholder="Search by name or username..."
            className="flex-1 bg-transparent border-0 text-base h-10 pl-2 focus-visible:ring-0 ring-offset-0 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button className="rounded-full h-10 px-6 font-bold">Search</Button>
        </div>
      </div>
      
      {usersToShow.length > 0 && (
        <Card className="rounded-2xl bg-card shadow-lg animate-in fade-in-0 slide-in-from-top-4 duration-300">
            <CardContent className="p-0">
                {!searchTerm && (
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-sm text-muted-foreground">RECOMMENDED FOR YOU</h3>
                    </div>
                )}
                <ul className="divide-y divide-border">
                    {usersToShow.map((user) => (
                    <li key={user.id}>
                        <Link href={`/profile/${user.username}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        </Link>
                    </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}

      {searchTerm && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
              No users found for "{searchTerm}".
          </p>
        </div>
      )}
    </div>
  );
}
