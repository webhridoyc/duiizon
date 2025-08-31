
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, PlusSquare, LogOut, UserSwitch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useData } from "@/context/data-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, toggleCreateMenu, stories } = useData();

  if (!currentUser) {
    return null;
  }
  
  const hasActiveStory = stories.some(s => s.user.id === currentUser.id);

  const profileHref = `/profile/${currentUser.username}`;

  const navItems = [
    { href: "/feed", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { action: () => toggleCreateMenu(true), label: "Create", icon: PlusSquare },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: profileHref, label: "Profile", icon: null },
  ];
  
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
      <nav className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-lg p-2 border shadow-lg">
        {navItems.map((item) => {
          const isActive = item.label === 'Profile' 
            ? pathname.startsWith('/profile/')
            : item.href ? pathname === item.href : false;
          const Icon = item.icon;
          const isProfileButton = item.label === 'Profile';

          const content = (
            <div
              className={cn(
                "flex flex-col items-center justify-center h-12 w-12 rounded-full cursor-pointer transition-colors duration-300",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {isProfileButton ? (
                 <div className={cn("p-0.5 rounded-full", hasActiveStory && "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500")}>
                    <Avatar className={cn("h-8 w-8 border-2", isActive ? "border-primary/20" : "border-background")}>
                      <AvatarImage src={currentUser!.avatar} alt={currentUser!.name} />
                      <AvatarFallback>{currentUser!.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                 </div>
              ) : Icon ? <Icon className="h-6 w-6" /> : null}
            </div>
          );

          if (item.href) {
            return (
              <Link 
                key={item.label} 
                href={item.href}
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          }
          
          if (item.action) {
            return (
              <button key={item.label} onClick={item.action} aria-label={item.label}>
                {content}
              </button>
            )
          }

          return null;
        })}
      </nav>
    </div>
  );
}
