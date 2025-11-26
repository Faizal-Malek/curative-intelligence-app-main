import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to sign-in page
  redirect('/sign-in');
}
