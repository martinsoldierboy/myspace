import React from 'react';
import type { Card as CardType } from '../types';

interface CardViewProps {
  card: CardType;
  index?: number;
}

export const CardView: React.FC<CardViewProps> = ({ card, index = 0 }) => {
  if (card.hidden) {
    return (
      <div
        className="relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border-2 border-slate-400/50 shadow-xl flex items-center justify-center transform transition-transform duration-300 hover:-translate-y-2 select-none"
        style={{
          marginLeft: index > 0 ? '-1.5rem' : '0',
          zIndex: index + 1,
        }}
      >
        <div className="w-[85%] h-[85%] rounded-lg border-2 border-dashed border-blue-400/30 bg-blue-950/40 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-blue-400/40 bg-blue-900/50 flex items-center justify-center text-blue-300 font-extrabold text-xs">
            BJ
          </div>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const suitSymbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const symbol = suitSymbols[card.suit];

  return (
    <div
      className={`relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-xl bg-slate-50 border border-slate-300 shadow-2xl flex flex-col justify-between p-1.5 sm:p-2.5 transform transition-transform duration-300 hover:-translate-y-2 select-none ${
        isRed ? 'text-rose-600' : 'text-slate-900'
      }`}
      style={{
        marginLeft: index > 0 ? '-1.5rem' : '0',
        zIndex: index + 1,
      }}
    >
      {/* Top Left rank & suit */}
      <div className="flex flex-col items-center leading-none">
        <span className="font-black text-sm sm:text-lg md:text-xl tracking-tighter">
          {card.rank}
        </span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>

      {/* Center suit emblem */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl opacity-80 pointer-events-none">
        {symbol}
      </div>

      {/* Bottom Right rank & suit */}
      <div className="flex flex-col items-center leading-none rotate-180 self-end">
        <span className="font-black text-sm sm:text-lg md:text-xl tracking-tighter">
          {card.rank}
        </span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>
    </div>
  );
};
