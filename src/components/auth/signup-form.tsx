
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { auth, googleProvider, facebookProvider, signInWithPopup } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, getAdditionalUserInfo, type AuthProvider } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialLogin = async (provider: AuthProvider) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      
      if (additionalInfo?.isNewUser) {
        // New user, needs to choose a username
        router.push('/signup/username');
      } else {
        // Existing user, go to feed
        router.push("/feed");
      }
    } catch (error: any) {
       toast({
        title: "Sign Up Failed",
        description: error.message || "Could not sign up with the selected provider.",
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      // For email sign up, we assume the username is part of the form,
      // but since it's not, we'll also redirect to the username page.
      router.push("/signup/username");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
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
            alt="Sign Up Illustration"
            className="rounded-lg"
            data-ai-hint="signup illustration"
          />
        </div>
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <p className="text-muted-foreground text-center text-sm mt-2 mb-6">
          Use proper information to continue
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="full-name" type="text" placeholder="Full name" required className="pl-10 h-12 rounded-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="email" type="email" placeholder="Email address" required className="pl-10 h-12 rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="password" type={showPassword ? "text" : "password"} required placeholder="Password" className="pl-10 pr-10 h-12 rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            By signing up, you are agree to our <Link href="#" className="text-primary">Terms & Conditions</Link> and <Link href="#" className="text-primary">Privacy Policy</Link>
          </p>
          <Button type="submit" className="w-full h-12 rounded-lg mt-2 font-bold" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary font-medium">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
