import { cn } from '@/lib/utils';

const PIPS = {
  1: [[50, 50]],
  2: [[29, 29], [71, 71]],
  3: [[29, 29], [50, 50], [71, 71]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 27], [70, 27], [30, 50], [70, 50], [30, 73], [70, 73]],
};

const FACE_COLORS = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#0ea5e9',
  4: '#10b981',
  5: '#8b5cf6',
  6: '#ec4899',
};

export default function Dice({ value = 1, size = 96, rolling = false, className }) {
  const face = FACE_COLORS[value] || FACE_COLORS[1];
  const pips = PIPS[value] || PIPS[1];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn(
        'drop-shadow-[0_14px_20px_rgba(40,20,0,0.45)] transition-transform duration-200',
        rolling && 'animate-bounce',
        className
      )}
      aria-label={`Dado mostrando ${value}`}
      role="img"
    >
      <rect x="4" y="4" width="92" height="92" rx="22" fill="#fffdf7" />
      <rect x="4" y="4" width="92" height="92" rx="22" fill="none" stroke={face} strokeWidth="4" />
      <rect x="10" y="10" width="80" height="80" rx="17" fill="none" stroke={face} strokeOpacity="0.18" strokeWidth="2" />
      {pips.map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r="8.6" fill={face} />
      ))}
    </svg>
  );
}