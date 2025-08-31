import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function RootPage() {
  // This is a basic server-side check.
  // In a real-world app, you might have a more robust session management.
  // We check for a common Firebase auth cookie name, but this is not foolproof.
  const cookieStore = cookies();
  const hasAuthCookie = cookieStore.has('__session');

  if (hasAuthCookie) {
    redirect('/feed');
  } else {
    redirect('/login');
  }
}
