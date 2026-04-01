'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-400/15 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
          </div>
          <h1 className="text-headline-lg text-on-surface mb-3">Check your email</h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            We&apos;ve sent a confirmation link to <strong className="text-on-surface">{email}</strong>. 
            Click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image
              src="/logo.svg"
              alt="Lexiq Logo"
              width={48}
              height={48}
              className="rounded-xl shadow-glow"
            />
          </div>
          <h1 className="text-display-sm text-on-surface mb-2">Begin your journey</h1>
          <p className="text-body-lg text-on-surface-variant">
            Create your account and start mastering language
          </p>
        </div>

        <div className="bg-surface-low rounded-2xl p-8">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-label-lg text-on-surface-variant block mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Patel"
                className="w-full px-4 py-3 bg-surface-lowest rounded-xl text-body-lg text-on-surface placeholder:text-outline transition-all focus:shadow-glow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-label-lg text-on-surface-variant block mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-surface-lowest rounded-xl text-body-lg text-on-surface placeholder:text-outline transition-all focus:shadow-glow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-label-lg text-on-surface-variant block mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-surface-lowest rounded-xl text-body-lg text-on-surface placeholder:text-outline transition-all focus:shadow-glow-sm"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-error-container/20 rounded-xl text-error text-body-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all disabled:opacity-50 shadow-glow-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-label-sm text-outline normal-case">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-surface-highest rounded-xl text-title-sm text-on-surface hover:bg-surface-bright transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-body-md text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
