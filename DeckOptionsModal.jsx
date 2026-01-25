import React from 'react';
import { Play, Edit3, Trash2 } from 'lucide-react';

const DeckOptionsModal = ({ isOpen, deck, onClose, onStartReview, onEdit, onDelete }) => {
  if (!isOpen || !deck) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full relative animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">{deck.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{(deck.cards || []).length} cards no deck</p>
        </div>
        <div className="space-y-3">
          <button 
            onClick={onStartReview} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
          >
            <Play size={16} fill="currentColor" /> Revisar Agora
          </button>
          <button 
            onClick={onEdit} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Edit3 size={16} /> Editar Deck
          </button>
          <button 
            onClick={() => onDelete(deck.id)} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors mt-2"
          >
            <Trash2 size={16} /> Mover para Lixeira
          </button>
          <button onClick={onClose} className="w-full py-2 rounded-xl font-medium text-slate-400 text-xs hover:text-slate-600 mt-2">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default DeckOptionsModal;