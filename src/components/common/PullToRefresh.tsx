import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowDown, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { usePWAUpdateStore } from '../../stores/pwaUpdateStore';
import { isExamSessionLocked } from '../../utils/pwaUpdate';

export type PullToRefreshStatus = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'locked';

export interface PullToRefreshProps {
  /** Distance in pixels required to trigger refresh (default: 70) */
  threshold?: number;
  /** Maximum distance in pixels the indicator can travel (default: 110) */
  maxPull?: number;
  /** Custom refresh handler; if omitted, checks SW update & reloads */
  onRefresh?: () => Promise<void> | void;
  /** Whether pull-to-refresh is globally disabled */
  disabled?: boolean;
}

/**
 * Checks whether the page or root element is at the very top.
 * Supports standard browser scroll and standalone PWA (#root) scroll.
 */
export function isPageAtTop(target?: EventTarget | null): boolean {
  if (typeof window === 'undefined') return true;

  // 1. Check window / document scroll
  const winY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement?.scrollTop ||
    document.body?.scrollTop ||
    0;
  if (winY > 1) return false;

  // 2. Check #root scroll (standalone PWA mode)
  const root = document.getElementById('root');
  if (root && root.scrollTop > 1) return false;

  // 3. Check target and scrollable parent chain
  if (target && (typeof HTMLElement === 'undefined' || target instanceof HTMLElement)) {
    let el = target as HTMLElement | null;
    while (el && el !== document.body && el !== document.documentElement && el !== root) {
      if (el.scrollTop && el.scrollTop > 1) return false;
      el = el.parentElement;
    }
  }

  return true;
}

/**
 * Determines whether touch started on an element that shouldn't trigger PTR
 * (e.g. interactive canvases, inputs, modal dialogs, sliders).
 */
export function isExcludedElement(target?: EventTarget | null): boolean {
  if (!target) return false;
  if (typeof HTMLElement !== 'undefined' && !(target instanceof HTMLElement)) return false;
  const el = target as { closest?: (selector: string) => Element | null };
  return Boolean(
    el.closest?.(
      'canvas, input, textarea, select, [data-no-ptr], [role="dialog"], [aria-modal="true"], [role="slider"]'
    )
  );
}

export function PullToRefresh({
  threshold = 70,
  maxPull = 110,
  onRefresh,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<PullToRefreshStatus>('idle');

  // Mutable refs to track active touch/drag gestures cleanly without rerenders
  const isTrackingRef = useRef(false);
  const isPullingRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const hasVibratedRef = useRef(false);
  const statusRef = useRef<PullToRefreshStatus>('idle');
  statusRef.current = status;

  const handleRefresh = useCallback(async () => {
    // 1. Guard active exam session to prevent loss of answers
    if (isExamSessionLocked()) {
      setStatus('locked');
      setPullDistance(60);
      try {
        navigator.vibrate?.(40);
      } catch {
        // ignore
      }
      setTimeout(() => {
        setStatus('idle');
        setPullDistance(0);
      }, 2400);
      return;
    }

    setStatus('refreshing');
    setPullDistance(60);

    try {
      navigator.vibrate?.(25);
    } catch {
      // ignore
    }

    // Broadcast custom event so active pages or queries can flush state
    window.dispatchEvent(new CustomEvent('app:pull-to-refresh'));

    if (onRefresh) {
      try {
        await onRefresh();
      } catch (err) {
        console.warn('[PullToRefresh] Custom refresh failed:', err);
      }
    } else {
      // Default: Check for Service Worker update first
      try {
        const store = usePWAUpdateStore.getState();
        const hasWaiting = await store.checkForUpdate();
        if (hasWaiting || store.needRefresh) {
          await store.updateApp();
          return;
        }
      } catch (err) {
        console.warn('[PullToRefresh] Error checking Service Worker:', err);
      }
    }

    // Small delay so user sees smooth feedback, then reload
    await new Promise((r) => setTimeout(r, 600));
    window.location.reload();
  }, [onRefresh]);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    // --- Touch Event Handlers ---
    const onTouchStart = (e: TouchEvent) => {
      if (statusRef.current === 'refreshing' || statusRef.current === 'locked') return;
      if (e.touches.length !== 1) return;

      const target = e.target;
      if (isExcludedElement(target) || !isPageAtTop(target)) {
        isTrackingRef.current = false;
        return;
      }

      isTrackingRef.current = true;
      isPullingRef.current = false;
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      hasVibratedRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTrackingRef.current || statusRef.current === 'refreshing' || statusRef.current === 'locked') {
        return;
      }
      if (e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - startYRef.current;
      const deltaX = currentX - startXRef.current;

      // Cancel if swiping horizontally (carousel, tab bar, swipe back)
      if (!isPullingRef.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
        isTrackingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        return;
      }

      // Cancel if scrolling down (pushing content up)
      if (deltaY < 0) {
        isTrackingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        return;
      }

      // Ensure user hasn't scrolled down since gesture started
      if (!isPageAtTop(e.target)) {
        isTrackingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        return;
      }

      if (deltaY > 0) {
        isPullingRef.current = true;

        // Prevent browser overscroll/pull-to-refresh conflicts when dragging down
        if (e.cancelable && deltaY > 10) {
          e.preventDefault();
        }

        // Apply physical resistance / damping curve
        const damping = 0.45;
        const pull = Math.min(maxPull, deltaY * damping);
        setPullDistance(pull);

        if (pull >= threshold) {
          setStatus('ready');
          if (!hasVibratedRef.current) {
            hasVibratedRef.current = true;
            try {
              navigator.vibrate?.(15);
            } catch {
              // ignore
            }
          }
        } else {
          setStatus('pulling');
          hasVibratedRef.current = false;
        }
      }
    };

    const onTouchEnd = () => {
      if (!isTrackingRef.current && !isPullingRef.current) return;
      isTrackingRef.current = false;
      isPullingRef.current = false;

      if (statusRef.current === 'ready') {
        void handleRefresh();
      } else if (statusRef.current === 'pulling') {
        setStatus('idle');
        setPullDistance(0);
      }
    };

    // --- Mouse Drag Support (Top Header Edge Drag on Desktop/Emulation) ---
    const onMouseDown = (e: MouseEvent) => {
      if (statusRef.current === 'refreshing' || statusRef.current === 'locked') return;
      // Only start mouse drag if clicking near the top edge (<= 64px) while page is at top
      if (e.clientY > 64 || !isPageAtTop(e.target) || isExcludedElement(e.target)) {
        return;
      }

      isTrackingRef.current = true;
      isPullingRef.current = false;
      startYRef.current = e.clientY;
      startXRef.current = e.clientX;
      hasVibratedRef.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isTrackingRef.current || statusRef.current === 'refreshing' || statusRef.current === 'locked') {
        return;
      }

      const deltaY = e.clientY - startYRef.current;
      const deltaX = e.clientX - startXRef.current;

      if (deltaY < 0 || Math.abs(deltaX) > Math.abs(deltaY)) {
        isTrackingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        return;
      }

      if (deltaY > 0) {
        isPullingRef.current = true;
        const damping = 0.45;
        const pull = Math.min(maxPull, deltaY * damping);
        setPullDistance(pull);

        if (pull >= threshold) {
          setStatus('ready');
        } else {
          setStatus('pulling');
        }
      }
    };

    const onMouseUp = () => {
      if (!isTrackingRef.current && !isPullingRef.current) return;
      isTrackingRef.current = false;
      isPullingRef.current = false;

      if (statusRef.current === 'ready') {
        void handleRefresh();
      } else if (statusRef.current === 'pulling') {
        setStatus('idle');
        setPullDistance(0);
      }
    };

    // Attach listeners. Touchmove must have passive: false so preventDefault works.
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);

      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [disabled, threshold, maxPull, handleRefresh]);

  if (status === 'idle' && pullDistance === 0) {
    return null;
  }

  const isVisible = pullDistance > 0 || status === 'refreshing' || status === 'locked';
  const progressRatio = Math.min(1, Math.max(0, pullDistance / threshold));
  const rotationDeg = progressRatio * 180;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        status === 'refreshing'
          ? 'Actualizando aplicación'
          : status === 'ready'
          ? 'Suelta para actualizar'
          : status === 'locked'
          ? 'Examen en curso: actualización deshabilitada'
          : 'Desliza hacia abajo para actualizar'
      }
      className="fixed left-1/2 -translate-x-1/2 z-[70] pointer-events-none select-none"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 68px)',
        transform: `translate(-50%, ${
          status === 'refreshing' || status === 'locked'
            ? '12px'
            : `${Math.max(0, pullDistance - 40)}px`
        })`,
        opacity: isVisible ? (status === 'refreshing' || status === 'locked' ? 1 : Math.min(1, Math.max(0, (pullDistance - 10) / 35))) : 0,
        transition: isPullingRef.current
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
      }}
    >
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl border shadow-xl transition-colors duration-200 ${
          status === 'locked'
            ? 'bg-amber-50/95 dark:bg-amber-950/95 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 shadow-amber-500/10'
            : status === 'ready'
            ? 'bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 shadow-emerald-500/15'
            : status === 'refreshing'
            ? 'bg-white/95 dark:bg-slate-900/95 border-blue-400 dark:border-cyan-500 text-blue-700 dark:text-cyan-300 shadow-blue-500/20'
            : 'bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 shadow-slate-900/10 dark:shadow-cyan-950/30'
        }`}
      >
        {status === 'locked' ? (
          <>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
            <span className="text-xs font-bold whitespace-nowrap">
              Examen activo — protegido
            </span>
          </>
        ) : status === 'refreshing' ? (
          <>
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 animate-spin" />
            <span className="text-xs font-bold whitespace-nowrap">
              Actualizando app...
            </span>
          </>
        ) : status === 'ready' ? (
          <>
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 scale-110 transition-transform" />
            <span className="text-xs font-bold whitespace-nowrap">
              Suelta para actualizar
            </span>
          </>
        ) : (
          <>
            <ArrowDown
              className="w-4 h-4 text-indigo-600 dark:text-cyan-400 shrink-0 transition-transform"
              style={{ transform: `rotate(${rotationDeg}deg)` }}
            />
            <span className="text-xs font-medium whitespace-nowrap">
              Desliza para actualizar
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default PullToRefresh;
