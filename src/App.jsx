import React, { useState, useEffect } from 'react';
import {
  Flame,
  Trophy,
  Clock,
  PlusSquare,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Brain,
  Zap,
  Save,
  History,
  Trash2,
  Edit3,
  RotateCcw,
  XCircle,
  FlipHorizontal,
  Layers,
  MoreHorizontal,
  Play,
  Settings2,
  Crown,
  Medal,
  ArrowUpCircle,
  User,
  Target,
  CalendarCheck,
  Coffee,
  Pause,
  Monitor,
  ArrowRight,
  Sparkles,
  LogOut,
  BarChart3,
  Lock,
  UserCircle,
  Mail,
  Calendar,
  GraduationCap
} from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import PomodoroTimer from './components/PomodoroTimer';
import FlashcardModal from './components/FlashcardModal';
import DailyGoalWidget from './components/DailyGoalWidget';
import RankingModal from './components/RankingModal';
import ReviewModal from './components/ReviewModal';
import DeckOptionsModal from './components/DeckOptionsModal';
import ConfirmationModal from './components/ConfirmationModal';
import { UserProvider, useUser } from './context/UserContext';

// --- Firebase Imports ---
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, appId } from './services/firebase';

// --- SRS Constants ---
const SRS_INTERVALS = [1, 3, 7, 15, 30]; // Dias para próximas revisões

// --- Sub-componente para o Carrossel na Sidebar ---
const FlashcardDeck = ({ deck, onOpenOptions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (currentIndex >= (deck.cards || []).length) {
      setCurrentIndex(0);
    }
  }, [deck.cards, currentIndex]);

  const cards = deck.cards || [];
  const hasCards = cards.length > 0;

  const nextCard = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex] || { front: '?', back: '?' };

  return (
    <div className="group w-full flex flex-col gap-2 p-3 text-sm rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
      <div
        onClick={() => onOpenOptions(deck)}
        className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1 hover:bg-slate-50 -mx-3 px-3 pt-1 rounded-t-xl transition-colors"
        title="Clique para opções do deck"
      >
        <div className="font-bold text-indigo-700 text-xs truncate flex items-center gap-1.5">
          <Layers size={12} />
          {deck.title}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {hasCards ? currentIndex + 1 : 0}/{cards.length}
          </div>
          <Settings2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {hasCards ? (
        <div
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
          className="relative min-h-[80px] flex items-center justify-center text-center p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-indigo-50/30 transition-colors"
        >
          <div className="text-xs text-slate-700 font-medium leading-relaxed px-4 select-none">
            {isFlipped ? (
              <span className="text-emerald-600 font-bold animate-in fade-in duration-300">{currentCard.back}</span>
            ) : (
              <span className="animate-in fade-in duration-300">{currentCard.front}</span>
            )}
          </div>

          <div className="absolute top-1 right-1 text-[8px] uppercase font-bold text-slate-300">
            {isFlipped ? 'Verso' : 'Frente'}
          </div>
        </div>
      ) : (
        <div className="min-h-[80px] flex items-center justify-center text-xs text-slate-400 italic">
          Vazio
        </div>
      )}

      {cards.length > 1 && (
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            onClick={prevCard}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] text-slate-300 font-medium select-none">Navegar</span>
          <button
            onClick={nextCard}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  // --- State Management ---
  const {
    user, authLoading, username, userProfile, xp, level, streak, showLevelUp,
    addXp, incrementStreak, setUsername, setUserProfile
  } = useUser();

  const [isInApp, setIsInApp] = useState(false); // Controls Login Screen vs App
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [editorMode, setEditorMode] = useState('blank');
  const [totalPomodoros, setTotalPomodoros] = useState(0);

  // UI State
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Session State
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Flashcard & Deck State
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const [deckToEdit, setDeckToEdit] = useState(null);

  // Data State
  const [decks, setDecks] = useState([
    {
      id: 'demo-deck-1',
      title: 'Neurociência da Aprendizagem',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      cards: [
        {
          id: 101,
          front: 'O que é Recuperação Ativa (Active Recall)?',
          back: 'É o esforço consciente de resgatar uma informação da memória sem consultar o material original. É a forma mais eficiente de fortalecer conexões neurais.'
        },
        {
          id: 102,
          front: 'O que combate a Curva do Esquecimento de Ebbinghaus?',
          back: 'A Repetição Espaçada. Revisar o conteúdo em intervalos de tempo crescentes para interromper o decaimento da memória.'
        },
        {
          id: 103,
          front: 'Qual o papel do sono na aprendizagem?',
          back: 'Durante o sono, especialmente o REM, ocorre a consolidação da memória: a transferência de informações do hipocampo (curto prazo) para o neocórtex (longo prazo).'
        },
        {
          id: 104,
          front: 'O que é a Ilusão de Competência?',
          back: 'A sensação falsa de dominar um assunto ao reler passivamente um texto. O cérebro reconhece a informação visualmente, mas não criou caminhos neurais para utilizá-la.'
        }
      ]
    }
  ]);
  const [deletedDecks, setDeletedDecks] = useState([]);
  const [realRankingData, setRealRankingData] = useState([]);

  const [savedNotes, setSavedNotes] = useState([
    {
      id: 1,
      title: 'Como o Cérebro Aprende',
      date: '18/01/2026 às 09:00',
      main: 'O aprendizado físico ocorre através da alteração na força das conexões sinápticas, processo conhecido como Potenciação de Longa Duração (LTP). Para que a memória se torne permanente, é necessária a síntese de novas proteínas nos neurônios.',
      cues: 'Sinapse, LTP, Neuroplasticidade',
      summary: 'Aprender é biologicamente mudar a estrutura física do cérebro através da repetição e intensidade do estímulo.',
      mode: 'cornell',
      srsStage: 0,
      nextReviewDate: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Mitos do Estudo Passivo',
      date: '17/01/2026 às 14:30',
      main: 'Métodos populares como reler, grifar e resumir copiando são de baixa utilidade. Eles não exigem esforço cognitivo suficiente para sinalizar ao cérebro que a informação é importante.',
      cues: '',
      summary: '',
      mode: 'blank',
      srsStage: 1,
      nextReviewDate: new Date(Date.now() + 86400000 * 2).toISOString()
    }
  ]);

  const [deletedNotes, setDeletedNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({
    title: '',
    main: '',
    cues: '',
    summary: ''
  });

  // --- Auth Handlers ---
  const createProfile = async (user, details) => {
    const name = details.name || user.displayName;
    const email = details.email || user.email;

    if (!name || !user) return;

    try {
      const profileData = {
        email: email,
        birthDate: details.birthDate || null,
        educationLevel: details.educationLevel || 'nao-informado',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        currentStreak: 1,
      };

      const publicRef = doc(db, 'leaderboard', user.uid);
      await setDoc(publicRef, {
        name: name,
        xp: 0,
        level: 0,
        updatedAt: Date.now(),
      });

      const privateRef = doc(db, 'users', user.uid);
      await setDoc(privateRef, profileData);

      // Manually update context after profile creation for social logins
      // For email/pass, onAuthStateChanged will handle it, but this ensures UI updates instantly.
      if (user.uid === auth.currentUser?.uid) {
        setUsername(name);
        setUserProfile(profileData);
      }

    } catch (e) {
      console.error("Error creating profile", e);
      setAuthError("Ocorreu um erro ao criar seu perfil.");
    }
  };

  const handleRegister = async (formData) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await createProfile(userCredential.user, formData); // formData works as 'details'
      // onAuthStateChanged will handle logging the user in.
    } catch (e) {
      console.error("Error during registration", e);
      if (e.code === 'auth/email-already-in-use') {
        setAuthError("Este e-mail já está em uso. Tente fazer login.");
      } else if (e.code === 'auth/weak-password') {
        setAuthError("A senha é muito fraca. Use pelo menos 6 caracteres.");
      } else {
        setAuthError("Ocorreu um erro no cadastro. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest.
    } catch (e) {
      console.error("Error during login", e);
      switch (e.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found': // Legacy code, good to handle
        case 'auth/wrong-password': // Legacy code, good to handle
          setAuthError("E-mail ou senha inválidos. Verifique e tente novamente.");
          break;
        case 'auth/too-many-requests':
          setAuthError("Acesso bloqueado temporariamente devido a muitas tentativas. Tente novamente mais tarde.");
          break;
        default:
          setAuthError("Ocorreu um erro inesperado ao tentar fazer login.");
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if it's a new user by trying to get their profile
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await createProfile(user, { name: user.displayName, email: user.email });
      }
    } catch (error) {
      console.error("Error during Google sign-in", error);
      setAuthError("Falha ao entrar com Google. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsInApp(false);
    setShowProfile(false);
  };

  // --- Session Timer ---
  useEffect(() => {
    if (!isInApp) return; // Only count time when inside app
    const sessionInterval = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(sessionInterval);
  }, [isInApp]);

  // --- Handler para o Pomodoro ---
  const handlePomodoroFinish = () => {
    setTotalPomodoros(prev => prev + 1);
    addXp(50);
  };

  // --- Firebase & Data Effects ---
  useEffect(() => {
    if (!user) return;
    const leaderboardRef = collection(db, 'leaderboard');
    const unsubscribe = onSnapshot(leaderboardRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
      users.sort((a, b) => b.xp - a.xp);
      setRealRankingData(users.slice(0, 50));
    });
    return () => unsubscribe();
  }, [user]);

  // --- Deck Deletion Handlers ---
  const moveDeckToTrash = (id) => {
    const deck = decks.find(d => d.id === id);
    if (deck) {
      setDeletedDecks(prev => [deck, ...prev]);
      setDecks(prev => prev.filter(d => d.id !== id));
      closeDeckOptions();
    }
  };

  const restoreDeck = (id) => {
    const deck = deletedDecks.find(d => d.id === id);
    if (deck) {
      setDecks(prev => [deck, ...prev]);
      setDeletedDecks(prev => prev.filter(d => d.id !== id));
      addXp(5);
    }
  };

  const requestPermanentDeleteDeck = (id) => {
    setItemToDelete({ id, type: 'deck' });
    setShowDeleteConfirm(true);
  };

  // --- Handlers (General) ---
  const handleOpenDeckOptions = (deck) => setSelectedDeck(deck);
  const closeDeckOptions = () => setSelectedDeck(null);

  const handleStartReview = () => {
    setIsReviewing(true);
  };

  const closeReview = () => {
    setIsReviewing(false);
    setSelectedDeck(null);
  };

  const handleEditDeck = () => {
    if (!selectedDeck) return;
    setDeckToEdit(selectedDeck);
    setShowFlashcardModal(true);
    closeDeckOptions();
  };

  const openFlashcardModal = () => {
    setDeckToEdit(null);
    setShowFlashcardModal(true);
  };

  const closeFlashcardModal = () => {
    setShowFlashcardModal(false);
    setTimeout(() => setDeckToEdit(null), 300);
  };

  const handleSaveDeck = ({ editingDeckId, title, cards }) => {
    if (cards.length === 0) return;

    if (editingDeckId) {
      setDecks(prev => prev.map(d =>
        d.id === editingDeckId
          ? { ...d, title: title || d.title, cards: cards }
          : d
      ));
      addXp(5);
    } else {
      const newDeck = {
        id: Date.now(),
        title: title || `Deck Sem Título ${decks.length + 1}`,
        cards: cards,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setDecks(prev => [newDeck, ...prev]);
      addXp((cards.length * 10) + 20);
      incrementStreak();
    }
    closeFlashcardModal();
  };

  const resetEditor = () => {
    setActiveNoteId(null);
    setCurrentNote({ title: '', main: '', cues: '', summary: '' });
    setLastSaved("");
    setShowTrash(false);
  };

  const loadNote = (note) => {
    if (!note) return;
    setActiveNoteId(note.id);
    setEditorMode(note.mode || 'blank');
    setCurrentNote({ title: note.title || '', main: note.main || '', cues: note.cues || '', summary: note.summary || '' });
    setLastSaved(note.date || "");
  };

  const moveToTrash = (id, e) => {
    if (e) e.stopPropagation();
    const noteToTrash = savedNotes.find(n => n.id === id);
    if (noteToTrash) {
      setDeletedNotes(prev => [noteToTrash, ...prev]);
      setSavedNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) resetEditor();
    }
  };

  const restoreNote = (id, e) => {
    if (e) e.stopPropagation();
    const noteToRestore = deletedNotes.find(n => n.id === id);
    if (noteToRestore) {
      setSavedNotes(prev => [noteToRestore, ...prev]);
      setDeletedNotes(prev => prev.filter(n => n.id !== id));
      addXp(5);
    }
  };

  const requestPermanentDeleteNote = (id, e) => {
    if (e) e.stopPropagation();
    setItemToDelete({ id, type: 'note' });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'note') {
      setDeletedNotes(prev => prev.filter(n => n.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'deck') {
      setDeletedDecks(prev => prev.filter(d => d.id !== itemToDelete.id));
    }

    setItemToDelete(null);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setItemToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleCompleteReview = (noteId, e) => {
    e.stopPropagation();
    setSavedNotes(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      const currentStage = note.srsStage || 0;
      const nextStage = Math.min(currentStage + 1, SRS_INTERVALS.length - 1);
      const daysToAdd = SRS_INTERVALS[currentStage];
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      addXp(25);
      return { ...note, srsStage: nextStage, nextReviewDate: nextDate.toISOString() };
    }));
  };

  const handleSave = () => {
    if (!currentNote.title.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (activeNoteId) {
        setSavedNotes(prev => prev.map(note => note.id === activeNoteId ? { ...note, ...currentNote, date: timestamp, mode: editorMode } : note));
        addXp(5);
      } else {
        const newId = Date.now();
        const newSavedNote = { ...currentNote, id: newId, date: timestamp, mode: editorMode, srsStage: 0, nextReviewDate: tomorrow.toISOString() };
        setSavedNotes(prev => [newSavedNote, ...prev]);
        setActiveNoteId(newId);
        addXp(15);
        incrementStreak();
      }
      setLastSaved(timestamp);
      setIsSaving(false);
    }, 600);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 3000);
  };

  // Helper for Scheduled Reviews Filter
  const getDueReviews = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return savedNotes.filter(note => {
      if (!note.nextReviewDate) return false;
      const reviewDate = new Date(note.nextReviewDate);
      return reviewDate <= today;
    }).sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
  };

  const dueReviews = getDueReviews();
  const saveButtonLabel = isSaving ? (activeNoteId ? 'Atualizando...' : 'Salvando...') : (activeNoteId ? 'Atualizar Nota' : 'Salvar Nota');

  // --- Main Render Decision ---
  useEffect(() => {
    if (!authLoading && user && userProfile.email) {
      setIsInApp(true);
    }
  }, [authLoading, user, userProfile.email]);
  if (!isInApp || authLoading) {
    return <LoginScreen onRegister={handleRegister} onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} initialName={username} isLoading={isSubmitting || authLoading} error={authError} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">

      {/* Sidebar Histórico */}
      <aside className="w-72 border-r border-slate-200 bg-white flex flex-col p-4 overflow-hidden">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Brain className="text-white size-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-indigo-900">Study Too</h1>
        </div>

        {/* ... (Menu lateral inalterado) ... */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setShowTrash(false)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${!showTrash ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <History size={12} /> Notas
              </button>
              <button
                onClick={() => setShowTrash(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${showTrash ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Trash2 size={12} /> Excluídas
              </button>
            </div>
            {!showTrash && (
              <button onClick={resetEditor} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Nova Anotação"><PlusSquare size={18} /></button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {!showTrash && savedNotes.map((note) => (
              <div key={note.id} onClick={() => loadNote(note)} className={`group relative w-full flex flex-col items-start gap-0.5 px-3 py-3 text-sm rounded-xl transition-all cursor-pointer border ${activeNoteId === note.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50'}`}>
                <div className={`font-bold truncate w-48 ${activeNoteId === note.id ? 'text-indigo-700' : 'text-slate-700'}`}>{note.title || 'Sem título'}</div>
                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">{activeNoteId === note.id && <Edit3 size={10} className="text-indigo-400" />}{String(note.date)}</div>
                <button onClick={(e) => moveToTrash(note.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="Mover para Lixeira"><Trash2 size={14} /></button>
              </div>
            ))}

            {!showTrash && (
              <div className="pt-6 mt-4">
                <div className="flex items-center gap-2 px-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-white z-10"><Layers size={14} /> Meus Decks</div>
                {decks.map(deck => (<FlashcardDeck key={deck.id} deck={deck} onOpenOptions={handleOpenDeckOptions} />))}
              </div>
            )}

            {/* SEÇÃO DA LIXEIRA RESTAURADA */}
            {showTrash && (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <FileText size={10} /> Notas
                  </div>
                  {deletedNotes.length === 0 ? (
                    <div className="px-3 py-4 text-center border border-dashed border-slate-100 rounded-xl">
                      <p className="text-xs text-slate-400">Vazio</p>
                    </div>
                  ) : (
                    deletedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="group relative w-full flex flex-col items-start gap-0.5 px-3 py-3 text-sm rounded-xl border border-transparent bg-red-50/30 hover:bg-red-50/60 transition-all cursor-default mb-1"
                      >
                        <div className="font-bold truncate w-32 text-slate-600 line-through decoration-slate-300">
                          {note.title || 'Sem título'}
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={(e) => restoreNote(note.id, e)} className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-md" title="Restaurar"><RotateCcw size={14} /></button>
                          <button onClick={(e) => requestPermanentDeleteNote(note.id, e)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md" title="Excluir"><XCircle size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Layers size={10} /> Decks
                  </div>
                  {deletedDecks.length === 0 ? (
                    <div className="px-3 py-4 text-center border border-dashed border-slate-100 rounded-xl">
                      <p className="text-xs text-slate-400">Vazio</p>
                    </div>
                  ) : (
                    deletedDecks.map((deck) => (
                      <div
                        key={deck.id}
                        className="group relative w-full flex flex-col items-start gap-0.5 px-3 py-3 text-sm rounded-xl border border-transparent bg-red-50/30 hover:bg-red-50/60 transition-all cursor-default mb-1"
                      >
                        <div className="font-bold truncate w-32 text-slate-600 line-through decoration-slate-300 flex items-center gap-1.5">
                          <Layers size={10} /> {deck.title || 'Sem título'}
                        </div>
                        <div className="text-[9px] text-slate-400 italic pl-4">{(deck.cards || []).length} cards</div>

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => restoreDeck(deck.id)} className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-md" title="Restaurar"><RotateCcw size={14} /></button>
                          <button onClick={() => requestPermanentDeleteDeck(deck.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md" title="Excluir"><XCircle size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {!showTrash && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3 flex items-center gap-2"><CalendarCheck size={14} /> Revisões (SRS)</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {dueReviews.length === 0 ? <div className="text-[10px] text-slate-400 px-2 italic">Tudo em dia!</div> : dueReviews.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
                  <div onClick={() => loadNote(note)} className="text-xs font-medium truncate pr-2 text-slate-700 cursor-pointer flex-1">{note.title}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">{SRS_INTERVALS[note.srsStage || 0]}d</div>
                    <button onClick={(e) => handleCompleteReview(note.id, e)} className="p-1 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors" title="Marcar revisão"><CheckCircle2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 cursor-default group">
              <Flame className="text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" />
              <span className="font-bold text-slate-700">{streak} dias</span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowRanking(true)} className="flex items-center justify-center p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all"><Trophy size={18} /></button>
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between items-end w-40 px-1"><div className="text-xs font-bold text-indigo-600">Nível {level}</div><div className="text-[10px] font-bold text-slate-400">{xp % 100} / 100 XP</div></div>
                <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${(xp % 100)}%` }}></div>{(xp % 100) >= 95 && <div className="absolute right-0 top-0 h-full w-2 bg-amber-400 animate-pulse"></div>}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}><Save size={16} className={isSaving ? 'animate-spin' : ''} />{saveButtonLabel}</button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setEditorMode('blank')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${editorMode === 'blank' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Simples</button>
              <button onClick={() => setEditorMode('cornell')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${editorMode === 'cornell' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Cornell</button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-white">
          <div className="max-w-3xl mx-auto min-h-full">
            <div className="mb-8">
              <input type="text" value={currentNote.title} onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })} placeholder="Título da Sessão..." className="w-full text-4xl font-extrabold text-slate-800 placeholder:text-slate-200 focus:outline-none" />
              {lastSaved && <div className="flex items-center gap-1.5 mt-2 text-slate-400 text-xs font-medium animate-in fade-in"><CheckCircle2 size={12} className="text-emerald-500" /><span>{activeNoteId ? 'Atualizado' : 'Salvo'} em {String(lastSaved)}</span></div>}
            </div>

            {editorMode === 'blank' ? (
              <textarea value={currentNote.main} onChange={(e) => setCurrentNote({ ...currentNote, main: e.target.value })} className="w-full h-[60vh] text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none" placeholder="Escreva livremente..." onPaste={handlePaste} />
            ) : (
              <div className="grid grid-cols-4 gap-6 min-h-[70vh]">
                <div className="col-span-1 border-r border-slate-100 pr-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tópicos</h4>
                  <textarea value={currentNote.cues} onChange={(e) => setCurrentNote({ ...currentNote, cues: e.target.value })} className="w-full h-full text-sm font-medium text-indigo-600 placeholder:text-slate-200 resize-none focus:outline-none" placeholder="Keywords..." onPaste={handlePaste} />
                </div>
                <div className="col-span-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Notas</h4>
                  <textarea value={currentNote.main} onChange={(e) => setCurrentNote({ ...currentNote, main: e.target.value })} className="w-full h-[50vh] text-base leading-relaxed text-slate-700 placeholder:text-slate-200 resize-none focus:outline-none" placeholder="Desenvolva os conceitos..." onPaste={handlePaste} />
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Resumo</h4>
                    <textarea value={currentNote.summary} onChange={(e) => setCurrentNote({ ...currentNote, summary: e.target.value })} className="w-full h-32 text-sm text-slate-600 italic placeholder:text-slate-200 resize-none focus:outline-none bg-slate-50 p-4 rounded-xl" placeholder="Sintetize aqui..." onPaste={handlePaste} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showPasteWarning && <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce"><AlertCircle size={18} className="text-amber-400" /><p className="text-sm font-medium">Codificação ativa: tente não colar conteúdo pronto.</p></div>}
      </main>

      {/* Right Sidebar - Tools */}
      <aside className="w-72 border-l border-slate-200 bg-slate-50/50 flex flex-col p-6 space-y-8 overflow-y-auto">

        <PomodoroTimer onFinishSession={handlePomodoroFinish} />

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Gatilhos</h3>
          <button onClick={openFlashcardModal} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all group">
            <div className="flex items-center gap-3"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Zap size={18} /></div><div className="text-left"><div className="text-sm font-bold">Criar Flashcards</div></div></div><ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>
        <DailyGoalWidget sessionSeconds={sessionSeconds} />

        {/* Profile Footer (Bottom Right) */}
        <div className="mt-auto border-t border-slate-200 pt-6">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-200 group-hover:text-indigo-800 transition-colors">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-slate-700 truncate text-sm">{username || 'Usuário'}</div>
              <div className="text-[10px] text-slate-400">Ver Perfil</div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Demais Modais... */}
      {showLevelUp && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-amber-400">
            <ArrowUpCircle size={24} className="text-amber-300 animate-bounce" />
            <div className="text-sm font-bold">
              <span className="text-amber-300">LEVEL UP!</span> Você alcançou o Nível {level}!
            </div>
          </div>
        </div>
      )}

      {/* NOVO: Modal de Perfil */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <User size={20} className="text-white" />
                <h3 className="font-bold text-lg">Meu Perfil</h3>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="p-1.5 hover:bg-indigo-500 rounded-full text-indigo-100 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 bg-slate-50 min-h-[250px] flex flex-col gap-6">

              {/* User Info & Edit */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-indigo-200 text-indigo-600 flex items-center justify-center text-3xl font-bold mb-3 shadow-inner">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>

                <h2 className="text-xl font-bold text-slate-800">{username}</h2>
                <div className="flex flex-col items-center mt-1">
                  <p className="text-xs text-slate-400">Estudante Nível {level}</p>
                  <div className="text-[10px] text-slate-300 mt-0.5">{userProfile.email}</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">XP Total</div>
                  <div className="text-lg font-bold text-indigo-600 flex items-center gap-1">
                    <Zap size={16} /> {xp}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Ofensiva</div>
                  <div className="text-lg font-bold text-orange-500 flex items-center gap-1">
                    <Flame size={16} /> {streak} dias
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center col-span-2">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Foco Total</div>
                  <div className="text-lg font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={16} /> {totalPomodoros} ciclos ({totalPomodoros * 25} min)
                  </div>
                </div>
              </div>

              {/* Extra Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Escolaridade:</span>
                  <span className="capitalize">{userProfile.educationLevel.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Nascimento:</span>
                  <span>{userProfile.birthDate ? userProfile.birthDate.split('-').reverse().join('/') : '-'}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors mt-auto border border-transparent hover:border-red-100"
              >
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Excluir Definitivamente?"
        message={`Essa ação não pode ser desfeita. ${itemToDelete?.type === 'deck' ? 'O deck inteiro será apagado.' : 'A nota será apagada para sempre.'}`}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />

      <FlashcardModal
        isOpen={showFlashcardModal}
        onClose={closeFlashcardModal}
        onSave={handleSaveDeck}
        editingDeck={deckToEdit}
      />

      <RankingModal
        isOpen={showRanking}
        onClose={() => setShowRanking(false)}
        rankingData={realRankingData}
        currentUser={user}
        currentUsername={username}
        onUpdateName={setUsername}
      />

      <ReviewModal
        isOpen={isReviewing}
        deck={selectedDeck}
        onClose={closeReview}
      />

      <DeckOptionsModal
        isOpen={selectedDeck && !isReviewing}
        deck={selectedDeck}
        onClose={closeDeckOptions}
        onStartReview={handleStartReview}
        onEdit={handleEditDeck}
        onDelete={moveDeckToTrash}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;