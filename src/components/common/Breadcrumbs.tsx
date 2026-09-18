import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={`flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium ${className}`}
    >
      <Link
        to="/"
        className="flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
        title="Inicio"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Inicio</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors truncate max-w-[200px]"
                title={item.label}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            ) : (
              <span
                className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold truncate max-w-[240px]"
                aria-current={isLast ? 'page' : undefined}
                title={item.label}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
