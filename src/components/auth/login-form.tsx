
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { auth, googleProvider, facebookProvider, signInWithPopup } from "@/lib/firebase";
import { signInWithEmailAndPassword, AuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  // We'll treat the input as email since Firebase Auth requires it.
  // In a real app with a backend, you'd look up the email by username.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSocialLogin = async (provider: AuthProvider) => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // For login, we assume the user already has a username and profile.
      router.push("/feed");
    } catch (error: any) {
       toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with the selected provider.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      // Firebase Auth needs an email. In this prototype, we assume the user enters an email.
      // In a real app, you would have a backend that can look up the email associated with a username.
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/feed");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Please check your username/email and password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-lg border-0 animate-auth-swoop-in">
      <CardContent className="p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="https://picsum.photos/300/200"
            width={150}
            height={100}
            alt="Sign In Illustration"
            className="rounded-lg"
            data-ai-hint="login illustration"
          />
        </div>
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-muted-foreground text-center text-sm mt-2 mb-6">
          Enter valid user name & password to continue
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="email" type="text" placeholder="Username or Email" required className="pl-10 h-12 rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="password" type={showPassword ? "text" : "password"} required placeholder="Password" className="pl-10 pr-10 h-12 rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
           <Link href="/forgot-password" passHref>
              <Button variant="link" className="text-primary text-xs justify-end w-full p-0 h-auto">
                Forgot password
              </Button>
            </Link>
          <Button type="submit" className="w-full h-12 rounded-lg font-bold" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12" onClick={() => handleSocialLogin(googleProvider)} disabled={isLoading}>
                Google
            </Button>
            <Button variant="outline" className="h-12" onClick={() => handleSocialLogin(facebookProvider)} disabled={isLoading}>
                Facebook
            </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          Havent&apos;t any account?{" "}
          <Link href="/signup" className="underline text-primary font-medium">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
