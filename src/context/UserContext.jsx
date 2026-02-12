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
          // 1. Busca dados do Ranking
          const publicRef = doc(db, 'leaderboard', currentUser.uid);
          const publicSnap = await getDoc(publicRef);
          if (publicSnap.exists()) {
            const data = publicSnap.data();
            setUsername(data.name || "");
            setXp(data.xp || 0);
            setLevel(data.level || 0);
          }

          // 2. Busca dados do Perfil e Streak (Centralizado em 'users')
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserProfile(userData);

            // Lógica de Streak (Ofensiva)
            let currentStreak = userData.currentStreak || 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (userData.lastLogin) {
              const lastLoginDate = new Date(userData.lastLogin);
              lastLoginDate.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil(Math.abs(today - lastLoginDate) / (1000 * 60 * 60 * 24));

              if (diffDays > 1) {
                currentStreak = 0; // Ofensiva quebrada
              }
            }

            setStreak(currentStreak);
            // Atualiza o último login no mesmo documento
            await setDoc(userRef, {
              lastLogin: new Date().toISOString(),
              currentStreak
            }, { merge: true });
          }

        } catch (e) {
          console.error("Erro ao carregar dados do usuário:", e);
        }
      } else {
        // Limpa o estado quando o usuário faz logout
        setUsername("");
        setUserProfile({ email: '', educationLevel: '', birthDate: '' });
        setXp(0);
        setLevel(0);
        setStreak(0);
      }
      // Garante que o carregamento termine independente de erro
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
        const userRef = doc(db, 'leaderboard', user.uid);
        await setDoc(userRef, { name: username, xp: xp, level: level, updatedAt: Date.now() }, { merge: true });
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
      // Alterar para (salvando direto no perfil do usuário):
      const statsRef = doc(db, 'users', user.uid);
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