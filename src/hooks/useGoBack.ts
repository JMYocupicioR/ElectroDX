import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface BackTargetContext {
  stateFrom?: unknown;
  search?: string;
  currentPathname?: string;
  historyIdx?: number;
  hasReferrer?: boolean;
  fallback: string;
}

export type BackAction =
  | { type: 'navigate'; path: string }
  | { type: 'back' };

/**
 * Resuelve hacia dónde debe dirigir la navegación de retorno según el contexto.
 */
export function resolveBackTarget(ctx: BackTargetContext): BackAction {
  // 1. location.state.from
  if (
    typeof ctx.stateFrom === 'string' &&
    ctx.stateFrom.startsWith('/') &&
    ctx.stateFrom !== ctx.currentPathname
  ) {
    return { type: 'navigate', path: ctx.stateFrom };
  }

  // 2. URL search parameter 'from'
  if (ctx.search) {
    try {
      const params = new URLSearchParams(ctx.search);
      const fromParam = params.get('from');
      if (
        fromParam &&
        fromParam.startsWith('/') &&
        fromParam !== ctx.currentPathname
      ) {
        return { type: 'navigate', path: fromParam };
      }
    } catch {
      // Silencioso ante errores de URLSearchParams
    }
  }

  // 3. React Router history index > 0 dentro de la sesión de navegación del SPA
  if (typeof ctx.historyIdx === 'number' && ctx.historyIdx > 0) {
    return { type: 'back' };
  }

  // 4. Mismo host en referrer con historial > 1
  if (ctx.hasReferrer) {
    return { type: 'back' };
  }

  // 5. Fallback seguro
  return { type: 'navigate', path: ctx.fallback };
}

/**
 * Hook para regresar a la pantalla anterior de forma confiable e inteligente.
 */
export function useGoBack(defaultFallback: string = '/') {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (customFallback?: string, options?: { replace?: boolean }) => {
      const fallback = customFallback ?? defaultFallback;

      const historyIdx =
        typeof window !== 'undefined' && window.history?.state
          ? (window.history.state.idx as number | undefined)
          : undefined;

      const hasReferrer =
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        Boolean(
          document.referrer &&
            document.referrer.includes(window.location.host) &&
            window.history?.length > 1
        );

      const target = resolveBackTarget({
        stateFrom: (location.state as { from?: unknown } | null)?.from,
        search: location.search,
        currentPathname: location.pathname,
        historyIdx,
        hasReferrer,
        fallback,
      });

      if (target.type === 'back') {
        navigate(-1);
      } else {
        navigate(target.path, { replace: options?.replace });
      }
    },
    [navigate, location, defaultFallback]
  );
}
