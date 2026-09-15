import React from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import type { GameState } from '../logic/gameEngine';

interface BettingControlsProps {
  state: GameState;
  onSetBet: (bet: number) => void;
  onAddChip: (value: number) => void;
  onClearBet: () => void;
  onDoubleBetAmount: () => void;
  onDeal: () => void;
}

const CHIP_VALUES = [
  { value: 10, color: 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 ring-blue-500/50' },
  { value: 25, color: 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500 ring-emerald-500/50' },
  { value: 50, color: 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500 ring-amber-500/50' },
  { value: 100, color: 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500 ring-purple-500/50' },
  { value: 500, color: 'bg-rose-700 border-rose-400 text-white hover:bg-rose-600 ring-rose-500/50' },
  { value: 1000, color: 'bg-yellow-500 border-yellow-200 text-slate-950 font-black hover:bg-yellow-400 ring-yellow-400/50' },
];

export const BettingControls: React.FC<BettingControlsProps> = ({
  state,
  onAddChip,
  onClearBet,
  onDoubleBetAmount,
  onDeal,
}) => {
  const isBetting = state.stage === 'BETTING';
  const canAffordDeal = state.currentBet > 0 && state.currentBet <= state.bankroll;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl max-w-4xl mx-auto backdrop-blur">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Chips selector */}
        <div className="flex flex-col items-center md:items-start space-y-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Vyberte žetony (Přidat k sázce)
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            {CHIP_VALUES.map(chip => {
              const disabled = !isBetting || state.currentBet + chip.value > state.bankroll;
              return (
                <button
                  key={chip.value}
                  onClick={() => onAddChip(chip.value)}
                  disabled={disabled}
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 font-bold text-xs md:text-sm flex items-center justify-center shadow-md transition-all transform hover:scale-110 active:scale-95 border-dashed cursor-pointer ${chip.color} ${
                    disabled ? 'opacity-30 cursor-not-allowed transform-none hover:scale-100' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
                  <span>{chip.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Bet Display & Quick Modifiers */}
        <div className="flex flex-col items-center justify-center bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-[200px] w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">Aktuální sázka</span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 my-1">
            {state.currentBet.toLocaleString('cs-CZ')} Kč
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <button
              onClick={onClearBet}
              disabled={!isBetting || state.currentBet === 0}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs font-semibold flex items-center space-x-1 border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
              title="Vynulovat sázku"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span>Smazat</span>
            </button>

            <button
              onClick={onDoubleBetAmount}
              disabled={!isBetting || state.currentBet * 2 > state.bankroll || state.currentBet === 0}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 rounded text-xs font-semibold flex items-center space-x-1 border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
              title="Zdvojnásobit výši sázky"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>x2 Sázka</span>
            </button>
          </div>
        </div>

        {/* Deal Button */}
        <div className="w-full md:w-auto flex justify-center">
          <button
            onClick={onDeal}
            disabled={!isBetting || !canAffordDeal}
            className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-extrabold text-base md:text-lg flex items-center justify-center space-x-2 shadow-xl transition-all transform ${
              isBetting && canAffordDeal
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-emerald-900/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Rozdat karty</span>
          </button>
        </div>

      </div>
    </div>
  );
};
