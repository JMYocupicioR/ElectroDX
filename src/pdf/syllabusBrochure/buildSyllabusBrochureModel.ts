import { BRAND } from '../../config/brand';
import { allModules } from '../../content/modules';
import type { GroupedSyllabusCourse } from '../../content/courseCatalog';
import type { AcademicMilestone } from '../../types/academicGradebook';
import type { Module, Topic } from '../../types/content';
import { BROCHURE_BENEFITS, BROCHURE_PILLARS, BROCHURE_STEPS } from './brochureCopy';
import { COURSE_ACCENT, moduleGradient } from './theme';

export interface BrochureTopicNode {
  code: string;
  title: string;
  description?: string;
  children: BrochureTopicNode[];
}

export interface BrochureModule {
  id: string;
  number: number;
  numberLabel: string;
  title: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  topicCount: number;
  topics: BrochureTopicNode[];
}

export interface BrochureCourse {
  id: string;
  title: string;
  description: string;
  accent: string;
  moduleCount: number;
  topicCount: number;
  modules: BrochureModule[];
}

export interface BrochureCorteTopic {
  title: string;
  moduleTitle: string;
}

export interface BrochureCorte {
  id: string;
  periodLabel: string;
  title: string;
  description: string;
  startLabel: string;
  dueLabel: string;
  startKey: string;
  dueKey: string;
  topicCount: number;
  passingGrade: number;
  topics: BrochureCorteTopic[];
}

export interface BrochureBrandSnapshot {
  name: string;
  shortName: string;
  wordmarkPrefix: string;
  wordmarkAccent: string;
  badge: string;
  academicTitle: string;
  tagline: string;
  accreditationLine: string;
}

export interface SyllabusBrochureModel {
  generatedAt: string;
  siteUrl: string;
  registerUrl: string;
  temarioUrl: string;
  qrDataUrl?: string;
  brand: BrochureBrandSnapshot;
  stats: {
    modules: number;
    topics: number;
    courses: number;
  };
  courses: BrochureCourse[];
  complementary: BrochureModule[];
  cortes: BrochureCorte[];
  corteRangeLabel?: string;
  pillars: typeof BROCHURE_PILLARS;
  benefits: typeof BROCHURE_BENEFITS;
  steps: typeof BROCHURE_STEPS;
}

export function countTopicNodes(topics: Topic[]): number {
  let count = 0;
  for (const topic of topics) {
    count += 1;
    if (topic.children?.length) count += countTopicNodes(topic.children);
  }
  return count;
}

function mapTopics(topics: Topic[], prefix: string): BrochureTopicNode[] {
  return topics.map((topic, index) => {
    const code = prefix ? `${prefix}.${index + 1}` : String(index + 1);
    const description = topic.description?.trim();
    return {
      code,
      title: topic.title,
      ...(description ? { description } : {}),
      children: topic.children?.length ? mapTopics(topic.children, code) : [],
    };
  });
}

export function toBrochureModule(mod: Module): BrochureModule {
  const [colorFrom, colorTo] = moduleGradient(mod.color);
  return {
    id: mod.id,
    number: mod.number,
    numberLabel: String(mod.number).padStart(2, '0'),
    title: mod.title,
    description: mod.description,
    colorFrom,
    colorTo,
    topicCount: countTopicNodes(mod.topics),
    topics: mapTopics(mod.topics, String(mod.number)),
  };
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function isoDateKey(iso: string | undefined | null): string {
  const key = (iso ?? '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : '';
}

/** Calendar day as written by admins (YYYY-MM-DD), without timezone shift. */
export function formatBrochureDate(iso: string): string {
  const key = isoDateKey(iso);
  if (!key) return 'Fecha por confirmar';
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function buildTopicTitleIndex(modules: Module[]): Map<string, BrochureCorteTopic> {
  const map = new Map<string, BrochureCorteTopic>();
  const walk = (topics: Topic[], moduleTitle: string) => {
    for (const topic of topics) {
      map.set(topic.id, { title: topic.title, moduleTitle });
      if (topic.children?.length) walk(topic.children, moduleTitle);
    }
  };
  for (const mod of modules) walk(mod.topics, mod.title);
  return map;
}

export function mapCortesFromMilestones(
  milestones: AcademicMilestone[],
  modules: Module[] = allModules
): BrochureCorte[] {
  const titles = buildTopicTitleIndex(modules);
  return [...milestones]
    .sort((a, b) => a.order_index - b.order_index || a.due_date.localeCompare(b.due_date))
    .map((milestone, index) => {
      const startKey = isoDateKey(milestone.start_date) || isoDateKey(milestone.due_date);
      const dueKey = isoDateKey(milestone.due_date) || startKey;
      const topicIds = milestone.target_topic_ids ?? [];
      return {
        id: milestone.id,
        periodLabel: `Periodo ${index + 1}`,
        title: milestone.title,
        description: milestone.description,
        startLabel: formatBrochureDate(startKey),
        dueLabel: formatBrochureDate(dueKey),
        startKey,
        dueKey,
        topicCount: topicIds.length,
        passingGrade: milestone.passing_grade,
        topics: topicIds.map((id) => titles.get(id) ?? { title: `Tema ${id}`, moduleTitle: 'Temario' }),
      };
    });
}

export function buildSyllabusBrochureModel(input: {
  grouped: GroupedSyllabusCourse[];
  unassigned: Module[];
  siteUrl: string;
  qrDataUrl?: string;
  milestones?: AcademicMilestone[];
}): SyllabusBrochureModel {
  const siteUrl = stripTrailingSlash(input.siteUrl);
  const courses = input.grouped
    .filter((group) => group.modules.length > 0)
    .map((group) => {
      const modules = group.modules.map(toBrochureModule);
      return {
        id: group.course.id,
        title: group.course.title,
        description: group.course.description,
        accent: COURSE_ACCENT[group.course.id] ?? COURSE_ACCENT.principiante,
        moduleCount: modules.length,
        topicCount: modules.reduce((sum, mod) => sum + mod.topicCount, 0),
        modules,
      };
    });

  const complementary = input.unassigned.map(toBrochureModule);
  const moduleTotal = courses.reduce((sum, course) => sum + course.moduleCount, 0) + complementary.length;
  const topicTotal = courses.reduce((sum, course) => sum + course.topicCount, 0)
    + complementary.reduce((sum, mod) => sum + mod.topicCount, 0);
  const cortes = mapCortesFromMilestones(input.milestones ?? []);
  const corteRangeLabel = cortes.length
    ? `${cortes[0].startLabel} — ${cortes[cortes.length - 1].dueLabel}`
    : undefined;

  return {
    generatedAt: new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
    }).format(new Date()),
    siteUrl,
    registerUrl: `${siteUrl}/auth/registro`,
    temarioUrl: `${siteUrl}/temario`,
    qrDataUrl: input.qrDataUrl,
    brand: {
      name: BRAND.name,
      shortName: BRAND.shortName,
      wordmarkPrefix: BRAND.wordmarkPrefix,
      wordmarkAccent: BRAND.wordmarkAccent,
      badge: BRAND.badge,
      academicTitle: BRAND.academicTitle,
      tagline: BRAND.tagline,
      accreditationLine: BRAND.enableAccreditation
        ? BRAND.accreditationFull
        : BRAND.accreditationPendingFull,
    },
    stats: {
      modules: moduleTotal,
      topics: topicTotal,
      courses: courses.length,
    },
    courses,
    complementary,
    cortes,
    corteRangeLabel,
    pillars: BROCHURE_PILLARS,
    benefits: BROCHURE_BENEFITS,
    steps: BROCHURE_STEPS,
  };
}
