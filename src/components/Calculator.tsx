import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Delete, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalcButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'number' | 'operator' | 'action';
}

const CalcButton: React.FC<CalcButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'number',
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      'h-16 rounded-2xl font-bold text-lg flex items-center justify-center transition-all',
      variant === 'number' && 'bg-gray-100 dark:bg-white/5 text-[var(--text-main)] hover:bg-gray-200 dark:hover:bg-white/10',
      variant === 'operator' && 'bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-80',
      variant === 'action' && 'bg-[var(--primary)] text-white hover:opacity-90',
      className
    )}
  >
    {children}
  </motion.button>
);

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');

  const handleInput = (val: string) => {
    setDisplay((prev) => (prev === '0' ? val : prev + val));
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleDel = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleSolve = () => {
    try {
      // Basic sanitization
      const sanitized = display.replace(/[^-+*/.0-9]/g, '');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      setHistory(display + ' =');
      setDisplay(String(result));
    } catch {
      setDisplay('Error');
    }
  };

  const formatDisplay = (val: string) => {
    return val.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
  };

  return (
    <div className="max-w-sm md:max-w-md mx-auto bg-[var(--card)] p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-[var(--card-border)] transition-all">
      <div className="bg-gray-50 dark:bg-black/20 p-6 md:p-8 rounded-3xl mb-6 text-right overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
        <div className="text-gray-400 text-xs md:text-sm font-mono h-5 mb-1 truncate">{formatDisplay(history)}</div>
        <div className={cn(
          "text-[var(--text-main)] font-black font-mono truncate",
          display.length > 8 ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
        )}>
          {formatDisplay(display)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-4">
        <CalcButton onClick={handleClear} variant="number" className="text-red-500">
          <RotateCcw size={20} />
        </CalcButton>
        <CalcButton onClick={handleDel} variant="number" className="text-gray-400">
          <Delete size={20} />
        </CalcButton>
        <CalcButton onClick={() => handleInput('/')} variant="operator">÷</CalcButton>
        <CalcButton onClick={() => handleInput('*')} variant="operator">×</CalcButton>

        {[7, 8, 9].map((n) => (
          <CalcButton key={n} onClick={() => handleInput(String(n))}>{n}</CalcButton>
        ))}
        <CalcButton onClick={() => handleInput('-')} variant="operator">−</CalcButton>

        {[4, 5, 6].map((n) => (
          <CalcButton key={n} onClick={() => handleInput(String(n))}>{n}</CalcButton>
        ))}
        <CalcButton onClick={() => handleInput('+')} variant="operator">+</CalcButton>

        {[1, 2, 3].map((n) => (
          <CalcButton key={n} onClick={() => handleInput(String(n))}>{n}</CalcButton>
        ))}
        <CalcButton onClick={handleSolve} variant="action" className="row-span-2">=</CalcButton>

        <CalcButton onClick={() => handleInput('0')} className="col-span-2">0</CalcButton>
        <CalcButton onClick={() => handleInput('.')}>.</CalcButton>
      </div>
    </div>
  );
}
