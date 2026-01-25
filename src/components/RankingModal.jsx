import React, { useState, useEffect } from 'react';
import { Trophy, XCircle, Edit3, CheckCircle2 } from 'lucide-react';

const RankingModal = ({ isOpen, onClose, rankingData, currentUser, currentUsername, onUpdateName }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedName(currentUsername || '');
      setIsEditingName(false);
    }
  }, [isOpen, currentUsername]);

  if (!isOpen) return null;

  const handleNameUpdate = () => {
    if (editedName.trim() && editedName.trim() !== currentUsername) {
      onUpdateName(editedName.trim());
    }
    setIsEditingName(false);
  };

  const renderRankItem = (rankingUser, idx) => {
    const isMe = currentUser && rankingUser.id === currentUser.uid;
    const rankColor = idx < 3 ? 'text-amber-500' : 'text-slate-400';
    const avatarBg = isMe ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600';
    const itemBg = isMe ? 'bg-white border-indigo-200 shadow-md transform scale-105 z-10' : 'bg-white border-slate-100';

    return (
      <div key={rankingUser.id} className={`flex items-center justify-between p-3 rounded-xl border ${itemBg}`}>
        <div className="flex items-center gap-3">
          <div className={`font-bold w-4 text-center ${rankColor}`}>{idx + 1}</div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarBg}`}>
            {rankingUser.name ? rankingUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex items-center gap-2">
            {isMe && isEditingName ? (
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={editedName} 
                  onChange={(e) => setEditedName(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                  autoFocus 
                  className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1 w-24 outline-none" 
                />
                <button onClick={handleNameUpdate} className="text-indigo-500 hover:text-indigo-700"><CheckCircle2 size={14} /></button>
              </div>
            ) : (
              <div className={`text-sm font-bold ${isMe ? 'text-indigo-700' : 'text-slate-700'}`}>
                {isMe ? currentUsername : (rankingUser.name || 'Estudante')} {isMe && '(Você)'}
              </div>
            )}
            {isMe && !isEditingName && (
              <button onClick={() => setIsEditingName(true)} className="text-indigo-300 hover:text-indigo-500"><Edit3 size={10} /></button>
            )}
          </div>
        </div>
        <div className="font-bold text-slate-600 text-sm">{rankingUser.xp} XP</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between shrink-0"><div className="flex items-center gap-2"><Trophy size={20} className="text-amber-300" /><h3 className="font-bold text-lg">Ranking Global</h3></div><button onClick={onClose} className="p-1.5 hover:bg-indigo-500 rounded-full text-indigo-100 transition-colors"><XCircle size={20} /></button></div>
        <div className="p-4 bg-slate-50 min-h-[300px] max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">{rankingData.length === 0 ? (<div className="text-center p-4 text-slate-400 text-sm">Carregando dados globais...</div>) : (rankingData.map(renderRankItem))}</div>
        </div>
        <div className="px-6 py-4 bg-white border-t border-slate-100 text-center"><p className="text-xs text-slate-400">Competindo com estudantes reais em tempo real!</p></div>
      </div>
    </div>
  );
};

export default RankingModal;