import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { verifyCertificate } from '../../services/studentToolsService';

export default function CertificateVerifyPage() {
  const { folio } = useParams();
  const [result, setResult] = useState<{
    valid: boolean;
    display_name?: string;
    issued_at?: string;
    revoked?: boolean;
    course_title?: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!folio) return;
    verifyCertificate(folio)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo verificar'));
  }, [folio]);

  return (
    <main id="contenido-principal" className="max-w-lg mx-auto px-4 pt-28 pb-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Verificación de constancia</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && !result && <p className="text-sm text-slate-500">Consultando folio…</p>}
      {result && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {result.valid ? (
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          ) : (
            <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          )}
          <p className="font-bold">{result.valid ? 'Constancia vigente' : 'Folio no válido o revocado'}</p>
          {result.display_name && <p className="text-sm mt-2">{result.display_name}</p>}
          {result.course_title && <p className="text-sm mt-1 font-medium">{result.course_title}</p>}
          {result.issued_at && (
            <p className="text-xs text-slate-500 mt-1">{new Date(result.issued_at).toLocaleDateString()}</p>
          )}
          <p className="text-xs text-slate-400 mt-4">Folio: {folio}</p>
        </div>
      )}
    </main>
  );
}
