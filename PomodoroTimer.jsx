import React, { useState, useEffect } from 'react';
import { Brain, Coffee, Monitor, Play, Pause, Trophy } from 'lucide-react';

const PomodoroTimer = ({ onFinishSession }) => {
  // --- Estados Internos (Movidos do App.jsx) ---
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // focus, short, long
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // --- Lógica do Relógio (Movida e Melhorada) ---
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      clearInterval(interval);
      setTimerActive(false);
      
      // A celebração agora é mostrada tanto no fim do foco quanto da pausa
      setShowCelebration(true); 

      if (pomodoroMode === 'focus') {
        const newCompleted = pomodorosCompleted + 1;
        setPomodorosCompleted(newCompleted);
        if(onFinishSession) onFinishSession(); // Notifica o App para dar XP

        // Define a próxima pausa
        if (newCompleted % 4 === 0) {
          switchPomodoroMode('long');
        } else {
          switchPomodoroMode('short');
        }
      } else { // Pausa terminou, volta ao foco
        switchPomodoroMode('focus');
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, pomodoroMode, pomodorosCompleted, onFinishSession]);

  // --- Funções Auxiliares (Movidas do App.jsx) ---
  const switchPomodoroMode = (mode) => {
    setTimerActive(false);
    setPomodoroMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
    else if (mode === 'long') setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPomodoroColor = () => {
    if (pomodoroMode === 'focus') return 'text-slate-800';
    if (pomodoroMode === 'short') return 'text-emerald-600';
    if (pomodoroMode === 'long') return 'text-indigo-600';
    return 'text-slate-800';
  };

  const getPomodoroBg = () => {
    if (pomodoroMode === 'focus') return 'bg-white border-slate-200';
    if (pomodoroMode === 'short') return 'bg-emerald-50 border-emerald-100';
    if (pomodoroMode === 'long') return 'bg-indigo-50 border-indigo-100';
    return 'bg-white';
  };

  return (
    <>
      {/* WIDGET POMODORO (JSX Movido do App.jsx) */}
      <div className={`p-5 rounded-2xl shadow-sm border transition-all ${getPomodoroBg()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {pomodoroMode === 'focus' ? <Brain size={16} className={getPomodoroColor()} /> : <Coffee size={16} className={getPomodoroColor()} />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${getPomodoroColor()}`}>
              {pomodoroMode === 'focus' ? 'Deep Work' : pomodoroMode === 'short' ? 'Pausa Curta' : 'Pausa Longa'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < (pomodorosCompleted % 4) ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
        <div className={`text-4xl font-mono font-bold mb-6 text-center tracking-tighter ${getPomodoroColor()}`}>{formatTime(timeLeft)}</div>
        <button onClick={() => setTimerActive(!timerActive)} className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-3 shadow-lg ${timerActive ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : pomodoroMode === 'focus' ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700'}`}>
          {timerActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {timerActive ? 'Pausar' : 'Iniciar'}
        </button>
        <div className="flex justify-between bg-white/50 p-1 rounded-lg border border-slate-100">
          <button onClick={() => switchPomodoroMode('focus')} className={`p-2 rounded-md transition-all ${pomodoroMode === 'focus' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Foco (25m)"><Brain size={14} /></button>
          <button onClick={() => switchPomodoroMode('short')} className={`p-2 rounded-md transition-all ${pomodoroMode === 'short' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="Pausa Curta (5m)"><Coffee size={14} /></button>
          <button onClick={() => switchPomodoroMode('long')} className={`p-2 rounded-md transition-all ${pomodoroMode === 'long' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Pausa Longa (15m)"><Monitor size={14} /></button>
        </div>
      </div>

      {/* Modal de Celebração (Movido e Corrigido) */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95">
            <div className="mb-4 flex justify-center">
              {/* O ícone depende do modo que está começando, não o que terminou */}
              <div className={`p-4 rounded-full ${pomodoroMode === 'focus' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {pomodoroMode === 'focus' ? <Coffee size={48} className="text-emerald-600" /> : <Trophy size={48} className="text-amber-600" />}
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              {/* O texto é invertido porque `pomodoroMode` já foi atualizado para o *próximo* ciclo */}
              {pomodoroMode === 'focus' ? 'Pausa Finalizada!' : 'Sessão Concluída!'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {pomodoroMode === 'focus' 
                ? 'Espero que tenha descansado. Hora de focar novamente?'
                : 'Seu cérebro agradece pela foco total. +50 XP ganhos!'}
            </p>
            <button onClick={() => { setShowCelebration(false); setTimerActive(true); }} className={`w-full py-4 rounded-2xl font-bold mt-2 shadow-lg transition-all ${pomodoroMode === 'focus' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}>
              {pomodoroMode === 'focus' ? 'Voltar ao Foco' : 'Iniciar Pausa'}
            </button>
            <button onClick={() => setShowCelebration(false)} className="w-full py-3 text-slate-400 text-xs font-bold hover:text-slate-600 mt-2">Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PomodoroTimer;