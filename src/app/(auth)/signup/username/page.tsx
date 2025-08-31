
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useData } from "@/context/data-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { suggestUsernameAction } from "@/actions/suggest-username-action";


// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

type UsernameStatus = 'idle' | 'checking' | 'available' | 'unavailable';

// Helper function to check username availability
async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username) return false;
  const usersRef = ref(db, 'users');
  const userQuery = query(usersRef, orderByChild('username'), equalTo(username.toLowerCase()));
  const snapshot = await get(userQuery);
  return !snapshot.exists();
}


export default function ChooseUsernamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser: dataContextUser, updateUser } = useData();
  
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const checkUsername = useCallback(async (name: string) => {
    if (!name || name.length < 3) {
      setStatus('idle');
      return;
    }
    setStatus('checking');
    const isAvailable = await isUsernameAvailable(name);
    setStatus(isAvailable ? 'available' : 'unavailable');
  }, []);

  const debouncedCheckUsername = useCallback(debounce(checkUsername, 500), [checkUsername]);

  useEffect(() => {
    debouncedCheckUsername(username);
  }, [username, debouncedCheckUsername]);

  useEffect(() => {
    const suggestUsernames = async () => {
        if (auth.currentUser?.displayName) {
            setIsSuggesting(true);
            try {
                const result = await suggestUsernameAction({ fullName: auth.currentUser.displayName });
                setSuggestions(result.suggestions);
            } catch (error) {
                toast({ title: "Could not suggest usernames.", variant: "destructive"});
            } finally {
                setIsSuggesting(false);
            }
        }
    };
    suggestUsernames();
  }, [toast]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== 'available' || !username) {
        toast({ title: "Please choose an available username.", variant: "destructive"});
        return;
    }
    setIsSaving(true);
    
    if (!auth.currentUser || !dataContextUser) {
        toast({ title: "Error", description: "User not found. Please sign up again.", variant: "destructive" });
        router.push("/signup");
        return;
    }

    try {
      const updatedUser = {
        ...dataContextUser,
        username: username.toLowerCase(),
        name: auth.currentUser.displayName || dataContextUser.name,
      }
      await updateUser(updatedUser);

      // Also update auth profile if needed, though DB is source of truth
      if (auth.currentUser.displayName !== updatedUser.name) {
          await updateProfile(auth.currentUser, { displayName: updatedUser.name });
      }

      toast({
          title: "Welcome!",
          description: "Your username has been set.",
      });
      router.push("/feed");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not set username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
    
  const getStatusColor = () => {
    switch(status) {
        case 'available': return 'border-green-500 focus-visible:ring-green-500';
        case 'unavailable': return 'border-red-500 focus-visible:ring-red-500';
        default: return '';
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg border-0 animate-auth-swoop-in">
      <CardHeader className="p-8">
        <CardTitle className="text-2xl font-bold text-center">One Last Step</CardTitle>
        <CardDescription className="text-center pt-2">
          Please choose a unique username to complete your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                id="username" 
                type="text" 
                placeholder="Username" 
                required 
                className={cn("pl-10 h-12 rounded-lg transition-colors", getStatusColor())}
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
                {status === 'checking' && <Loader2 className="animate-spin h-5 w-5" />}
                {status === 'available' && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                {status === 'unavailable' && <XCircle className="text-red-500 h-5 w-5" />}
            </div>
          </div>
          {status === 'unavailable' && <p className="text-sm text-red-500 text-center">Username already in use.</p>}
          
          <div className="flex flex-col items-center gap-2 mt-2">
            {isSuggesting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Getting suggestions...</span>
                </div>
            )}
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map(s => (
                        <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setUsername(s)}>{s}</Badge>
                    ))}
                </div>
            )}
          </div>
          
          <Button type="submit" className="w-full h-12 rounded-lg mt-2 font-bold" disabled={isSaving || status !== 'available'}>
            {isSaving ? 'Saving...' : 'Complete Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
