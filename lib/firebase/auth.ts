"use client";

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getClientAuth } from "./config";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(getClientAuth(), googleProvider);
  const idToken = await result.user.getIdToken();

  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    // Token verification failed — sign out from client to keep state clean
    await firebaseSignOut(getClientAuth());
    throw new Error("Sign in failed. Please try again.");
  }

  return result.user;
}

export async function signOut() {
  await firebaseSignOut(getClientAuth());
  await fetch("/api/auth", { method: "DELETE" });
}
