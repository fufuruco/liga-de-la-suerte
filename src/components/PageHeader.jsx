import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, right, backTo = '/' }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <Link
        to={backTo}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-sky-100/80 transition hover:bg-white/[0.12]"
        aria-label="Volver"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="truncate text-xs font-semibold text-sky-200/60">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}