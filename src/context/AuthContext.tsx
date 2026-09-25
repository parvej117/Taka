import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  currency: string;
  setCurrency: (c: string) => Promise<void>;
  monthlyBudget: number;
  setMonthlyBudget: (b: number) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithDemo: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState('৳');
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(35000);

  useEffect(() => {
    // Check if demo user was active
    const isDemoStored = localStorage.getItem('takatrack_is_demo');
    if (isDemoStored === 'true') {
      const demoUid = localStorage.getItem('takatrack_demo_uid') || 'demo_user_default';
      const demoUser: AppUser = {
        uid: demoUid,
        email: 'demo@takatrack.app',
        displayName: 'ডেমো ব্যবহারকারী',
        isDemo: true,
      };
      const storedBudget = Number(localStorage.getItem('takatrack_demo_budget')) || 35000;
      const storedCurr = localStorage.getItem('takatrack_demo_curr') || '৳';
      setUser(demoUser);
      setCurrencyState(storedCurr);
      setMonthlyBudgetState(storedBudget);
      setProfile({
        uid: demoUid,
        email: demoUser.email,
        displayName: demoUser.displayName,
        currency: storedCurr,
        monthlyBudget: storedBudget,
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const appU: AppUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isDemo: false,
        };
        setUser(appU);

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            if (data.currency) setCurrencyState(data.currency);
            if (data.monthlyBudget !== undefined) setMonthlyBudgetState(data.monthlyBudget);
          } else {
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              currency: '৳',
              monthlyBudget: 35000,
            };
            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setCurrency = async (newCurr: string) => {
    setCurrencyState(newCurr);
    if (user?.isDemo) {
      localStorage.setItem('takatrack_demo_curr', newCurr);
    } else if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { currency: newCurr }, { merge: true });
    }
  };

  const setMonthlyBudget = async (newBudget: number) => {
    setMonthlyBudgetState(newBudget);
    if (user?.isDemo) {
      localStorage.setItem('takatrack_demo_budget', String(newBudget));
    } else if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { monthlyBudget: newBudget }, { merge: true });
    }
  };

  const signInWithGoogle = async () => {
    localStorage.removeItem('takatrack_is_demo');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const gUser = cred.user;
    const userDocRef = doc(db, 'users', gUser.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      const initialProfile: UserProfile = {
        uid: gUser.uid,
        email: gUser.email,
        displayName: gUser.displayName || 'Google User',
        currency: '৳',
        monthlyBudget: 35000,
      };
      await setDoc(userDocRef, initialProfile);
      setProfile(initialProfile);
    }
  };

  const signInWithDemo = () => {
    let demoUid = localStorage.getItem('takatrack_demo_uid');
    if (!demoUid) {
      demoUid = 'demo_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('takatrack_demo_uid', demoUid);
    }
    localStorage.setItem('takatrack_is_demo', 'true');
    const demoUser: AppUser = {
      uid: demoUid,
      email: 'demo@takatrack.local',
      displayName: 'ডেমো ব্যবহারকারী',
      isDemo: true,
    };
    setUser(demoUser);
    setProfile({
      uid: demoUid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      currency: '৳',
      monthlyBudget: 35000,
    });
  };

  const signIn = async (email: string, pass: string) => {
    localStorage.removeItem('takatrack_is_demo');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('takatrack_is_demo');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    const initialProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name,
      currency: '৳',
      monthlyBudget: 35000,
    };
    await setDoc(doc(db, 'users', cred.user.uid), initialProfile);
    setProfile(initialProfile);
  };

  const signOut = async () => {
    localStorage.removeItem('takatrack_is_demo');
    if (auth.currentUser) {
      await fbSignOut(auth);
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        currency,
        setCurrency,
        monthlyBudget,
        setMonthlyBudget,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
