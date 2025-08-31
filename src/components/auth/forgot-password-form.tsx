
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  // We'll treat the input as email since Firebase Auth requires it.
  // In a real app with a backend, you'd look up the email by username.
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      // Firebase Auth needs an email to send a reset link.
      // This is a placeholder for a real backend lookup.
      // For this prototype, we assume the user enters a valid email.
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox to reset your password.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
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
            alt="Forgot Password Illustration"
            className="rounded-lg"
            data-ai-hint="password help"
          />
        </div>
        <h1 className="text-2xl font-bold text-center">Forget Password</h1>
        <p className="text-muted-foreground text-center text-sm mt-2 mb-6 px-4">
          Don&apos;t worry it happens. Please enter the address associate with your account
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="email" type="email" placeholder="Email or Username" required className="pl-10 h-12 rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full h-12 rounded-lg mt-2 font-bold" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          You remember you password?{" "}
          <Link href="/login" className="underline text-primary font-medium">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
