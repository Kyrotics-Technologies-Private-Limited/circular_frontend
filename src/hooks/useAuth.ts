// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { User } from '../types/User';
import { getCurrentUser } from '../services/auth.service';

interface UseAuthReturn {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for authentication functionality
 */
const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Register a new user
  const register = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName
        });
      }
      
      // Get user profile from backend
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Failed to retrieve user profile after registration');
      }
      setCurrentUser(user);
      
      return user!;
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile from backend
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Failed to retrieve user profile after login');
      }
      setCurrentUser(user);
      
      return user;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await signOut(auth);
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to log out');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateUser = async (data: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Update in Firebase Auth if the user is logged in
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
        
        // Update backend user profile
        // This would be handled by the auth service updateUserProfile method
        
        // Update local user state
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            ...data
          });
        }
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Get user profile from API
          const userProfile = await getCurrentUser();
          setCurrentUser(userProfile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to fetch user profile');
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  return {
    currentUser,
    firebaseUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateUser,
    clearError
  };
};

export default useAuth;