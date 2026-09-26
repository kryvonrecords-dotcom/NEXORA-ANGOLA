import React from 'react';
import { Sun, Moon, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  variant?: 'compact' | 'full' | 'pills' | 'button';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'compact', className = '', showLabel = true }: Props) {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  // 1. Full detailed cards (Drawer mobile and Settings)
  if (variant === 'full') {
    return (
      <div className={`space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
            Iluminação e Tema
          </span>
          <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isDark ? 'Modo Noturno' : 'Modo Diurno'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Light Mode / Sol */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              theme === 'light'
                ? 'bg-amber-500/10 border-amber-500/80 text-amber-900 ring-2 ring-amber-400/30 shadow-sm dark:bg-amber-500/20 dark:text-amber-200'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-xs">
                <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              {theme === 'light' && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
              <span>☀️ Modo Claro</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              Para quando tem muito sol e luz
            </div>
          </button>

          {/* Dark Mode / Lua */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#A50D1F]/15 border-blue-400 text-[#F9D616] ring-2 ring-blue-500/30 shadow-sm'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-xs">
                <Moon className="w-4 h-4 text-blue-400 fill-blue-400/30" />
              </div>
              {theme === 'dark' && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div className="font-bold text-xs text-white flex items-center gap-1">
              <span>🌙 Modo Escuro</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              Para quando está escuro ou à noite
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. Pills variant
  if (variant === 'pills') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/70 shadow-inner ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Modo Claro (☀️ Sol - Dia)"
        >
          <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'fill-current text-slate-950' : 'text-amber-400'}`} />
          <span>Dia</span>
          {theme === 'light' && <Check className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#A50D1F] text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Modo Escuro (🌙 Lua - Noite)"
        >
          <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'fill-current text-white' : 'text-[#F9D616]'}`} />
          <span>Noite</span>
          {theme === 'dark' && <Check className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // 3. Quick 1-click Toggle Button
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 ${className}`}
        title={isDark ? 'Mudar para Modo Claro (☀️ Sol)' : 'Mudar para Modo Escuro (🌙 Lua)'}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/50" />
            {showLabel && <span className="text-xs font-semibold">Modo Dia</span>}
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-[#F9D616] fill-[#F9D616]/30" />
            {showLabel && <span className="text-xs font-semibold">Modo Noite</span>}
          </>
        )}
      </button>
    );
  }

  // 4. Compact Dual-Icon Slider Bar (Default Navbar / Header)
  return (
    <div 
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 dark:bg-slate-800 border border-slate-700/80 text-xs font-semibold shadow-xs ${className}`}
      role="group"
      aria-label="Escolha entre Modo Sol (Dia) e Modo Lua (Noite)"
    >
      {/* Sun Button (Dia) */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
          theme === 'light'
            ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
            : 'text-slate-400 hover:text-amber-300 hover:bg-white/5'
        }`}
        title="Modo Claro: Ideal para ler de dia ou com muito sol"
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
        <span className="text-[11px] hidden sm:inline">Sol</span>
      </button>

      {/* Moon Button (Noite) */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
          theme === 'dark'
            ? 'bg-[#CE1126] text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-[#F9D616] hover:bg-white/5'
        }`}
        title="Modo Escuro: Ideal para ler à noite ou em ambientes com pouca luz"
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'fill-white text-white' : 'text-[#F9D616]'}`} />
        <span className="text-[11px] hidden sm:inline">Lua</span>
      </button>
    </div>
  );
}
