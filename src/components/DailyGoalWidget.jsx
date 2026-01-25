import React, { useState } from 'react';
import { Target, Settings2 } from 'lucide-react';

const DailyGoalWidget = ({ sessionSeconds }) => {
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(60);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Valores derivados movidos para cá
  const sessionMinutes = Math.floor(sessionSeconds / 60);
  const goalProgress = Math.min((sessionMinutes / dailyGoalMinutes) * 100, 100);

  return (
    <div className="p-5 bg-indigo-900 rounded-2xl text-white shadow-xl shadow-indigo-100 mb-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="text-amber-400" size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Meta Diária</span>
        </div>
        <button 
          onClick={() => setIsEditingGoal(!isEditingGoal)} 
          className="p-1 hover:bg-indigo-800 rounded text-indigo-300 hover:text-white transition-colors" 
          title="Configurar Meta"
        >
          <Settings2 size={12} />
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-medium h-6">
          <span>Foco Total</span>
          {isEditingGoal ? (
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={dailyGoalMinutes} 
                onChange={(e) => setDailyGoalMinutes(Math.max(1, parseInt(e.target.value) || 0))} 
                className="w-12 h-6 text-center text-indigo-900 font-bold rounded bg-white text-xs outline-none focus:ring-2 focus:ring-amber-400" 
                autoFocus 
              />
              <span className="text-indigo-300">min</span>
            </div>
          ) : (
            <span>{sessionMinutes}/{dailyGoalMinutes} min</span>
          )}
        </div>
        <div className="h-2 w-full bg-indigo-950 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ease-out rounded-full ${goalProgress >= 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} style={{ width: `${goalProgress}%` }}></div></div>
        {goalProgress >= 100 && <div className="text-[10px] text-emerald-300 text-center font-bold animate-pulse mt-1">Meta Atingida! 🔥</div>}
      </div>
    </div>
  );
};

export default DailyGoalWidget;