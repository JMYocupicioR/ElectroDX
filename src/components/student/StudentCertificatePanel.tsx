import { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import { BRAND } from '../../config/brand';
import {
  downloadCertificateDocument,
  getMyCertificates,
  issueMyCertificate,
  type AcademicCertificate,
} from '../../services/studentToolsService';
import { useAuth } from '../../contexts/AuthProvider';
import { checkCourseCertificationEligibility, type CertificationRequirements } from '../../services/studentService';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import { SELLABLE_COURSE_IDS, moduleIdsForCourse } from '../../content/courseCatalog';
import type { ModuleQuizProgress } from '../../types/quiz';
import type { CourseId } from '../../types/database';

export function StudentCertificatePanel({
  requirements,
  moduleProgress,
  completedTopics,
}: {
  requirements: CertificationRequirements | null;
  moduleProgress: ModuleQuizProgress[];
  completedTopics: Set<string>;
}) {
  const { profile, hasCourseAccess } = useAuth();
  const { assignments, courses } = useSyllabusCatalog();
  const [certs, setCerts] = useState<AcademicCertificate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void getMyCertificates().then(setCerts).catch(() => setCerts([]));
  }, []);

  const perCourse = useMemo(() => {
    return SELLABLE_COURSE_IDS.map((courseId) => {
      const ids = moduleIdsForCourse(assignments, courseId);
      const req = checkCourseCertificationEligibility(profile, completedTopics, moduleProgress, ids);
      const course = courses.find((c) => c.id === courseId);
      const cert = certs.find((c) => c.course_id === courseId) ?? null;
      return { courseId, title: course?.title ?? courseId, req, cert, unlocked: hasCourseAccess(courseId) };
    });
  }, [assignments, courses, profile, completedTopics, moduleProgress, certs, hasCourseAccess]);

  return (
    <div className="space-y-6">
      {!BRAND.enableAccreditation && (
        <p className="text-sm text-slate-500">
          La constancia se emite como documento académico interno. El aval de acreditación permanece desactivado hasta que se habilite en la configuración institucional.
        </p>
      )}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      {perCourse.map((item) => (
        <CourseCertCard
          key={item.courseId}
          title={item.title}
          courseId={item.courseId}
          requirements={item.req}
          cert={item.cert}
          unlocked={item.unlocked}
          displayName={profile?.display_name ?? 'Médico'}
          busy={busy === item.courseId}
          onIssue={async () => {
            setBusy(item.courseId);
            setError(null);
            try {
              const issued = await issueMyCertificate(item.courseId);
              setCerts((prev) => [issued, ...prev.filter((c) => c.course_id !== item.courseId)]);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'No se pudo emitir la constancia');
            } finally {
              setBusy(null);
            }
          }}
          onError={setError}
        />
      ))}

      {requirements && (
        <p className="text-xs text-slate-400">
          La constancia histórica del programa completo sigue disponible si ya se emitió antes de la separación por cursos.
        </p>
      )}
    </div>
  );
}

function CourseCertCard({
  title,
  courseId,
  requirements,
  cert,
  unlocked,
  displayName,
  busy,
  onIssue,
  onError,
}: {
  title: string;
  courseId: CourseId;
  requirements: CertificationRequirements;
  cert: AcademicCertificate | null;
  unlocked: boolean;
  displayName: string;
  busy: boolean;
  onIssue: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      {!unlocked && <p className="text-sm text-amber-700">Necesitas acceso a este curso para emitir la constancia.</p>}
      <ul className="text-sm space-y-1">
        <li>Cédula verificada: {requirements.cedulaVerified ? 'sí' : 'no'}</li>
        <li>Avance curricular: {requirements.modulesCompletedPct}%</li>
        <li>Evaluaciones aprobadas: {requirements.quizzesPassedCount}/{requirements.totalQuizzesAvailable}</li>
        <li>Promedio: {requirements.averageScore}%</li>
      </ul>
      {cert && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm">
          Folio <strong>{cert.folio}</strong> — código {cert.verification_code}
          <div className="mt-2 flex flex-wrap gap-3">
            <a className="underline min-h-[44px] inline-flex items-center" href={`/verificar/${cert.folio}`}>
              Página pública de verificación
            </a>
            <button
              type="button"
              className="underline min-h-[44px]"
              onClick={() =>
                void downloadCertificateDocument(cert, displayName).catch((e) =>
                  onError(e instanceof Error ? e.message : 'No se pudo descargar la constancia')
                )
              }
            >
              Descargar constancia
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        disabled={busy || !unlocked || !requirements.isEligible}
        className="min-h-[44px] px-4 rounded-xl bg-blue-600 disabled:bg-slate-400 text-white font-semibold inline-flex items-center gap-2"
        onClick={() => void onIssue()}
      >
        <Award className="w-4 h-4" /> Emitir constancia de {courseId}
      </button>
    </div>
  );
}
