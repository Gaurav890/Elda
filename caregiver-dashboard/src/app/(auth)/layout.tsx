// Authentication Layout - Centered design for login/register pages

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auth | Elder Companion AI',
  description: 'Login or register for Elder Companion AI',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">
            Elder Companion AI
          </h1>
          <p className="text-textSecondary">Caring for your loved ones, together</p>
        </div>

        {/* Auth form card */}
        <div className="bg-surface rounded-xl shadow-soft p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
