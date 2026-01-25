import React, { useState, useEffect } from 'react';
import { Zap, XCircle, PlusSquare, Trash2, Save } from 'lucide-react';

const FlashcardModal = ({ isOpen, onClose, onSave, editingDeck }) => {
  const [tempDeckTitle, setTempDeckTitle] = useState('');
  const [tempCards, setTempCards] = useState([]);
  const [currentCardInput, setCurrentCardInput] = useState({ front: '', back: '' });

  useEffect(() => {
    if (isOpen) {
      if (editingDeck) {
        setTempDeckTitle(editingDeck.title || '');
        setTempCards(editingDeck.cards || []);
      } else {
        setTempDeckTitle('');
        setTempCards([]);
      }
      setCurrentCardInput({ front: '', back: '' });
    }
  }, [isOpen, editingDeck]);

  if (!isOpen) return null;

  const handleAddCardToDeck = () => {
    if (!currentCardInput.front.trim() || !currentCardInput.back.trim()) return;
    setTempCards([...tempCards, { ...currentCardInput, id: Date.now() }]);
    setCurrentCardInput({ front: '', back: '' });
  };

  const removeCardFromTempDeck = (cardId) => {
    setTempCards(prev => prev.filter(c => c.id !== cardId));
  };

  const handleSave = () => {
    let finalCards = [...tempCards];
    if (currentCardInput.front.trim() && currentCardInput.back.trim()) {
      finalCards.push({ ...currentCardInput, id: Date.now() });
    }
    if (finalCards.length === 0) return;

    onSave({
      editingDeckId: editingDeck ? editingDeck.id : null,
      title: tempDeckTitle,
      cards: finalCards,
    });
  };

  const isSaveDisabled = tempCards.length === 0 && (!currentCardInput.front.trim() || !currentCardInput.back.trim());
  const totalCardsCount = tempCards.length + (currentCardInput.front.trim() && currentCardInput.back.trim() ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-md"><Zap size={18} className="text-indigo-600" /></div>
            <div><h3 className="font-bold text-slate-700">{editingDeck ? 'Editar Deck' : 'Novo Deck'}</h3><p className="text-[10px] text-slate-400">{editingDeck ? 'Gerencie os cards existentes' : 'Adicione múltiplos cards ao tema'}</p></div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><XCircle size={20} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tema do Deck</label>
            <input type="text" value={tempDeckTitle} onChange={(e) => setTempDeckTitle(e.target.value)} placeholder="Ex: Neuroplasticidade" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-indigo-400 transition-all" />
          </div>
          {tempCards.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-indigo-400">Cards no Deck ({tempCards.length})</label>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {tempCards.map((card, idx) => (
                  <div key={card.id} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-xs group">
                    <div className="truncate flex-1 font-medium text-slate-600"><span className="font-bold text-indigo-600 mr-2">#{idx + 1}</span>{card.front}</div>
                    <button onClick={() => removeCardFromTempDeck(card.id)} className="p-1 hover:bg-red-100 text-slate-300 hover:text-red-500 rounded-md transition-colors"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="h-px bg-slate-100 w-full my-2"></div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2"><PlusSquare size={14} /> Adicionar Card</h4>
            <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-400">Frente (Pergunta)</label><input type="text" value={currentCardInput.front} onChange={(e) => setCurrentCardInput({...currentCardInput, front: e.target.value})} placeholder="Ex: O que é sinapse?" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-all" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-400">Verso (Resposta)</label><textarea value={currentCardInput.back} onChange={(e) => setCurrentCardInput({...currentCardInput, back: e.target.value})} placeholder="Resposta..." className="w-full h-20 p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-all resize-none" /></div>
            <button onClick={handleAddCardToDeck} disabled={!currentCardInput.front.trim() || !currentCardInput.back.trim()} className="w-full py-2 rounded-lg bg-white border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+ Adicionar à Fila</button>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between gap-3 border-t border-slate-100 shrink-0">
          <div className="text-xs text-slate-400 font-medium">{totalCardsCount} cards totais</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={isSaveDisabled} className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"><Save size={16} />{editingDeck ? 'Atualizar Deck' : 'Salvar Deck'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardModal;