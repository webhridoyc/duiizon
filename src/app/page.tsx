import { redirect } from 'next/navigation';
// This is a temporary solution to check auth status on the server.
// In a real-world app, you'd use a more robust solution like middleware
// or a client-side auth provider to avoid flashes of unauthenticated content.
import { auth } from '@/lib/firebase';

export default function RootPage() {
  // This check is very basic and might not cover all edge cases,
  // especially with client-side auth state changes.
  if (auth.currentUser) {
    redirect('/feed');
  } else {
    redirect('/login');
  }
  return null;
}
