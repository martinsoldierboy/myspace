import { describe, it, expect } from 'vitest';
import { createSingleDeck, createShoe, calculateHandScore } from './deck';
import type { Card } from '../types';

describe('Deck Logic', () => {
  it('creates a single deck of 52 cards', () => {
    const deck = createSingleDeck();
    expect(deck.length).toBe(52);
  });

  it('creates a shoe with the requested number of decks', () => {
    const shoe1 = createShoe(1);
    expect(shoe1.length).toBe(52);

    const shoe6 = createShoe(6);
    expect(shoe6.length).toBe(312);
  });

  it('calculates hand score correctly with hard hands', () => {
    const cards: Card[] = [
      { id: '1', suit: 'hearts', rank: '10', value: [10] },
      { id: '2', suit: 'spades', rank: '7', value: [7] },
    ];
    const score = calculateHandScore(cards);
    expect(score.total).toBe(17);
    expect(score.isSoft).toBe(false);
    expect(score.isBust).toBe(false);
    expect(score.isBlackjack).toBe(false);
  });

  it('calculates soft hand score correctly with Ace', () => {
    const cards: Card[] = [
      { id: '1', suit: 'hearts', rank: 'A', value: [1, 11] },
      { id: '2', suit: 'spades', rank: '6', value: [6] },
    ];
    const score = calculateHandScore(cards);
    expect(score.total).toBe(17);
    expect(score.isSoft).toBe(true);
    expect(score.isBust).toBe(false);
  });

  it('adjusts Ace value from 11 to 1 when busting', () => {
    const cards: Card[] = [
      { id: '1', suit: 'hearts', rank: 'A', value: [1, 11] },
      { id: '2', suit: 'spades', rank: '8', value: [8] },
      { id: '3', suit: 'clubs', rank: '9', value: [9] },
    ];
    const score = calculateHandScore(cards);
    expect(score.total).toBe(18); // 11 + 8 + 9 = 28 -> Ace becomes 1 -> 18
    expect(score.isSoft).toBe(false);
    expect(score.isBust).toBe(false);
  });

  it('detects Blackjack', () => {
    const cards: Card[] = [
      { id: '1', suit: 'hearts', rank: 'A', value: [1, 11] },
      { id: '2', suit: 'spades', rank: 'K', value: [10] },
    ];
    const score = calculateHandScore(cards);
    expect(score.total).toBe(21);
    expect(score.isBlackjack).toBe(true);
  });

  it('ignores hidden cards in hand calculation', () => {
    const cards: Card[] = [
      { id: '1', suit: 'hearts', rank: 'A', value: [1, 11] },
      { id: '2', suit: 'spades', rank: 'K', value: [10], hidden: true },
    ];
    const score = calculateHandScore(cards);
    expect(score.total).toBe(11);
    expect(score.isBlackjack).toBe(false);
  });
});
