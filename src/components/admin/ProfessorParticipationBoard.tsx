import { useMemo, useState, type ReactNode } from 'react';
import { BookOpen, Clapperboard, ListChecks, Search } from 'lucide-react';
import type { PhysicianParticipationSummary } from '../../services/participationAuditService';
import { formatClassDuration } from '../../services/participationActivity';

type ActivityFilter = 'all' | 'active' | 'idle';

function formatCurrency(mxn: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(mxn || 0);
}

function formatCount(value: number): string {
  return value.toLocaleString('es-MX');
}

function hasMeasuredActivity(person: PhysicianParticipationSummary): boolean {
  const activity = person.activity;
  return (
    activity.activityPayoutMxn > 0 ||
    activity.classVideoCount > 0 ||
    activity.topicsModified > 0 ||
    activity.lettersChanged > 0 ||
    person.rawSurvivingWords > 0 ||
    activity.quizzesAdded + activity.quizzesModified > 0 ||
    activity.questionsAdded + activity.questionsModified > 0 ||
    activity.casesAdded > 0 ||
    activity.figuresAdded > 0 ||
    activity.pdfsAdded > 0 ||
    activity.tracesAdded > 0 ||
    activity.configClosed > 0 ||
    activity.examQuestions > 0
  );
}

function staffLabel(roles: string[]): string | null {
  const teaches = roles.includes('contributor');
  const edits = roles.includes('editor');
  if (teaches && edits) return 'Profesor y editor';
  if (teaches) return 'Profesor';
  if (edits) return 'Editor';
  return null;
}

export function ProfessorParticipationBoard({
  physicians,
  pools,
}: {
  physicians: PhysicianParticipationSummary[];
  pools: { docenciaPoolMxn: number; obraPoolMxn: number; editorialPoolMxn: number };
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const totals = useMemo(() => {
    return physicians.reduce(
      (acc, person) => {
        acc.classSeconds += person.activity.classVideoSeconds;
        acc.words += person.rawSurvivingWords;
        acc.topics += person.activity.topicsModified;
        acc.letters += person.activity.lettersChanged;
        acc.paragraphs += person.activity.paragraphsChanged;
        acc.quizzes += person.activity.quizzesAdded + person.activity.quizzesModified;
        acc.payout += person.activity.activityPayoutMxn;
        acc.liquidable += person.totalPayoutMxn;
        return acc;
      },
      {
        classSeconds: 0,
        words: 0,
        topics: 0,
        letters: 0,
        paragraphs: 0,
        quizzes: 0,
        payout: 0,
        liquidable: 0,
      },
    );
  }, [physicians]);

  const poolTotal = pools.docenciaPoolMxn + pools.obraPoolMxn + pools.editorialPoolMxn;
  const retained = Math.max(0, Number((poolTotal - totals.payout).toFixed(2)));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return physicians.filter((person) => {
      const active = hasMeasuredActivity(person);
      if (filter === 'active' && !active) return false;
      if (filter === 'idle' && active) return false;
      if (!q) return true;
      return (
        person.displayName.toLowerCase().includes(q) ||
        (person.credentials ?? '').toLowerCase().includes(q) ||
        person.markedRole.includes(q)
      );
    });
  }, [physicians, query, filter]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile label="Profesores y editores" value={String(physicians.length)} detail="Con o sin actividad en esta edición" />
        <SummaryTile
          label="Tiempo de clase"
          value={formatClassDuration(totals.classSeconds)}
          detail="Videos de clase y sesiones impartidas"
        />
        <SummaryTile
          label="Texto y quizzes"
          value={`${formatCount(totals.words)} palabras`}
          detail={`${formatCount(totals.topics)} temas tocados · ${formatCount(totals.quizzes)} quizzes`}
        />
        <SummaryTile
          label="Reparto"
          value={poolTotal > 0 ? formatCurrency(totals.payout) : 'Porcentajes'}
          detail={
            poolTotal > 0
              ? retained > 0
                ? `${formatCurrency(retained)} no tiene titular`
                : 'El ingreso escrito ya quedó asignado'
              : 'Sin ingreso cobrado. Solo la parte de cada bolsa'
          }
        />
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Cada porcentaje es la parte de esa bolsa, no un pago. Docencia se mide por minutos de clase. Obra, por palabras
        vivas del texto. Editorial, por reactivos, casos, exámenes, configuración, trazos y figuras. Letras (
        {formatCount(totals.letters)}) y párrafos ({formatCount(totals.paragraphs)}) muestran el tamaño del cambio.
        Los pesos aparecen solo si arriba se escribe un ingreso ya cobrado.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar profesor o editor"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </label>
        {(
          [
            ['all', 'Todos'],
            ['active', 'Con actividad'],
            ['idle', 'Sin actividad'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
              filter === id
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-slate-500 py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          Ningún profesor coincide con ese filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((person) => (
            <ProfessorRow key={person.physicianId} person={person} showMoney={poolTotal > 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-slate-500">{detail}</p>
    </div>
  );
}

function ProfessorRow({
  person,
  showMoney,
}: {
  person: PhysicianParticipationSummary;
  showMoney: boolean;
}) {
  const activity = person.activity;
  const role = staffLabel(activity.staffRoles);
  const annexOpen = person.markedRole !== 'sin_convenio';

  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[200px]">
          <h3 className="font-bold text-slate-900 dark:text-white">{person.displayName}</h3>
          {person.credentials && <p className="text-[11px] text-slate-500">{person.credentials}</p>}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {role && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {role}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                annexOpen
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
              }`}
            >
              {annexOpen ? `Anexo ${person.markedRole}` : 'Sin anexo'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Parte de las bolsas</p>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            Clases {activity.docenciaActivityPct.toFixed(1)}% · Temas {activity.obraActivityPct.toFixed(1)}% · Labor{' '}
            {activity.editorialActivityPct.toFixed(1)}%
          </p>
          {showMoney && (
            <p className="text-[11px] text-slate-500">
              Sobre el ingreso escrito: {formatCurrency(activity.activityPayoutMxn)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Metric
          icon={<Clapperboard className="w-3.5 h-3.5" />}
          title="Clases"
          amount={showMoney ? formatCurrency(activity.docenciaActivityMxn) : ''}
          share={activity.docenciaActivityPct}
          lines={[
            `${activity.classVideoCount} clase${activity.classVideoCount === 1 ? '' : 's'} · ${formatClassDuration(activity.classVideoSeconds)}`,
            `Sesiones selladas: ${person.validatedSessions.toFixed(1)} de ${person.rawCompletedSessions.toFixed(1)}`,
          ]}
        />
        <Metric
          icon={<BookOpen className="w-3.5 h-3.5" />}
          title="Temas"
          amount={showMoney ? formatCurrency(activity.obraActivityMxn) : ''}
          share={activity.obraActivityPct}
          lines={[
            `${formatCount(person.rawSurvivingWords)} palabras vivas · ${person.principalAuthorTopics.length} como autor principal`,
            `${activity.topicsModified} temas tocados · ${formatCount(activity.lettersChanged)} letras · ${formatCount(activity.wordsChanged)} palabras nuevas · ${formatCount(activity.paragraphsChanged)} párrafos`,
          ]}
        />
        <Metric
          icon={<ListChecks className="w-3.5 h-3.5" />}
          title="Quizzes y labor"
          amount={showMoney ? formatCurrency(activity.editorialActivityMxn) : ''}
          share={activity.editorialActivityPct}
          lines={[
            `Quizzes +${activity.quizzesAdded} / editados ${activity.quizzesModified}`,
            `Reactivos +${activity.questionsAdded} / editados ${activity.questionsModified} · exámenes ${activity.examQuestions}`,
            `Casos ${activity.casesAdded} · figuras ${activity.figuresAdded} · PDF ${activity.pdfsAdded} · trazos ${activity.tracesAdded} · config ${activity.configClosed} · ${activity.activityEditorialUnits.toFixed(1)} u.`,
          ]}
        />
      </div>

      {person.markedRole === 'sin_convenio' &&
        (activity.docenciaActivityPct > 0 || activity.obraActivityPct > 0 || activity.editorialActivityPct > 0) && (
        <p className="mt-3 text-[11px] text-amber-800 dark:text-amber-200">
          Esa parte queda registrada. Se vuelve pagable cuando haya ingreso cobrado y firme el anexo de la bolsa.
        </p>
      )}
    </article>
  );
}

function Metric({
  icon,
  title,
  amount,
  share,
  lines,
}: {
  icon: ReactNode;
  title: string;
  amount: string;
  share: number;
  lines: string[];
}) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
      <div className="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold">
          {icon}
          {title}
        </span>
        <span className="text-xs font-bold">
          {share.toFixed(1)}%
          {amount && <span className="ml-1 font-semibold text-slate-500">{amount}</span>}
        </span>
      </div>
      {lines.map((line) => (
        <p key={line} className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  );
}
