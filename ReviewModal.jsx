import React, { useState, useEffect } from 'react';
import { XCircle, FlipHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const ReviewModal = ({ isOpen, deck, onClose }) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isReviewFlipped, setIsReviewFlipped] = useState(false);

  // Reset state when modal opens for a new deck
  useEffect(() => {
    if (isOpen) {
      setCurrentReviewIndex(0);
      setIsReviewFlipped(false);
    }
  }, [isOpen]);

  if (!isOpen || !deck || !deck.cards || deck.cards.length === 0) {
    return null;
  }

  const cards = deck.cards;

  const reviewNext = () => {
    setIsReviewFlipped(false);
    setCurrentReviewIndex(prev => (prev + 1) % cards.length);
  };

  const reviewPrev = () => {
    setIsReviewFlipped(false);
    setCurrentReviewIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentReviewIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <XCircle size={24} className="text-slate-400" />
          </button>
          <div>
            <h2 className="font-bold text-lg">{deck.title}</h2>
            <div className="text-xs text-slate-400">Card {currentReviewIndex + 1} de {cards.length}</div>
          </div>
        </div>
        <div className="flex gap-1">{cards.map((_, idx) => (<div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentReviewIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'}`} />))}</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div onClick={() => setIsReviewFlipped(!isReviewFlipped)} className="w-full max-w-2xl aspect-[3/2] bg-white rounded-3xl shadow-2xl flex items-center justify-center p-12 text-center cursor-pointer relative group transition-all hover:scale-[1.01]">
          <div className="text-3xl md:text-4xl font-bold text-slate-800 leading-snug select-none">{isReviewFlipped ? currentCard.back : currentCard.front}</div>
          <div className="absolute bottom-6 text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-indigo-400 transition-colors">{isReviewFlipped ? 'Verso (Resposta)' : 'Frente (Pergunta)'}</div>
          <div className="absolute top-6 right-6 text-slate-200"><FlipHorizontal size={24} /></div>
        </div>
      </div>
      <div className="h-24 bg-slate-800 flex items-center justify-center gap-8">
        <button onClick={reviewPrev} className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors text-white"><ChevronLeft size={24} /></button>
        <div className="text-sm font-medium text-slate-400">Clique no card para virar</div>
        <button onClick={reviewNext} className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-lg shadow-indigo-900/50"><ChevronRight size={24} /></button>
      </div>
    </div>
  );
};

export default ReviewModal;