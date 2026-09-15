import React from 'react';
import { Hand, ShieldAlert, Zap, Columns, ShieldCheck, ShieldX } from 'lucide-react';
import type { GameState } from '../logic/gameEngine';
import { canSplit } from '../logic/gameEngine';

interface ActionPanelProps {
  state: GameState;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onInsurance: (accept: boolean) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  state,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onInsurance,
}) => {
  if (state.stage === 'INSURANCE_OFFER') {
    return (
      <div className="bg-slate-900/90 border border-amber-500/50 rounded-2xl p-4 md:p-6 shadow-xl max-w-2xl mx-auto text-center space-y-4">
        <h3 className="text-lg font-bold text-amber-400">
          Dealer má Eso! Chcete se pojistit proti Blackjacku?
        </h3>
        <p className="text-xs text-slate-300">
          Pojištění stojí poloviční sázku ({(state.playerHands[0]?.bet / 2) || 0} Kč) a vyplácí 2:1, pokud má dealer Blackjack.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => onInsurance(true)}
            disabled={state.bankroll < state.playerHands[0]?.bet / 2}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ano, pojistit</span>
          </button>
          <button
            onClick={() => onInsurance(false)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm flex items-center space-x-2 border border-slate-700"
          >
            <ShieldX className="w-4 h-4" />
            <span>Ne, děkuji</span>
          </button>
        </div>
      </div>
    );
  }

  if (state.stage !== 'PLAYER_TURN') {
    return null;
  }

  const activeHand = state.playerHands[state.activeHandIndex];
  const canDouble =
    activeHand &&
    activeHand.cards.length === 2 &&
    !activeHand.isFinished &&
    state.bankroll >= activeHand.bet;

  const userCanSplit = canSplit(state);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-2xl max-w-3xl mx-auto backdrop-blur">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Hit / Táhnout */}
        <button
          onClick={onHit}
          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/50 flex flex-col items-center justify-center space-y-1 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ShieldAlert className="w-6 h-6 rotate-180" />
          <span className="text-sm">Táhnout (Hit)</span>
        </button>

        {/* Stand / Stát */}
        <button
          onClick={onStand}
          className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg shadow-rose-950/50 flex flex-col items-center justify-center space-y-1 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Hand className="w-6 h-6" />
          <span className="text-sm">Stát (Stand)</span>
        </button>

        {/* Double / Zdvojnásobit */}
        <button
          onClick={onDouble}
          disabled={!canDouble}
          className={`py-3 px-4 rounded-xl font-extrabold flex flex-col items-center justify-center space-y-1 transition-all transform ${
            canDouble
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50'
          }`}
        >
          <Zap className="w-6 h-6 text-amber-300" />
          <span className="text-sm">Zdvojnásobit</span>
        </button>

        {/* Split / Rozdělit */}
        <button
          onClick={onSplit}
          disabled={!userCanSplit}
          className={`py-3 px-4 rounded-xl font-extrabold flex flex-col items-center justify-center space-y-1 transition-all transform ${
            userCanSplit
              ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/50 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50'
          }`}
        >
          <Columns className="w-6 h-6 text-teal-300" />
          <span className="text-sm">Rozdělit (Split)</span>
        </button>
      </div>
    </div>
  );
};
