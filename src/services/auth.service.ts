// src/services/auth.service.ts
import {
  // createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import api from "./api";
import { User } from "../types/User";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/**
 * Register a new user
 */
interface RegisterUserParams {
  email: string;
  password: string;
  name: string;
  accountType: "individual" | "organization";
  organizationName?: string;
  state?: string; phoneNumber?: string; country?: string;
}

export const registerUser = async ({
  email,
  password,
  name,
  accountType,
  organizationName,
  state,
  phoneNumber,
  country,
}: RegisterUserParams): Promise<User> => {
  try {
    const response = await api.post("/auth/createUser", {
      name,
      email,
      password,
      state,
      phoneNumber,
      country,
      accountType,
      ...(accountType === "organization" ? { organizationName } : {}),
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
    // console.log("idToken", idToken);
    const response = await api.post("/auth/lastLogin", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    // console.log("response", response);
    if (response) {
      // toast.success("Successfully logged in");
      toast.success("🎉 Login successful! Welcome back! 🚀");

    }
    return response.data.user;
  } catch (error) {
    // console.log("Login error:", error);
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
        case "auth/user-disabled":
          message =
            "Oops! Your account is currently disabled. 🚫 Need help? Reach out to your admin for assistance! 🛠️.";

          break;
        default:
          message = (error as any).message || message;
      }
    } else {
      message = (error as any).message || message;
      // toast.error(message);
    }
    toast.error(message);

    // toast.error(message);
    // console.log("message", message);
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
    return response.data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};


// export const getCurrentUser = async (): Promise<User | null> => {
//   try {
//     const response = await api.get("/auth/profile");
//     return response.data.user;
//   } catch (error: any) {
//     // Check if error has a response with data
//     if (error.response && error.response.data) {
//       const errorMessage = error.response.data.message || 'Failed to fetch user profile';
//       const statusCode = error.response.status;

//       // Display error using toast
//       toast.error(`${errorMessage} (${statusCode})`, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });

//       console.error("Profile fetch error:", {
//         status: statusCode,
//         message: errorMessage
//       });
//     } else {
//       // For network errors or other issues
//       toast.error('Network error or server unavailable', {
//         position: "top-center",
//         autoClose: 5000,
//       });
//       console.error("Error getting current user:", error);
//     }

//     return null;
//   }
// };

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

/**
 * Disable user
 */
export const disableUser = async (uid: string): Promise<void> => {
  try {
    await api.post("/auth/disable", { uid });
  } catch (error) {
    console.error("Error disabling user:", error);
    throw error;
  }
};
/**
 * Enable user
 */
export const enableUser = async (uid: string): Promise<void> => {
  try {
    await api.post("/auth/enable", { uid });
  } catch (error) {
    console.error("Error enabling user:", error);
    throw error;
  }
};
