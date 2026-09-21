/** Paleta impresa del folleto — modo oscuro institucional ElectroDx. */
export const ink = {
  bg: '#070b18',
  bgDeep: '#050814',
  card: '#111c36',
  cardAlt: '#0e1730',
  line: '#1e3a5f',
  lineSoft: '#243a63',
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#06b6d4',
  accent: '#38bdf8',
  accentSoft: '#7dd3fc',
  text: '#f8fafc',
  muted: '#94a3b8',
  muted2: '#64748b',
  white: '#ffffff',
  amber: '#fbbf24',
  emerald: '#34d399',
} as const;

export const PAGE = {
  width: 595.28,
  height: 841.89,
  padX: 36,
  padTop: 58,
  padBottom: 46,
} as const;

export const COURSE_ACCENT: Record<string, string> = {
  principiante: '#3b82f6',
  intermedio: '#06b6d4',
  avanzado: '#a78bfa',
  referencia: '#38bdf8',
};

const MODULE_GRADIENTS: Record<string, [string, string]> = {
  'from-blue-500 to-blue-700': ['#3b82f6', '#1d4ed8'],
  'from-yellow-500 to-orange-600': ['#eab308', '#ea580c'],
  'from-green-500 to-emerald-700': ['#22c55e', '#047857'],
  'from-purple-500 to-purple-800': ['#a855f7', '#6b21a8'],
  'from-blue-600 to-indigo-800': ['#2563eb', '#3730a3'],
  'from-indigo-500 to-indigo-800': ['#6366f1', '#3730a3'],
  'from-teal-500 to-cyan-700': ['#14b8a6', '#0e7490'],
  'from-amber-500 to-amber-800': ['#f59e0b', '#92400e'],
  'from-red-500 to-red-800': ['#ef4444', '#991b1b'],
  'from-slate-500 to-slate-800': ['#64748b', '#1e293b'],
  'from-sky-500 to-sky-700': ['#0ea5e9', '#0369a1'],
  'from-stone-500 to-stone-700': ['#78716c', '#44403c'],
  'from-red-600 to-rose-800': ['#dc2626', '#9f1239'],
  'from-teal-500 to-emerald-700': ['#14b8a6', '#047857'],
  'from-amber-500 to-orange-700': ['#f59e0b', '#c2410c'],
  'from-violet-500 to-fuchsia-700': ['#8b5cf6', '#a21caf'],
  'from-sky-500 to-indigo-700': ['#0ea5e9', '#4338ca'],
};

export function moduleGradient(color: string): [string, string] {
  return MODULE_GRADIENTS[color] ?? [ink.primary, ink.primaryDark];
}
