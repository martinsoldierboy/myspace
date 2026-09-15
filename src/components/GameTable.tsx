import React from 'react';
import type { GameState } from '../logic/gameEngine';
import { calculateHandScore } from '../logic/deck';
import { CardView } from './CardView';
import { Sparkles } from 'lucide-react';

interface GameTableProps {
  state: GameState;
}

export const GameTable: React.FC<GameTableProps> = ({ state }) => {
  const dealerScore = calculateHandScore(state.dealerHand);
  const isDealerHidden = state.dealerHand.some(c => c.hidden);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-emerald-950 border-8 border-emerald-900 shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 flex flex-col justify-between min-h-[460px] md:min-h-[520px]">

      {/* Felt texture background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/40 via-emerald-950 to-emerald-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-emerald-500/10 rounded-full w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-10">
        <span className="text-4xl sm:text-6xl font-black tracking-widest text-emerald-300 uppercase">
          Blackjack 3:2
        </span>
      </div>

      {/* Dealer Area */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-emerald-600/30 text-xs sm:text-sm font-semibold text-emerald-200 mb-3 shadow">
          <span>Dealer</span>
          {state.dealerHand.length > 0 && (
            <span className="bg-emerald-600/40 px-2 py-0.5 rounded text-emerald-300 text-xs font-bold">
              {isDealerHidden ? '?' : dealerScore.total}
              {!isDealerHidden && dealerScore.isSoft && ' (Soft)'}
              {!isDealerHidden && dealerScore.isBlackjack && ' - BLACKJACK!'}
            </span>
          )}
        </div>

        {/* Dealer Cards */}
        <div className="flex items-center justify-center min-h-[100px] sm:min-h-[120px]">
          {state.dealerHand.length === 0 ? (
            <div className="w-20 h-28 rounded-xl border-2 border-dashed border-emerald-600/30 flex items-center justify-center text-emerald-600/40 text-xs">
              Čeká se...
            </div>
          ) : (
            state.dealerHand.map((card, i) => (
              <CardView key={card.id || i} card={card} index={i} />
            ))
          )}
        </div>
      </div>

      {/* Message & Status Banner */}
      <div className="relative z-10 my-4 text-center">
        <div className="inline-block bg-slate-950/80 border border-emerald-500/30 px-5 py-2 rounded-full backdrop-blur shadow-lg">
          <p className="text-xs sm:text-sm font-semibold text-emerald-100 flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{state.message}</span>
          </p>
        </div>
      </div>

      {/* Player Area (Supports Split Hands) */}
      <div className="relative z-10 flex flex-wrap items-end justify-center gap-6 sm:gap-12">
        {state.playerHands.length === 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-28 rounded-xl border-2 border-dashed border-emerald-600/30 flex items-center justify-center text-emerald-600/40 text-xs mb-2">
              Váš stůl
            </div>
            <span className="text-xs text-emerald-400/60 font-semibold">Vložte sázku</span>
          </div>
        ) : (
          state.playerHands.map((hand, hIdx) => {
            const score = calculateHandScore(hand.cards);
            const isActive = state.stage === 'PLAYER_TURN' && state.activeHandIndex === hIdx;

            return (
              <div
                key={hand.id}
                className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-emerald-900/50 ring-2 ring-emerald-400 shadow-xl shadow-emerald-950 scale-105'
                    : 'bg-slate-900/40 border border-emerald-800/30'
                }`}
              >
                {/* Hand cards */}
                <div className="flex items-center justify-center min-h-[100px] sm:min-h-[120px] mb-3">
                  {hand.cards.map((card, cIdx) => (
                    <CardView key={card.id || cIdx} card={card} index={cIdx} />
                  ))}
                </div>

                {/* Hand Stats & Score */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-950/90 text-emerald-300 font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-500/40">
                      Součet: {score.total} {score.isSoft ? '(Soft)' : ''}
                    </span>

                    {score.isBlackjack && (
                      <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow">
                        BLACKJACK!
                      </span>
                    )}
                    {score.isBust && (
                      <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                        MIMO (21+)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-emerald-200/80 font-medium">
                    Sázka ruky: <span className="font-bold text-emerald-400">{hand.bet} Kč</span>
                    {hand.isDoubled && ' (Double)'}
                    {hand.isSplit && ' (Split)'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
