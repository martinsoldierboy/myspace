import { useState } from 'react';
import type { GameState } from './logic/gameEngine';
import {
  createInitialState,
  dealRound,
  playerHit,
  playerStand,
  playerDoubleDown,
  playerSplit,
  buyInsurance,
  setDeckCount,
  reshuffleShoe,
  reloadBankroll,
} from './logic/gameEngine';
import { HeaderSettings } from './components/HeaderSettings';
import { GameTable } from './components/GameTable';
import { BettingControls } from './components/BettingControls';
import { ActionPanel } from './components/ActionPanel';
import { GameResultModal } from './components/GameResultModal';

export function App() {
  const [state, setState] = useState<GameState>(() => createInitialState(6));

  const handleSetDeckCount = (count: number) => {
    setState(prev => setDeckCount(prev, count));
  };

  const handleReshuffle = () => {
    setState(prev => reshuffleShoe(prev));
  };

  const handleResetBalance = () => {
    setState(prev => reloadBankroll(prev));
  };

  const handleAddChip = (val: number) => {
    setState(prev => ({
      ...prev,
      currentBet: Math.min(prev.bankroll, prev.currentBet + val),
    }));
  };

  const handleClearBet = () => {
    setState(prev => ({
      ...prev,
      currentBet: 0,
    }));
  };

  const handleDoubleBetAmount = () => {
    setState(prev => ({
      ...prev,
      currentBet: Math.min(prev.bankroll, prev.currentBet * 2),
    }));
  };

  const handleDeal = () => {
    setState(prev => dealRound(prev));
  };

  const handleHit = () => {
    setState(prev => playerHit(prev));
  };

  const handleStand = () => {
    setState(prev => playerStand(prev));
  };

  const handleDouble = () => {
    setState(prev => playerDoubleDown(prev));
  };

  const handleSplit = () => {
    setState(prev => playerSplit(prev));
  };

  const handleInsurance = (accept: boolean) => {
    setState(prev => buyInsurance(prev, accept));
  };

  const handleNextRound = () => {
    setState(prev => {
      const isCurrentBetAffordable = prev.currentBet <= prev.bankroll && prev.currentBet > 0;
      const defaultNextBet = isCurrentBetAffordable ? prev.currentBet : Math.min(50, prev.bankroll);
      return {
        ...prev,
        stage: 'BETTING',
        dealerHand: [],
        playerHands: [],
        activeHandIndex: 0,
        currentBet: defaultNextBet,
        message: 'Zvolte novou sázku a klikněte na "Rozdat karty".',
      };
    });
  };

  const handleReloadBankroll = () => {
    setState(prev => {
      const reloaded = reloadBankroll(prev);
      return {
        ...reloaded,
        stage: 'BETTING',
        currentBet: 50,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <HeaderSettings
        state={state}
        onSetDeckCount={handleSetDeckCount}
        onReshuffle={handleReshuffle}
        onResetBalance={handleResetBalance}
      />

      <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full mx-auto flex flex-col justify-between space-y-6">
        <GameTable state={state} />

        {state.stage === 'BETTING' && (
          <BettingControls
            state={state}
            onSetBet={val => setState(p => ({ ...p, currentBet: val }))}
            onAddChip={handleAddChip}
            onClearBet={handleClearBet}
            onDoubleBetAmount={handleDoubleBetAmount}
            onDeal={handleDeal}
          />
        )}

        {(state.stage === 'PLAYER_TURN' || state.stage === 'INSURANCE_OFFER') && (
          <ActionPanel
            state={state}
            onHit={handleHit}
            onStand={handleStand}
            onDouble={handleDouble}
            onSplit={handleSplit}
            onInsurance={handleInsurance}
          />
        )}

        <GameResultModal
          state={state}
          onNextRound={handleNextRound}
          onReloadBankroll={handleReloadBankroll}
        />
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Blackjack Casino CZ — Pravidla Blackjacku s volitelným počtem balíčků (1-8)
      </footer>
    </div>
  );
}

export default App;
