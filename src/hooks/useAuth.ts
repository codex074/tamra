import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import type { UserProfile } from '@/types';

const DEMO_USER: UserProfile = {
  uid: 'demo-admin',
  email: 'demo@tamraya.app',
  displayName: 'Demo Pharmacist',
  role: 'admin',
  isDemo: true,
};

async function resolveUserProfile(uid: string, email: string, displayName: string): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        email,
        displayName: data.displayName ?? displayName,
        role: (data.role as UserProfile['role']) ?? 'pharmacist',
      };
    }
    // First login — create user document with default role
    const profile: UserProfile = { uid, email, displayName, role: 'pharmacist' };
    await setDoc(userRef, { ...profile, createdAt: serverTimestamp() });
    return profile;
  } catch {
    // Firestore unavailable — fall back to basic profile
    return { uid, email, displayName, role: 'pharmacist' };
  }
}

export function useAuth(): {
  user: UserProfile | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
} {
  const { user, ready, setUser, setReady } = useAuthStore();

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      setReady(true);
    }, 1200);

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        window.clearTimeout(fallbackTimer);
        if (firebaseUser) {
          void resolveUserProfile(
            firebaseUser.uid,
            firebaseUser.email ?? 'unknown@tamraya.app',
            firebaseUser.displayName ?? 'Tam-Ra-Ya User',
          ).then((profile) => {
            setUser(profile);
            setReady(true);
          });
        } else {
          setUser(null);
          setReady(true);
        }
      },
      () => {
        window.clearTimeout(fallbackTimer);
        setReady(true);
      },
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [setReady, setUser]);

  async function login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('auth.login failed', error);
      throw new Error('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน หรือใช้โหมดสาธิต');
    }
  }

  function loginDemo(): void {
    setUser(DEMO_USER);
    setReady(true);
  }

  async function logout(): Promise<void> {
    if (user?.isDemo) {
      setUser(null);
      return;
    }
    await signOut(auth);
  }

  return { user, ready, login, loginDemo, logout };
}
