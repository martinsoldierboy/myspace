import type { Card, HandScore, Rank, Suit } from '../types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createSingleDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value: number[];
      if (rank === 'A') {
        value = [1, 11];
      } else if (['J', 'Q', 'K', '10'].includes(rank)) {
        value = [10];
      } else {
        value = [parseInt(rank, 10)];
      }

      deck.push({
        id: `${suit}-${rank}-${Math.random().toString(36).substr(2, 9)}`,
        suit,
        rank,
        value,
      });
    }
  }
  return deck;
}

export function createShoe(deckCount: number): Card[] {
  let shoe: Card[] = [];
  for (let i = 0; i < deckCount; i++) {
    shoe = shoe.concat(createSingleDeck());
  }
  return shuffleShoe(shoe);
}

export function shuffleShoe(shoe: Card[]): Card[] {
  const shuffled = [...shoe];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateHandScore(cards: Card[]): HandScore {
  const visibleCards = cards.filter(c => !c.hidden);
  let total = 0;
  let aceCount = 0;

  for (const card of visibleCards) {
    if (card.rank === 'A') {
      aceCount += 1;
      total += 11;
    } else {
      total += card.value[0];
    }
  }

  let isSoft = aceCount > 0;

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }

  if (aceCount === 0) {
    isSoft = false;
  }

  const isBust = total > 21;
  const isBlackjack = visibleCards.length === 2 && total === 21 && cards.length === 2;
  const isTwentyOne = total === 21;

  return {
    total,
    isSoft,
    isBust,
    isBlackjack,
    isTwentyOne,
  };
}
