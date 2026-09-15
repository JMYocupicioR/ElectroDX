import React from 'react';
import { BRAND } from '../../config/brand';

interface BrandLogoProps {
  /** Variante visual: completa (icono + texto), solo icono, o solo monograma */
  variant?: 'full' | 'icon-only' | 'compact' | 'badge';
  /** Tamaño del componente */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Clase CSS adicional para el contenedor principal */
  className?: string;
  /** Mostrar badge de aval COMEFYR */
  showAccreditation?: boolean;
}

const sizeConfig = {
  xs: {
    iconSize: 20,
    containerClass: 'gap-1.5',
    titleClass: 'text-sm font-extrabold',
    subClass: 'text-[9px]',
    badgeClass: 'text-[8px] px-1.5 py-0.2',
  },
  sm: {
    iconSize: 28,
    containerClass: 'gap-2',
    titleClass: 'text-base font-extrabold',
    subClass: 'text-[10px]',
    badgeClass: 'text-[9px] px-2 py-0.5',
  },
  md: {
    iconSize: 36,
    containerClass: 'gap-2.5 sm:gap-3',
    titleClass: 'text-lg sm:text-xl font-black',
    subClass: 'text-xs',
    badgeClass: 'text-[10px] px-2.5 py-0.5',
  },
  lg: {
    iconSize: 48,
    containerClass: 'gap-3 sm:gap-4',
    titleClass: 'text-2xl sm:text-3xl font-black',
    subClass: 'text-sm',
    badgeClass: 'text-xs px-3 py-1',
  },
  xl: {
    iconSize: 64,
    containerClass: 'gap-4',
    titleClass: 'text-4xl font-black',
    subClass: 'text-base',
    badgeClass: 'text-xs px-3.5 py-1',
  },
};

/**
 * Isotipo Exclusivo Registrable: Rayo Bioeléctrico de Alta Resolución
 * Fusión de descarga de alta frecuencia y potencial de acción electrofisiológico (EMG).
 * Geometría facetada con vectores angulares, no genérica.
 */
export const BioelectricLightningIcon: React.FC<{
  size?: number;
  className?: string;
  glow?: boolean;
}> = ({ size = 36, className = '', glow = true }) => {
  const gradientId = React.useId();
  const filterId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Isotipo ElectoDX Rayo Bioeléctrico"
    >
      <defs>
        {/* Gradiente bioeléctrico: cobalto a cian brillante */}
        <linearGradient id={`bolt-grad-a-${gradientId}`} x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id={`bolt-grad-b-${gradientId}`} x1="45" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="60%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id={`pulse-grad-${gradientId}`} x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
        </linearGradient>

        {/* Resplandor neuroeléctrico sutil */}
        {glow && (
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Contenedor escultural / Base de gema facetada (fondo oscuro traslúcido) */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="22"
        className="fill-slate-900/90 dark:fill-slate-950/90 stroke-blue-500/30 dark:stroke-cyan-500/30"
        strokeWidth="1.5"
      />

      {/* Trazo basal electrofisiológico horizontal integrado (Potencial de Acción EMG de fondo) */}
      <path
        d="M 14 55 L 28 55 L 32 50 L 37 62 L 42 46 L 46 55 L 86 55"
        stroke={`url(#pulse-grad-${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />

      {/* Grupo principal del Rayo Bioeléctrico Facetado */}
      <g filter={glow ? `url(#${filterId})` : undefined}>
        {/* Faceta Anterior / Cuerpo Superior del Rayo */}
        <path
          d="M 54 13 L 26 48 L 46 48 L 38 87 L 74 44 L 52 44 Z"
          fill={`url(#bolt-grad-a-${gradientId})`}
          className="drop-shadow-md"
        />

        {/* Faceta Iluminada Tridimensional (Arista de refracción diagnóstica) */}
        <path
          d="M 54 13 L 42 48 L 52 44 Z"
          fill={`url(#bolt-grad-b-${gradientId})`}
          opacity="0.85"
        />

        {/* Faceta Inferior de Descarga Quirúrgica (Punta de aguja / Concentric spike) */}
        <path
          d="M 46 48 L 38 87 L 58 52 L 46 48 Z"
          fill={`url(#bolt-grad-b-${gradientId})`}
          opacity="0.9"
        />

        {/* Micro-nodo de Conducción Saltatoria en el vértice superior */}
        <circle cx="54" cy="13" r="2.5" fill="#e0f2fe" />

        {/* Micro-nodo de Inserción en la punta inferior */}
        <circle cx="38" cy="87" r="2" fill="#38bdf8" />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showAccreditation = true,
}) => {
  const config = sizeConfig[size];

  if (variant === 'icon-only') {
    return <BioelectricLightningIcon size={config.iconSize} className={className} />;
  }

  return (
    <div className={`flex items-center ${config.containerClass} ${className}`}>
      {/* Isotipo con halo reactivo */}
      <div className="relative group/logo flex items-center justify-center">
        <BioelectricLightningIcon size={config.iconSize} />
      </div>

      {/* Logotipo Tipográfico */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-tight">
          <span className={`text-slate-900 dark:text-white ${config.titleClass}`}>
            Electo
          </span>
          <span className={`bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent ml-0.5 ${config.titleClass}`}>
            DX
          </span>
          {variant !== 'compact' && (
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1.5 hidden sm:inline">
              {BRAND.badge}
            </span>
          )}
        </div>

        {/* Subtítulo o Aval Opcional */}
        {BRAND.enableAccreditation && showAccreditation && variant === 'full' && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-semibold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">
              {BRAND.accreditation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
