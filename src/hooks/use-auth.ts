'use client';
import { useUser } from '@/firebase';

export const useAuth = () => {
  const { user, isUserLoading: loading, userError: error } = useUser();
  return { user, loading, error };
};
