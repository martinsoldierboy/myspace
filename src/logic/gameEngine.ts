import type { Card, GameStateStage, GameStats, Hand } from '../types';
import { calculateHandScore, createShoe } from './deck';

export interface GameState {
  deckCount: number;
  shoe: Card[];
  discardPile: Card[];
  bankroll: number;
  currentBet: number;
  stage: GameStateStage;
  dealerHand: Card[];
  playerHands: Hand[];
  activeHandIndex: number;
  insuranceBet: number;
  insuranceOffered: boolean;
  message: string;
  roundResults: {
    handId: string;
    resultText: string;
    payout: number;
  }[];
  stats: GameStats;
}

export const INITIAL_BANKROLL = 1000;
export const MIN_BET = 10;
export const MAX_BET = 10000;

export function createInitialState(deckCount = 6): GameState {
  return {
    deckCount,
    shoe: createShoe(deckCount),
    discardPile: [],
    bankroll: INITIAL_BANKROLL,
    currentBet: 50,
    stage: 'BETTING',
    dealerHand: [],
    playerHands: [],
    activeHandIndex: 0,
    insuranceBet: 0,
    insuranceOffered: false,
    message: 'Vložte sázku a klikněte na "Rozdat karty".',
    roundResults: [],
    stats: {
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      totalProfit: 0,
    },
  };
}

export function drawCard(state: GameState): { card: Card; state: GameState } {
  let shoe = [...state.shoe];
  let discardPile = [...state.discardPile];

  // Reshuffle if shoe has less than 20% of cards left
  const totalCardsInDecks = state.deckCount * 52;
  if (shoe.length < Math.max(15, Math.floor(totalCardsInDecks * 0.2))) {
    shoe = createShoe(state.deckCount);
    discardPile = [];
  }

  const card = shoe.pop()!;
  return {
    card,
    state: {
      ...state,
      shoe,
      discardPile,
    },
  };
}

export function dealRound(state: GameState): GameState {
  if (state.stage !== 'BETTING') return state;
  if (state.currentBet > state.bankroll || state.currentBet < MIN_BET) return state;

  let current = { ...state };
  current.bankroll -= current.currentBet;
  current.roundResults = [];
  current.insuranceBet = 0;
  current.insuranceOffered = false;

  // Deal cards: Player 1, Dealer 1, Player 2, Dealer 2 (hidden)
  const pCard1 = drawCard(current);
  current = pCard1.state;

  const dCard1 = drawCard(current);
  current = dCard1.state;

  const pCard2 = drawCard(current);
  current = pCard2.state;

  const dCard2 = drawCard(current);
  current = dCard2.state;
  const hiddenDealerCard = { ...dCard2.card, hidden: true };

  const initialHand: Hand = {
    id: `hand-${Date.now()}-0`,
    cards: [pCard1.card, pCard2.card],
    bet: current.currentBet,
    isDoubled: false,
    isSplit: false,
    isFinished: false,
    isBust: false,
    isBlackjack: false,
  };

  const initialScore = calculateHandScore(initialHand.cards);
  if (initialScore.isBlackjack) {
    initialHand.isBlackjack = true;
    initialHand.isFinished = true;
  }

  current.playerHands = [initialHand];
  current.dealerHand = [dCard1.card, hiddenDealerCard];
  current.activeHandIndex = 0;

  // Check Dealer Ace for Insurance offer
  if (dCard1.card.rank === 'A' && !initialHand.isBlackjack) {
    current.stage = 'INSURANCE_OFFER';
    current.insuranceOffered = true;
    current.message = 'Dealer má Eso. Chcete se pojistit proti Blackjacku?';
    return current;
  }

  return checkAfterDeal(current);
}

function checkAfterDeal(state: GameState): GameState {
  const current = { ...state };
  const playerHand = current.playerHands[0];
  const dealerUpCard = current.dealerHand[0];
  const dealerDownCard = current.dealerHand[1];

  // Reveal dealer downcard if player or dealer has blackjack
  const dealerScoreWithHidden = calculateHandScore([dealerUpCard, dealerDownCard]);

  if (playerHand.isBlackjack || dealerScoreWithHidden.isBlackjack) {
    // Reveal dealer hand
    current.dealerHand = current.dealerHand.map(c => ({ ...c, hidden: false }));
    return endRound(current);
  }

  current.stage = 'PLAYER_TURN';
  current.message = 'Jste na řadě. Vyberte akci (Táhnout, Stát, Zdvojnásobit, Rozdělit).';
  return current;
}

export function buyInsurance(state: GameState, accept: boolean): GameState {
  if (state.stage !== 'INSURANCE_OFFER') return state;

  let current = { ...state };
  const maxInsurance = current.playerHands[0].bet / 2;

  if (accept) {
    if (current.bankroll >= maxInsurance) {
      current.bankroll -= maxInsurance;
      current.insuranceBet = maxInsurance;
    }
  }

  return checkAfterDeal(current);
}

export function playerHit(state: GameState): GameState {
  if (state.stage !== 'PLAYER_TURN') return state;

  let current = { ...state };
  const handIndex = current.activeHandIndex;
  const hand = { ...current.playerHands[handIndex] };

  if (hand.isFinished) return current;

  const cardRes = drawCard(current);
  current = cardRes.state;

  hand.cards = [...hand.cards, cardRes.card];
  const score = calculateHandScore(hand.cards);

  if (score.isBust) {
    hand.isBust = true;
    hand.isFinished = true;
  } else if (score.isTwentyOne) {
    hand.isFinished = true;
  }

  const newHands = [...current.playerHands];
  newHands[handIndex] = hand;
  current.playerHands = newHands;

  return advanceOrFinishPlayerTurn(current);
}

export function playerStand(state: GameState): GameState {
  if (state.stage !== 'PLAYER_TURN') return state;

  const current = { ...state };
  const handIndex = current.activeHandIndex;
  const hand = { ...current.playerHands[handIndex] };

  hand.isFinished = true;
  const newHands = [...current.playerHands];
  newHands[handIndex] = hand;
  current.playerHands = newHands;

  return advanceOrFinishPlayerTurn(current);
}

export function playerDoubleDown(state: GameState): GameState {
  if (state.stage !== 'PLAYER_TURN') return state;

  let current = { ...state };
  const handIndex = current.activeHandIndex;
  const hand = { ...current.playerHands[handIndex] };

  if (hand.cards.length !== 2 || hand.isFinished || current.bankroll < hand.bet) {
    return current;
  }

  // Deduct extra bet
  current.bankroll -= hand.bet;
  hand.bet *= 2;
  hand.isDoubled = true;

  // Draw exactly one card
  const cardRes = drawCard(current);
  current = cardRes.state;

  hand.cards = [...hand.cards, cardRes.card];
  const score = calculateHandScore(hand.cards);
  if (score.isBust) {
    hand.isBust = true;
  }
  hand.isFinished = true;

  const newHands = [...current.playerHands];
  newHands[handIndex] = hand;
  current.playerHands = newHands;

  return advanceOrFinishPlayerTurn(current);
}

export function canSplit(state: GameState): boolean {
  if (state.stage !== 'PLAYER_TURN') return false;
  const hand = state.playerHands[state.activeHandIndex];
  if (!hand || hand.cards.length !== 2 || hand.isFinished) return false;

  // Can split if both cards have same rank or same value (e.g. 10 and J)
  const c1 = hand.cards[0];
  const c2 = hand.cards[1];
  const sameRankOrValue = c1.rank === c2.rank || c1.value[0] === c2.value[0];
  return sameRankOrValue && state.bankroll >= hand.bet && state.playerHands.length < 4;
}

export function playerSplit(state: GameState): GameState {
  if (!canSplit(state)) return state;

  let current = { ...state };
  const handIndex = current.activeHandIndex;
  const originalHand = current.playerHands[handIndex];

  current.bankroll -= originalHand.bet;

  // Split cards
  const card1 = originalHand.cards[0];
  const card2 = originalHand.cards[1];

  // Draw new card for hand 1
  const cardRes1 = drawCard(current);
  current = cardRes1.state;

  // Draw new card for hand 2
  const cardRes2 = drawCard(current);
  current = cardRes2.state;

  const hand1: Hand = {
    id: `hand-${Date.now()}-1`,
    cards: [card1, cardRes1.card],
    bet: originalHand.bet,
    isDoubled: false,
    isSplit: true,
    isFinished: false,
    isBust: false,
    isBlackjack: false,
  };

  const hand2: Hand = {
    id: `hand-${Date.now()}-2`,
    cards: [card2, cardRes2.card],
    bet: originalHand.bet,
    isDoubled: false,
    isSplit: true,
    isFinished: false,
    isBust: false,
    isBlackjack: false,
  };

  const newHands = [...current.playerHands];
  newHands.splice(handIndex, 1, hand1, hand2);
  current.playerHands = newHands;

  return current;
}

function advanceOrFinishPlayerTurn(state: GameState): GameState {
  let current = { ...state };
  const allFinished = current.playerHands.every(h => h.isFinished);

  if (allFinished) {
    return playDealerTurn(current);
  } else {
    // Advance to next unfinished hand
    const nextUnfinished = current.playerHands.findIndex((h, idx) => idx >= current.activeHandIndex && !h.isFinished);
    if (nextUnfinished !== -1) {
      current.activeHandIndex = nextUnfinished;
    } else {
      current.activeHandIndex = current.playerHands.findIndex(h => !h.isFinished);
    }
    return current;
  }
}

export function playDealerTurn(state: GameState): GameState {
  let current = { ...state };
  current.stage = 'DEALER_TURN';

  // Reveal hidden cards
  current.dealerHand = current.dealerHand.map(c => ({ ...c, hidden: false }));

  // If all player hands are bust, dealer doesn't need to draw extra cards
  const allPlayerBust = current.playerHands.every(h => h.isBust);

  if (!allPlayerBust) {
    let dealerScore = calculateHandScore(current.dealerHand);
    while (dealerScore.total < 17) {
      const cardRes = drawCard(current);
      current = cardRes.state;
      current.dealerHand = [...current.dealerHand, cardRes.card];
      dealerScore = calculateHandScore(current.dealerHand);
    }
  }

  return endRound(current);
}

export function endRound(state: GameState): GameState {
  let current = { ...state };
  current.stage = 'ROUND_OVER';

  // Ensure dealer cards visible
  current.dealerHand = current.dealerHand.map(c => ({ ...c, hidden: false }));
  const dealerScore = calculateHandScore(current.dealerHand);

  let totalPayout = 0;
  const roundResults = [];
  let roundWins = 0;
  let roundLosses = 0;
  let roundPushes = 0;
  let roundBlackjacks = 0;
  let netProfitThisRound = 0;

  // Insurance payout check
  if (current.insuranceBet > 0) {
    if (dealerScore.isBlackjack) {
      const insurancePayout = current.insuranceBet * 3; // return bet + 2:1 payout
      totalPayout += insurancePayout;
      roundResults.push({
        handId: 'insurance',
        resultText: 'Pojištění vyšlo! Výhra 2:1.',
        payout: insurancePayout,
      });
    } else {
      roundResults.push({
        handId: 'insurance',
        resultText: 'Pojištění nevyšlo.',
        payout: 0,
      });
    }
  }

  for (let i = 0; i < current.playerHands.length; i++) {
    const hand = current.playerHands[i];
    const playerScore = calculateHandScore(hand.cards);
    let handPayout = 0;
    let resultText = '';

    if (hand.isBust) {
      resultText = 'Mimo (Bust) - Prohra';
      roundLosses += 1;
      netProfitThisRound -= hand.bet;
    } else if (dealerScore.isBust) {
      handPayout = hand.bet * 2;
      resultText = 'Dealer přetáhl (Bust)! Výhra 1:1';
      roundWins += 1;
      netProfitThisRound += hand.bet;
    } else if (hand.isBlackjack && !dealerScore.isBlackjack) {
      handPayout = hand.bet + Math.floor(hand.bet * 1.5); // 3:2 payout
      resultText = 'BLACKJACK! Výhra 3:2 🎉';
      roundWins += 1;
      roundBlackjacks += 1;
      netProfitThisRound += Math.floor(hand.bet * 1.5);
    } else if (dealerScore.isBlackjack && !hand.isBlackjack) {
      resultText = 'Dealer má Blackjack! Prohra';
      roundLosses += 1;
      netProfitThisRound -= hand.bet;
    } else if (playerScore.total > dealerScore.total) {
      handPayout = hand.bet * 2;
      resultText = `Výhra (${playerScore.total} vs ${dealerScore.total})!`;
      roundWins += 1;
      netProfitThisRound += hand.bet;
    } else if (playerScore.total < dealerScore.total) {
      resultText = `Prohra (${playerScore.total} vs ${dealerScore.total})`;
      roundLosses += 1;
      netProfitThisRound -= hand.bet;
    } else {
      // Push
      handPayout = hand.bet;
      resultText = `Remíza / Remíza (${playerScore.total} vs ${dealerScore.total})`;
      roundPushes += 1;
    }

    totalPayout += handPayout;
    roundResults.push({
      handId: hand.id,
      resultText,
      payout: handPayout,
    });
  }

  current.bankroll += totalPayout;
  current.roundResults = roundResults;

  // Stats update
  const newStats: GameStats = {
    handsPlayed: current.stats.handsPlayed + current.playerHands.length,
    wins: current.stats.wins + roundWins,
    losses: current.stats.losses + roundLosses,
    pushes: current.stats.pushes + roundPushes,
    blackjacks: current.stats.blackjacks + roundBlackjacks,
    totalProfit: current.stats.totalProfit + netProfitThisRound,
  };
  current.stats = newStats;

  current.message = 'Kolo skončilo. Zvolte novou sázku a klikněte na "Rozdat karty".';

  return current;
}

export function setDeckCount(state: GameState, deckCount: number): GameState {
  if (deckCount < 1 || deckCount > 8) return state;
  return {
    ...state,
    deckCount,
    shoe: createShoe(deckCount),
    discardPile: [],
  };
}

export function reshuffleShoe(state: GameState): GameState {
  return {
    ...state,
    shoe: createShoe(state.deckCount),
    discardPile: [],
    message: `Balíček znova zamíchán (${state.deckCount} balíčků).`,
  };
}

export function reloadBankroll(state: GameState): GameState {
  return {
    ...state,
    bankroll: Math.max(state.bankroll, INITIAL_BANKROLL),
    message: 'Kredit byl úspěšně dobit na 1 000 Kč!',
  };
}
