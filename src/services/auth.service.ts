// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import api from './api';
import { User } from '../types/User';

/**
 * Register a new user
 */
interface RegisterUserParams {
  email: string;
  password: string;
  name: string;
  accountType: 'individual' | 'organization';
  orgName?: string;
  CIN?: string;
}

export const registerUser = async ({
  email,
  password,
  name,
  accountType,
  orgName,
  CIN
}: RegisterUserParams): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name // Firebase Auth still uses displayName
      });
    }
    
    // Get ID token for backend authentication
    const idToken = await userCredential.user.getIdToken();
    
    // Create user profile in backend with account type info
    const response = await api.post('/auth/createUser', 
      {
        name,
        accountType,
        ...(accountType === 'organization' ? { orgName, CIN } : {})
      },
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );
    
    if (!response.data.success) {
      // If backend registration fails, delete the Firebase Auth user to maintain consistency
      await userCredential.user.delete();
      throw new Error(response.data.message || 'Failed to create user profile');
    }
    
    return response.data.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    // Return a more specific error message if available
    throw new Error(error.message || 'Registration failed');
  }
};

// export const registerUser = async (email: string, password: string, displayName: string): Promise<User> => {
//   try {
//     // Create user in Firebase Auth
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
//     // Update display name
//     if (userCredential.user) {
//       await updateProfile(userCredential.user, {
//         displayName
//       });
//     }
    
//     // Create user profile in backend
//     const response = await api.post('/auth/createUser');
//     return response.data.user;
//   } catch (error) {
//     console.error('Registration error:', error);
//     throw error;
//   }
// };

/**
 * Login user
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    
    // Get user profile from backend
    const response = await api.post('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
// export const loginUser = async (email: string, password: string) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
//     // console.log('userCredential',userCredential)
//     return userCredential.user;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/profile');
    console.log('response',response.data.user.role)
    return response.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: { displayName?: string; photoURL?: string }): Promise<void> => {
  try {
    // Update in backend
    await api.put('/auth/profile', data);
    
    // Update in Firebase Auth if the user is logged in
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: data.displayName || user.displayName,
        photoURL: data.photoURL || user.photoURL
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Get All Users
 */
export const getAllUsers = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/getAllUsers');
    return response.data.users;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get Firebase user
 */
export const getFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
