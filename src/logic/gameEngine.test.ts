import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  dealRound,
  playerHit,
  playerStand,
  playerDoubleDown,
  setDeckCount,
  reloadBankroll,
} from './gameEngine';

describe('Game Engine State & Rules', () => {
  it('initializes game state with correct default bankroll and 6 decks', () => {
    const state = createInitialState(6);
    expect(state.bankroll).toBe(1000);
    expect(state.deckCount).toBe(6);
    expect(state.shoe.length).toBe(312);
    expect(state.stage).toBe('BETTING');
  });

  it('allows changing deck count', () => {
    const state = createInitialState(6);
    const updated = setDeckCount(state, 2);
    expect(updated.deckCount).toBe(2);
    expect(updated.shoe.length).toBe(104);
  });

  it('deducts bet from bankroll when dealing round', () => {
    const state = createInitialState(6);
    state.currentBet = 100;
    const dealt = dealRound(state);

    expect(dealt.bankroll).toBe(900);
    expect(dealt.playerHands.length).toBe(1);
    expect(dealt.playerHands[0].cards.length).toBe(2);
    expect(dealt.dealerHand.length).toBe(2);
  });

  it('handles player Hit action', () => {
    const state = createInitialState(6);
    state.currentBet = 50;
    let dealt = dealRound(state);

    if (dealt.stage === 'PLAYER_TURN') {
      const hitState = playerHit(dealt);
      expect(hitState.playerHands[0].cards.length).toBe(3);
    }
  });

  it('handles player Stand action', () => {
    const state = createInitialState(6);
    state.currentBet = 50;
    let dealt = dealRound(state);

    if (dealt.stage === 'PLAYER_TURN') {
      const standState = playerStand(dealt);
      expect(standState.stage).toBe('ROUND_OVER');
      expect(standState.dealerHand.every(c => !c.hidden)).toBe(true);
    }
  });

  it('handles Double Down action correctly', () => {
    const state = createInitialState(6);
    state.currentBet = 100;
    let dealt = dealRound(state);

    if (dealt.stage === 'PLAYER_TURN') {
      const doubledState = playerDoubleDown(dealt);
      expect(doubledState.playerHands[0].bet).toBe(200);
      expect(doubledState.playerHands[0].cards.length).toBe(3);
      expect(doubledState.stage).toBe('ROUND_OVER');
    }
  });

  it('allows bankroll reload when bankrupt', () => {
    const state = createInitialState(6);
    state.bankroll = 0;
    const reloaded = reloadBankroll(state);
    expect(reloaded.bankroll).toBe(1000);
  });
});
