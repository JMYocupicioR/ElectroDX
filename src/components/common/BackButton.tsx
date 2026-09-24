import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGoBack } from '../../hooks/useGoBack';

export interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fallback?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
}

/**
 * Componente de botón "Volver" con resolución inteligente de pantalla previa.
 * Utiliza useGoBack para retornar a la pantalla anterior real en lugar de estar hardcodeado.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  fallback = '/',
  label = 'Volver',
  icon,
  iconClassName = 'w-4 h-4',
  className = 'inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors cursor-pointer',
  onClick,
  children,
  ...props
}) => {
  const goBack = useGoBack(fallback);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }
    goBack();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {icon !== undefined ? icon : <ArrowLeft className={iconClassName} />}
      {children ?? label}
    </button>
  );
};

export default BackButton;
