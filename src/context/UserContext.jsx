import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

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
            let needsDbUpdate = false;

            // Pega a data de hoje e zera as horas para comparar apenas os dias
            const today = new Date();
            const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (userData.lastLogin) {
              const lastLogin = new Date(userData.lastLogin);
              const lastLoginNormalized = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

              // Calcula a diferença exata de dias
              const diffTime = todayNormalized.getTime() - lastLoginNormalized.getTime();
              const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

              if (diffDays === 1) {
                // Entrou no dia seguinte: Aumenta a ofensiva
                currentStreak += 1;
                needsDbUpdate = true;
              } else if (diffDays > 1) {
                // Pulou um ou mais dias: Perdeu a ofensiva, recomeça do 1
                currentStreak = 1;
                needsDbUpdate = true;
              }
              // Se diffDays === 0, ele já acessou hoje, então o currentStreak se mantém
            } else {
              // Não tinha data de último login salva
              currentStreak = 1;
              needsDbUpdate = true;
            }

            setStreak(currentStreak);

            // Atualiza o DB apenas se for o primeiro login de um novo dia.
            if (needsDbUpdate) {
              await updateDoc(userRef, {
                lastLogin: today.toISOString(),
                currentStreak: currentStreak
              });
            }
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

  const updateUserProfileData = async (profileUpdate) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { name, ...otherProfileData } = profileUpdate;

    // 1. Atualiza o documento privado em 'users'
    if (Object.keys(otherProfileData).length > 0) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, otherProfileData);
      setUserProfile(prev => ({ ...prev, ...otherProfileData }));
    }

    // 2. Atualiza o nome no estado (que vai sincronizar com o leaderboard)
    if (name && name !== username) {
      setUsername(name);
    }
  };

  const value = {
    user, authLoading, username, userProfile, xp, level, streak, showLevelUp,
    addXp, setUsername, setUserProfile, updateUserProfileData
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