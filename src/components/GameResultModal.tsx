import React from 'react';
import { Trophy, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import type { GameState } from '../logic/gameEngine';

interface GameResultModalProps {
  state: GameState;
  onNextRound: () => void;
  onReloadBankroll: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  state,
  onNextRound,
  onReloadBankroll,
}) => {
  if (state.stage !== 'ROUND_OVER') return null;

  const isBankrupt = state.bankroll < 10 && state.currentBet > state.bankroll;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center text-white space-y-5 animate-in fade-in zoom-in duration-200">

        {isBankrupt ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-rose-400">Bankrot!</h2>
            <p className="text-sm text-slate-300">
              Došly vám všechny peníze. Chcete získat dalších 1 000 Kč a hrát dál?
            </p>
            <button
              onClick={onReloadBankroll}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Dobít kredit 1 000 Kč</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <Trophy className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-emerald-300">Výsledek kola</h2>

            {/* List hand outcomes */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.roundResults.map((res, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-200">{res.resultText}</span>
                  <span
                    className={`font-black text-sm ${
                      res.payout > 0 ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {res.payout > 0 ? `+${res.payout} Kč` : '0 Kč'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onNextRound}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-transform transform hover:scale-102 cursor-pointer"
              >
                <span>Nové kolo</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
