import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export function PublicSimulatorAuthBar() {
  return (
    <section className="mt-8 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Modo público</p>
      <h2 className="mt-1 text-lg font-bold text-white">Sigue con tu cuenta</h2>
      <p className="mt-1 text-sm text-slate-400 max-w-xl">
        Este ejercicio está abierto para probar el simulador. Regístrate o inicia sesión para entrar a la plataforma.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Link
          to="/auth/registro"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold min-h-[44px]"
        >
          <UserPlus className="w-4 h-4" />
          Registrarme
        </Link>
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold min-h-[44px] border border-slate-700"
        >
          <LogIn className="w-4 h-4" />
          Iniciar sesión
        </Link>
      </div>
    </section>
  );
}
