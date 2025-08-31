
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, Settings, LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export function FeedHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully." });
      router.push('/login');
    } catch (error) {
      toast({ title: "Failed to log out.", variant: "destructive" });
    }
  };

  return (
    <header className="flex justify-between items-center py-2 px-2">
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Switch Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <h1 className="text-2xl font-bold tracking-tighter">Instatory</h1>
      
      <Button variant="ghost" size="icon" asChild>
        <Link href="/messages">
            <Send className="h-6 w-6" />
            <span className="sr-only">Messages</span>
        </Link>
      </Button>
    </header>
  );
}
