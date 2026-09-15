export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number[]; // e.g. [1, 11] for Ace, [10] for 10/J/Q/K
  hidden?: boolean;
}

export interface Hand {
  id: string;
  cards: Card[];
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  isFinished: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  isSurrendered?: boolean;
}

export type GameStateStage =
  | 'BETTING'
  | 'INSURANCE_OFFER'
  | 'PLAYER_TURN'
  | 'DEALER_TURN'
  | 'ROUND_OVER';

export interface HandScore {
  total: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  isTwentyOne: boolean;
}

export interface GameStats {
  handsPlayed: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  totalProfit: number;
}
