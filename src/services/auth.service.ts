// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import api from "./api";
import { User } from "../types/User";

/**
 * Register a new user
 */
interface RegisterUserParams {
  email: string;
  password: string;
  name: string;
  accountType: "individual" | "organization";
  organizationName?: string;
  CIN?: string;
}

export const registerUser = async ({
  email,
  password,
  name,
  accountType,
  organizationName,
  CIN,
}: RegisterUserParams): Promise<User> => {
  try {
    const response = await api.post("/auth/createUser", {
      name,
      email,
      password,
      accountType,
      ...(accountType === "organization" ? { organizationName, CIN } : {}),
    });

    // if (response.data.success) {
    //   const userCredential = await createUserWithEmailAndPassword(
    //     auth,
    //     email,
    //     password
    //   );

    //   if (userCredential.user) {
    //     await updateProfile(userCredential.user, {
    //       displayName: name,
    //     });
    //   }
    // } else {
    //   throw new Error(response.data.message || "Failed to create user profile");
    // }

    return response.data.user;
  } catch (error: any) {
    console.error("Registration error:", error);
    // Return a more specific error message if available
    throw new Error(error.message || "Registration failed");
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
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    const response = await api.post("/auth/lastlogin", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.user;
  } catch (error) {
    console.error("Login error:", error);
    let message = "An error occurred. Please try again.";
    if (error && typeof error === "object" && "code" in error) {
      const errorCode = (error as any).code;
      switch (errorCode) {
        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;
        case "auth/invalid-email":
          message = "Email not found.";
          break;
        case "auth/too-many-requests":
          message = "Too many login attempts. Please try again later.";
          break;
        case "auth/user-not-found":
          message = "No user found with this email.";
          break;
        case "auth/wrong-password":
          message = "Invalid email or password.";
          break;
        case "auth/network-request-failed":
          message = "Check your Internet Connection.";
          break;
        default:
          message = (error as any).message || message;
      }
    } else {
      message = (error as any).message || message;
    }

    // toast.error(message);
    console.log("message",message);
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
    console.error("Logout error:", error);
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
    console.error("Password reset error:", error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/profile");
    console.log("response", response.data.user.role);
    return response.data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> => {
  try {
    // Update in backend
    await api.put("/auth/profile", data);

    // Update in Firebase Auth if the user is logged in
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: data.displayName || user.displayName,
        photoURL: data.photoURL || user.photoURL,
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Get All Users
 */
export const getAllUsers = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/getAllUsers");
    return response.data.users;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get Firebase user
 */
export const getFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
