import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api/authService';
import { getApiErrorMessage } from '../utils/errorMessage';

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (!open) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.4 5.5A10.6 10.6 0 0 1 12 5c5.5 0 9 5 9 7a12.9 12.9 0 0 1-3 3.4M6.2 6.9C4 8.5 3 10.4 3 12c0 2 3.5 7 9 7 1.2 0 2.3-.2 3.3-.6" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />
    </svg>
  );
}

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.register({ email, password, firstName, lastName });

      if (!response.success) {
        setError(response.message || 'Could not create your account.');
        return;
      }

      navigate('/login', {
        replace: true,
        state: { signupSuccess: true },
      });
    } catch (err) {
      console.error('Signup failed:', err);
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px] rounded-xl border border-outline-variant bg-surface-lowest p-8 shadow-card md:p-10">
        {/* Branding header */}
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-on-primary shadow-card">
            <SchoolIcon />
          </div>
          <h1 className="mb-2 text-headline-md text-primary">Create Your Account</h1>
          <p className="text-body-md text-on-surface-variant">
            Sign up to get started.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {/* First & Last name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-label-caps uppercase text-on-surface-variant">
                First Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  <UserIcon />
                </span>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-outline-variant bg-surface-lowest py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition placeholder:text-outline/50 focus:border-secondary focus:shadow-focus"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-label-caps uppercase text-on-surface-variant">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-outline-variant bg-surface-lowest px-4 py-3 text-body-md text-on-surface outline-none transition placeholder:text-outline/50 focus:border-secondary focus:shadow-focus"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-label-caps uppercase text-on-surface-variant">
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <MailIcon />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-outline-variant bg-surface-lowest py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition placeholder:text-outline/50 focus:border-secondary focus:shadow-focus"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-label-caps uppercase text-on-surface-variant">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-outline-variant bg-surface-lowest py-3 pl-10 pr-12 text-body-md text-on-surface outline-none transition placeholder:text-outline/50 focus:border-secondary focus:shadow-focus"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-label-caps uppercase text-on-surface-variant">
              Confirm Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <LockIcon />
              </span>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-outline-variant bg-surface-lowest py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition placeholder:text-outline/50 focus:border-secondary focus:shadow-focus"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3.5 text-title-sm text-on-secondary transition-all hover:bg-secondary/90 active:scale-[0.98] disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Creating account…' : 'Sign Up'}</span>
            {!isSubmitting && <ArrowIcon />}
          </button>
        </form>

        <div className="mt-8 border-t border-outline-variant pt-6 text-center">
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-secondary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
