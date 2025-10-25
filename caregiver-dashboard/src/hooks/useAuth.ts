// Authentication Hook

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  login as loginApi,
  register as registerApi,
  getCurrentCaregiver,
  updateProfile,
  changePassword as changePasswordApi,
} from '@/lib/api/auth';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Caregiver,
  ChangePasswordRequest,
} from '@/types/auth';
import { clearAuthData, getUser, isAuthenticated } from '@/lib/auth/storage';
import { useToast } from '@/hooks/use-toast';

/**
 * Authentication hook for login, register, and user management
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user is authenticated
  const authenticated = isAuthenticated();

  // Get current user from localStorage
  const currentUser = getUser();

  // Fetch current caregiver profile (only if authenticated)
  const { data: caregiver, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['caregiver', 'me'],
    queryFn: getCurrentCaregiver,
    enabled: authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => loginApi(credentials),
    onSuccess: (data: AuthResponse) => {
      // Invalidate caregiver query to refetch
      queryClient.invalidateQueries({ queryKey: ['caregiver'] });

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${data.caregiver.first_name} ${data.caregiver.last_name}`,
      });

      // Redirect to care circle page
      router.push('/care-circle');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Invalid email or password';
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (data: AuthResponse) => {
      // Invalidate caregiver query to refetch
      queryClient.invalidateQueries({ queryKey: ['caregiver'] });

      toast({
        title: 'Account created!',
        description: `Welcome, ${data.caregiver.first_name}!`,
      });

      // Redirect to care circle page
      router.push('/care-circle');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Failed to create account. Please try again.';
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Caregiver>) => updateProfile(data),
    onSuccess: (data: Caregiver) => {
      // Update cache
      queryClient.setQueryData(['caregiver', 'me'], data);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast({
        title: 'Update failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePasswordApi(data),
    onSuccess: () => {
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to change password';
      toast({
        title: 'Password change failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  // Logout function
  const logout = () => {
    clearAuthData();
    queryClient.clear();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    router.push('/login');
  };

  return {
    // State
    isAuthenticated: authenticated,
    caregiver: caregiver || currentUser,
    isLoadingProfile,

    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    logout,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
