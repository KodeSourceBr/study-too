import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userProfile, setUserProfile] = useState({ email: '', educationLevel: '', birthDate: '' });
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', currentUser.uid);
          const publicSnap = await getDoc(publicRef);
          if (publicSnap.exists()) {
            const data = publicSnap.data();
            setUsername(data.name || "");
            setXp(data.xp || 0);
            setLevel(data.level || 0);
          }

          const privateRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'profile');
          const privateSnap = await getDoc(privateRef);
          if (privateSnap.exists()) {
            setUserProfile(privateSnap.data());
          }
          
          const statsRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'stats', 'streakInfo');
          const statsSnap = await getDoc(statsRef);
          let currentStreak = 0;
          if (statsSnap.exists()) {
              const data = statsSnap.data();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
              currentStreak = data.currentStreak || 0;
              if(lastLogin){
                  const lastLoginDate = new Date(lastLogin);
                  lastLoginDate.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil(Math.abs(today - lastLoginDate) / (1000 * 60 * 60 * 24));
                  if(diffDays > 1) {
                      currentStreak = 0; // Streak broken
                  }
              }
          }
          setStreak(currentStreak);
          await setDoc(statsRef, { lastLogin: new Date().toISOString(), currentStreak }, { merge: true });

        } catch (e) {
          console.error("Error fetching user data", e);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    const calculatedLevel = Math.floor(xp / 100);
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [xp, level]);
  
  useEffect(() => {
    if (!user || authLoading) return;
    const syncUserToLeaderboard = async () => {
      try {
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid);
        await setDoc(userRef, { name: username, xp: xp, level: level, updatedAt: Date.now(), isMe: true }, { merge: true });
      } catch (error) { console.error(error); }
    };
    const timeoutId = setTimeout(syncUserToLeaderboard, 1500);
    return () => clearTimeout(timeoutId);
  }, [user, xp, level, username, authLoading]);

  const addXp = (amount) => setXp(prev => prev + amount);

  const incrementStreak = async () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (user) {
        const statsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'streakInfo');
        await setDoc(statsRef, { currentStreak: newStreak, lastLogin: new Date().toISOString() }, { merge: true });
    }
  };

  const value = {
    user, authLoading, username, userProfile, xp, level, streak, showLevelUp,
    addXp, incrementStreak, setUsername, setUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};