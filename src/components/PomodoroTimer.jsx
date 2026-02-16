import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Coffee, Monitor, Play, Pause, Trophy, Globe } from 'lucide-react';

const defaultDurations = { focus: 25, short: 5, long: 15 };

const PomodoroTimer = ({ onFinishSession }) => {
  const durations = defaultDurations;

  // Estados do Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durations.focus * 60);
  const [endTime, setEndTime] = useState(null); // <--- NOVO: Guarda a hora exata que vai acabar
  
  // Estados de Controle
  const [pomodoroMode, setPomodoroMode] = useState('focus'); 
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Estado da API (Novo)
  const [userLocation, setUserLocation] = useState({ timezone: 'Carregando...', abbreviation: '' });

  // 1. Efeito para consumir a API de GMT/Localização ao iniciar
  useEffect(() => {
    fetch('http://worldtimeapi.org/api/ip')
      .then(response => response.json())
      .then(data => {
        // A API retorna dados como "America/Sao_Paulo" e "UTC_offset"
        setUserLocation({
          timezone: data.timezone,
          abbreviation: data.abbreviation || data.utc_offset // Ex: -03
        });
      })
      .catch(err => {
        console.error("Erro ao buscar API de hora:", err);
        setUserLocation({ timezone: 'Modo Offline', abbreviation: '' });
      });
  }, []);

  const switchPomodoroMode = useCallback((mode) => {
    setTimerActive(false);
    setEndTime(null); // Reseta o tempo alvo
    setPomodoroMode(mode);
    if (mode === 'focus') setTimeLeft(durations.focus * 60);
    else if (mode === 'short') setTimeLeft(durations.short * 60);
    else if (mode === 'long') setTimeLeft(durations.long * 60);
  }, [durations]);

  // Função para Iniciar/Pausar com lógica de Timestamp (Mais precisa)
  const toggleTimer = () => {
    if (timerActive) {
      // PAUSAR: Apenas paramos o estado, o timeLeft atual fica salvo visualmente
      setTimerActive(false);
      setEndTime(null);
    } else {
      // INICIAR: Calculamos o momento exato do fim baseado no tempo que resta
      // Agora (GMT do PC) + Quanto falta (segundos * 1000)
      const targetTime = Date.now() + (timeLeft * 1000);
      setEndTime(targetTime);
      setTimerActive(true);
    }
  };

  // 2. O "Tique-Taque" agora apenas sincroniza, não subtrai cegamente
  useEffect(() => {
    if (!timerActive || !endTime) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const difference = endTime - now; // Calcula a diferença real
      
      // Converte milissegundos para segundos
      const secondsLeft = Math.ceil(difference / 1000);

      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        setTimerActive(false);
        setEndTime(null);
        setTimeLeft(0);
        setShowCelebration(true);

        setPomodorosCompleted(completed => {
          const isFocusFinishing = pomodoroMode === 'focus';
          const newCompleted = isFocusFinishing ? completed + 1 : completed;
          
          if (isFocusFinishing) {
            if (onFinishSession) onFinishSession();
            switchPomodoroMode(newCompleted % 4 === 0 ? 'long' : 'short');
          } else {
            switchPomodoroMode('focus');
          }
          return newCompleted;
        });
      } else {
        setTimeLeft(secondsLeft);
      }
    }, 200); // Roda mais rápido para garantir fluidez, mas a conta é baseada em Data

    return () => clearInterval(intervalId);
  }, [timerActive, endTime, pomodoroMode, onFinishSession, switchPomodoroMode]);

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
      <div className={`p-5 rounded-2xl shadow-sm border transition-all ${getPomodoroBg()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {pomodoroMode === 'focus' ? <Brain size={16} className={getPomodoroColor()} /> : <Coffee size={16} className={getPomodoroColor()} />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${getPomodoroColor()}`}>
              {pomodoroMode === 'focus' ? 'Pomodoro' : pomodoroMode === 'short' ? 'Pausa Curta' : 'Pausa Longa'}
            </span>
          </div>
          
          {/* Exibindo a Localização da API */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            <Globe size={10} />
            <span className="truncate max-w-[80px]">{userLocation.timezone}</span>
            <span>({userLocation.abbreviation})</span>
          </div>
        </div>

        <div className={`text-4xl font-mono font-bold mb-6 text-center tracking-tighter ${getPomodoroColor()}`}>
          {formatTime(timeLeft)}
        </div>

        <button 
          onClick={toggleTimer} // Usando a nova função toggleTimer
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-3 shadow-lg 
            ${timerActive 
              ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
              : pomodoroMode === 'focus' 
                ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' 
                : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700'
            }`}
        >
          {timerActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {timerActive ? 'Pausar' : 'Iniciar'}
        </button>

        {/* Botões de Atalho */}
        <div className="flex justify-between bg-white/50 p-1 rounded-lg border border-slate-100">
           {/* ... (mantido igual ao anterior) */}
           <button onClick={() => switchPomodoroMode('focus')} className={`p-2 rounded-md transition-all ${pomodoroMode === 'focus' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Foco (25m)"><Brain size={14} /></button>
           <button onClick={() => switchPomodoroMode('short')} className={`p-2 rounded-md transition-all ${pomodoroMode === 'short' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="Pausa Curta (5m)"><Coffee size={14} /></button>
           <button onClick={() => switchPomodoroMode('long')} className={`p-2 rounded-md transition-all ${pomodoroMode === 'long' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Pausa Longa (15m)"><Monitor size={14} /></button>
        </div>
      </div>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95">
             {/* ... Conteúdo do Modal Mantido Igual ... */}
             <div className="mb-4 flex justify-center">
              <div className={`p-4 rounded-full ${pomodoroMode === 'focus' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {pomodoroMode === 'focus' ? <Coffee size={48} className="text-emerald-600" /> : <Trophy size={48} className="text-amber-600" />}
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              {pomodoroMode === 'focus' ? 'Pausa Finalizada!' : 'Sessão Concluída!'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {pomodoroMode === 'focus' 
                ? 'Espero que tenha descansado. Hora de focar novamente?'
                : 'Seu cérebro agradece pelo foco total. +50 XP ganhos!'}
            </p>

            <button 
              onClick={() => { setShowCelebration(false); toggleTimer(); }} // Ajustado para usar toggleTimer
              className={`w-full py-4 rounded-2xl font-bold mt-2 shadow-lg transition-all 
                ${pomodoroMode === 'focus' 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}
            >
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