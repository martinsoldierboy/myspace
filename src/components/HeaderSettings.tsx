import React, { useState } from 'react';
import { Settings, RefreshCw, Trophy, DollarSign, Layers, X, HelpCircle } from 'lucide-react';
import type { GameState } from '../logic/gameEngine';

interface HeaderSettingsProps {
  state: GameState;
  onSetDeckCount: (count: number) => void;
  onReshuffle: () => void;
  onResetBalance: () => void;
}

export const HeaderSettings: React.FC<HeaderSettingsProps> = ({
  state,
  onSetDeckCount,
  onReshuffle,
  onResetBalance,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const remainingPercent = Math.round((state.shoe.length / (state.deckCount * 52)) * 100);

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white px-4 py-3 shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-slate-900 font-extrabold text-xl px-2.5 py-1 rounded shadow">
              BJ
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Blackjack Casino
              </h1>
              <p className="text-xs text-slate-400">Klasická pravidla & Sázky</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center space-x-6 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/60 text-sm">
            <div className="flex items-center space-x-1.5" title="Kredit">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-xs font-medium">Kredit:</span>
              <span className="font-bold text-emerald-300 text-base">
                {state.bankroll.toLocaleString('cs-CZ')} Kč
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5" title="Zamíchané balíčky">
              <Layers className="w-4 h-4 text-teal-400" />
              <span className="text-slate-400 text-xs font-medium">Balíčky:</span>
              <span className="font-bold text-slate-200">
                {state.deckCount} ({state.shoe.length} karet, {remainingPercent}%)
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1 text-xs cursor-pointer"
              title="Pravidla hry"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden md:inline">Pravidla</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1 text-xs font-medium border border-slate-700/50 cursor-pointer"
              title="Nastavení"
            >
              <Settings className="w-5 h-5 text-emerald-400" />
              <span>Nastavení</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Settings className="w-5 h-5 text-emerald-400" />
              <span>Nastavení hry</span>
            </h2>

            <div className="space-y-6">
              {/* Deck selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Počet balíčků v míchacím balíku (Shoe):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 6, 8].map(count => (
                    <button
                      key={count}
                      onClick={() => onSetDeckCount(count)}
                      disabled={state.stage !== 'BETTING'}
                      className={`py-2 rounded-lg font-bold text-sm border transition-all cursor-pointer ${
                        state.deckCount === count
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      } ${state.stage !== 'BETTING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {count} {count === 1 ? 'balíček' : count < 5 ? 'balíčky' : 'balíčků'}
                    </button>
                  ))}
                </div>
                {state.stage !== 'BETTING' && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    Počet balíčků lze změnit pouze před rozdáním sázky.
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Aktuálně zbývá v balíku: <span className="font-semibold text-slate-200">{state.shoe.length} karet</span> ({remainingPercent}%)
                </p>
              </div>

              {/* Reshuffle Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Zamíchat balíčky znovu</div>
                  <div className="text-xs text-slate-400">Vytvoří nový zamíchaný balík karet.</div>
                </div>
                <button
                  onClick={() => {
                    onReshuffle();
                  }}
                  disabled={state.stage !== 'BETTING'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  <span>Zamíchat</span>
                </button>
              </div>

              {/* Reset Bankroll */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-200">Resetovat Kredit</div>
                  <div className="text-xs text-slate-400">Obnoví kredit na základních 1 000 Kč.</div>
                </div>
                <button
                  onClick={onResetBalance}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Doplnit (1000 Kč)
                </button>
              </div>

              {/* Stats Overview */}
              <div className="pt-3 border-t border-slate-800">
                <div className="font-semibold text-sm text-slate-200 mb-2 flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Statistiky hráče</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400">Odehraná kola:</span>{' '}
                    <span className="font-bold text-white">{state.stats.handsPlayed}</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400">Výhry:</span>{' '}
                    <span className="font-bold text-emerald-400">{state.stats.wins}</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400">Prohry:</span>{' '}
                    <span className="font-bold text-rose-400">{state.stats.losses}</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                    <span className="text-slate-400">Blackjacky:</span>{' '}
                    <span className="font-bold text-amber-300">{state.stats.blackjacks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {isRulesOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setIsRulesOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-emerald-400 border-b border-slate-800 pb-2">
              Pravidla Blackjacku
            </h2>
            <div className="space-y-3 text-sm text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              <p>
                <strong className="text-white">Cíl hry:</strong> Získat vyšší součet karet než dealer, aniž byste překročili součet 21.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                <li><strong className="text-slate-200">Karty 2–10:</strong> Mají svou nominální hodnotu.</li>
                <li><strong className="text-slate-200">J, Q, K:</strong> Mají hodnotu 10.</li>
                <li><strong className="text-slate-200">Eso (A):</strong> Má hodnotu 11 nebo 1 podle toho, co je výhodnější.</li>
              </ul>
              <h3 className="font-bold text-white text-sm pt-2">Výplaty a akce:</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                <li><strong className="text-emerald-400">Blackjack (Eso + 10-karta):</strong> Výplata 3:2.</li>
                <li><strong className="text-emerald-400">Běžná výhra:</strong> Výplata 1:1.</li>
                <li><strong className="text-amber-400">Remíza (Push):</strong> Sázka se vrací.</li>
                <li><strong className="text-teal-300">Zdvojnásobit (Double):</strong> Zdvojnásobíte sázku a líznete právě 1 kartu.</li>
                <li><strong className="text-teal-300">Rozdělit (Split):</strong> Dvě karty stejné hodnoty lze rozdělit na dvě samostatné ruky za dodatečnou sázku.</li>
                <li><strong className="text-teal-300">Pojištění (Insurance):</strong> Pokud má dealer Eso, můžete vsadit polovinu sázky s výplatou 2:1 proti jeho Blackjacku.</li>
              </ul>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                Dealer musí táhnout při součtu nižším než 17 a stát při 17 a více.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
