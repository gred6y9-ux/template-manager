"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar || "",
            totalLikes: userData.totalLikes || 0,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        } else {
          // 🔥 Якщо документа нема — створюємо автоматично
          const newUserData = {
            name: firebaseUser.displayName || "Користувач",
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
            totalLikes: 0,
            createdAt: serverTimestamp(),
          };

          await setDoc(userRef, newUserData);

          setUser({
            id: firebaseUser.uid,
            name: newUserData.name,
            email: newUserData.email || "",
            avatar: newUserData.avatar || "",
            totalLikes: 0,
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userRef = doc(db, "users", firebaseUser.uid);

    await setDoc(userRef, {
      name,
      email: firebaseUser.email,
      avatar: firebaseUser.photoURL,
      totalLikes: 0,
      createdAt: serverTimestamp(),
    });
  };

  const loginWithGoogle = async () => {
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);

    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        name: firebaseUser.displayName || "Користувач",
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
        totalLikes: 0,
        createdAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}