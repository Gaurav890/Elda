'use client';

// Register Page

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Validation schema
const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone_number: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    // Remove confirm_password before sending to API
    const { confirm_password, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-textPrimary mb-2">
        Create your account
      </h2>
      <p className="text-textSecondary mb-6">
        Start caring for your loved ones today
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              disabled={isRegistering}
              {...register('first_name')}
            />
            {errors.first_name && (
              <p className="text-sm text-error">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              disabled={isRegistering}
              {...register('last_name')}
            />
            {errors.last_name && (
              <p className="text-sm text-error">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isRegistering}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Phone number field (optional) */}
        <div className="space-y-2">
          <Label htmlFor="phone_number">
            Phone number <span className="text-textSecondary text-sm">(optional)</span>
          </Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            autoComplete="tel"
            disabled={isRegistering}
            {...register('phone_number')}
          />
          {errors.phone_number && (
            <p className="text-sm text-error">{errors.phone_number.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isRegistering}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
              disabled={isRegistering}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isRegistering}
              {...register('confirm_password')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
              disabled={isRegistering}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-sm text-error">{errors.confirm_password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>

        {/* Terms of service */}
        <p className="text-xs text-textSecondary text-center">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      {/* Login link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-textSecondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
