import { BRAND } from '../../config/brand';
import { getReferencesForTopic, type Reference } from '../../content/topicReferences';
import { stripLegacyPdfMarkdown, topicPdfList } from '../../utils/topicPrintables';
import { localizedTopic } from '../../hooks/useLocalizedContent';
import type { Module, Topic } from '../../types/content';
import {
  contributorsForModule,
  contributorsForTopics,
  formatContributorLabel,
  formatEditedDate,
  type TextbookContributor,
} from './textbookCredits';
import {
  isTopicIncluded,
  resolveCreditOptions,
  resolveTopicInclusion,
  type TextbookCreditOptions,
  type TopicPrintOverride,
} from './textbookOptions';

export type TextbookLang = 'es' | 'en';

export interface TextbookInclusion {
  description: boolean;
  body: boolean;
  pearls: boolean;
  keyPoints: boolean;
  images: boolean;
  bibliography: boolean;
  teachingPdfs: boolean;
}

export interface TextbookCover {
  title: string;
  subtitle: string;
  authors: string;
  institution: string;
}

export interface TextbookImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface TextbookPdfCite {
  title: string;
  url: string;
  author?: string;
  description?: string;
}

export interface TextbookLesson {
  id: string;
  path: string[];
  firstLevelId: string;
  depth: number;
  title: string;
  description?: string;
  content?: string;
  clinicalPearls: string[];
  keyPoints: string[];
  images: TextbookImage[];
  teachingPdfs: TextbookPdfCite[];
  usedSpanishFallback: boolean;
  hiddenFromStudents: boolean;
  isContainer: boolean;
  sectionBibliography: Reference[];
  contributors: TextbookContributor[];
  editedAtLabel?: string;
}

export interface TextbookChapter {
  id: string;
  number: number;
  title: string;
  description?: string;
  lessons: TextbookLesson[];
  references: Reference[];
  contributors: TextbookContributor[];
}

export interface TextbookStats {
  modules: number;
  lessons: number;
  images: number;
  references: number;
  missingTranslations: number;
  hiddenLessons: number;
}

export interface TextbookModel {
  cover: TextbookCover;
  authors: string[];
  editorialAuthors: TextbookContributor[];
  generatedAt: string;
  generatedAtLabel: string;
  lang: TextbookLang;
  includeHidden: boolean;
  skipEmptyContainers: boolean;
  inclusion: TextbookInclusion;
  creditOptions: TextbookCreditOptions;
  chapters: TextbookChapter[];
  appendix: Reference[];
  stats: TextbookStats;
}

export interface BuildTextbookOptions {
  modules: Module[];
  selectedModuleIds?: string[];
  lang?: TextbookLang;
  inclusion?: Partial<TextbookInclusion>;
  cover?: Partial<TextbookCover>;
  includeHidden?: boolean;
  skipEmptyContainers?: boolean;
  hiddenTopicIds?: Iterable<string>;
  generatedAt?: Date;
  contributors?: TextbookContributor[];
  creditOptions?: Partial<TextbookCreditOptions>;
  topicOverrides?: Record<string, TopicPrintOverride>;
  topicEditedAt?: Record<string, string>;
}

export const DEFAULT_TEXTBOOK_INCLUSION: TextbookInclusion = {
  description: true,
  body: true,
  pearls: true,
  keyPoints: true,
  images: true,
  bibliography: true,
  teachingPdfs: true,
};

export function defaultTextbookCover(): TextbookCover {
  return {
    title: BRAND.academicTitle,
    subtitle: BRAND.tagline,
    authors: '',
    institution: BRAND.enableAccreditation ? BRAND.accreditationFull : BRAND.accreditationPendingFull,
  };
}

export function parseTextbookAuthors(raw: string): string[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function referenceKey(ref: Reference): string {
  return [ref.authors, ref.title, String(ref.year)]
    .map((part) => part.trim().toLowerCase())
    .join('|');
}

export function dedupeReferences(refs: Reference[]): Reference[] {
  const seen = new Set<string>();
  const out: Reference[] = [];
  for (const ref of refs) {
    const key = referenceKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

export function formatReference(ref: Reference): string {
  const year = String(ref.year);
  const base = `${ref.authors}. ${ref.title}. ${ref.journal}. ${year}.`;
  return ref.url ? `${base} ${ref.url}` : base;
}

export function countTopicNodes(topics: Topic[]): number {
  let count = 0;
  for (const topic of topics) {
    count += 1;
    if (topic.children?.length) count += countTopicNodes(topic.children);
  }
  return count;
}

export function collectTextbookImageSrcs(model: TextbookModel): string[] {
  const srcs: string[] = [];
  const seen = new Set<string>();
  for (const chapter of model.chapters) {
    for (const lesson of chapter.lessons) {
      for (const image of lesson.images) {
        if (!image.src || seen.has(image.src)) continue;
        seen.add(image.src);
        srcs.push(image.src);
      }
    }
  }
  return srcs;
}

export function formatTextbookTimestamp(date: Date, lang: TextbookLang): string {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function resolveInclusion(partial?: Partial<TextbookInclusion>): TextbookInclusion {
  return { ...DEFAULT_TEXTBOOK_INCLUSION, ...partial };
}

function resolveCover(partial?: Partial<TextbookCover>): TextbookCover {
  return { ...defaultTextbookCover(), ...partial };
}

function topicUsedSpanishFallback(topic: Topic, lang: TextbookLang, inclusion: TextbookInclusion): boolean {
  if (lang !== 'en') return false;
  if (!topic.titleEn) return true;
  if (inclusion.description && topic.description && !topic.descriptionEn) return true;
  if (inclusion.body && topic.content && !topic.contentEn) return true;
  if (inclusion.pearls && (topic.clinicalPearls?.length ?? 0) > 0 && !(topic.clinicalPearlsEn?.length)) return true;
  if (inclusion.keyPoints && (topic.keyPoints?.length ?? 0) > 0 && !(topic.keyPointsEn?.length)) return true;
  return false;
}

function hasLessonBody(
  topic: Topic,
  localized: ReturnType<typeof localizedTopic>,
  inclusion: TextbookInclusion
): boolean {
  const content = inclusion.body ? stripLegacyPdfMarkdown(localized.content) : '';
  if (content) return true;
  if (inclusion.pearls && (localized.clinicalPearls?.length ?? 0) > 0) return true;
  if (inclusion.keyPoints && (localized.keyPoints?.length ?? 0) > 0) return true;
  if (inclusion.images && (topic.imageUrls?.length ?? 0) > 0) return true;
  if (inclusion.teachingPdfs && topicPdfList(topic).length > 0) return true;
  return false;
}

interface CollectContext {
  lang: TextbookLang;
  globalInclusion: TextbookInclusion;
  skipEmptyContainers: boolean;
  hiddenTopicIds: Set<string>;
  overrides: Record<string, TopicPrintOverride>;
  contributors: TextbookContributor[];
  creditOptions: TextbookCreditOptions;
  topicEditedAt: Record<string, string>;
}

function relabelContributors(people: TextbookContributor[], showCredentials: boolean): TextbookContributor[] {
  return people.map((person) => ({
    ...person,
    label: formatContributorLabel(person.name, person.credentials, showCredentials),
  }));
}

function toLesson(
  topic: Topic,
  path: string[],
  firstLevelId: string,
  depth: number,
  ctx: CollectContext,
  inclusion: ReturnType<typeof resolveTopicInclusion>
): TextbookLesson {
  const localized = localizedTopic(topic, ctx.lang);
  const content = inclusion.body ? stripLegacyPdfMarkdown(localized.content) : '';
  const lessonCredits = ctx.creditOptions.showLessonCredits && inclusion.authors
    ? contributorsForTopics(ctx.contributors, [topic.id], ctx.creditOptions.disabledAuthorIds)
    : [];
  const editedAtLabel = ctx.creditOptions.showEditedDates && inclusion.editedDate
    ? formatEditedDate(ctx.topicEditedAt[topic.id], ctx.lang)
    : undefined;
  return {
    id: topic.id,
    path,
    firstLevelId,
    depth,
    title: localized.title,
    description: inclusion.description ? localized.description : undefined,
    content: content || undefined,
    clinicalPearls: inclusion.pearls ? (localized.clinicalPearls ?? []) : [],
    keyPoints: inclusion.keyPoints ? (localized.keyPoints ?? []) : [],
    images: inclusion.images
      ? (topic.imageUrls ?? []).map((image) => ({
          src: image.src,
          alt: image.alt,
          caption: image.caption,
        }))
      : [],
    teachingPdfs: inclusion.teachingPdfs
      ? topicPdfList(topic).map((pdf) => ({
          title: pdf.title,
          url: pdf.url,
          author: pdf.author,
          description: pdf.description,
        }))
      : [],
    usedSpanishFallback: topicUsedSpanishFallback(topic, ctx.lang, inclusion),
    hiddenFromStudents: ctx.hiddenTopicIds.has(topic.id),
    isContainer: Boolean(topic.children?.length),
    sectionBibliography: [],
    contributors: lessonCredits,
    editedAtLabel,
  };
}

function collectLessons(
  topics: Topic[],
  parentPath: string[],
  firstLevelId: string | null,
  depth: number,
  ctx: CollectContext,
  out: TextbookLesson[]
) {
  for (const topic of topics) {
    const path = [...parentPath, topic.id];
    if (!isTopicIncluded(topic.id, path, ctx.overrides)) continue;

    const sectionId = firstLevelId ?? topic.id;
    const localized = localizedTopic(topic, ctx.lang);
    const inclusion = resolveTopicInclusion(ctx.globalInclusion, ctx.overrides[topic.id]);
    const printable = hasLessonBody(topic, localized, inclusion);
    const isContainer = Boolean(topic.children?.length);
    const skipSelf = ctx.skipEmptyContainers && isContainer && !printable;

    if (!skipSelf) {
      out.push(toLesson(topic, path, sectionId, depth, ctx, inclusion));
    }

    if (topic.children?.length) {
      collectLessons(topic.children, path, sectionId, skipSelf ? depth : depth + 1, ctx, out);
    }
  }
}

function attachSectionBibliography(
  moduleId: string,
  rootTopics: Topic[],
  lessons: TextbookLesson[],
  ctx: CollectContext
) {
  if (!ctx.globalInclusion.bibliography) return;
  for (const root of rootTopics) {
    const refs = getReferencesForTopic(moduleId, root.id);
    if (!refs.length) continue;
    for (let i = lessons.length - 1; i >= 0; i -= 1) {
      if (lessons[i].firstLevelId !== root.id) continue;
      const inclusion = resolveTopicInclusion(ctx.globalInclusion, ctx.overrides[lessons[i].id]);
      if (inclusion.bibliography) {
        lessons[i] = { ...lessons[i], sectionBibliography: refs };
      }
      break;
    }
  }
}

export function buildTextbookModel(options: BuildTextbookOptions): TextbookModel {
  const lang = options.lang ?? 'es';
  const inclusion = resolveInclusion(options.inclusion);
  const cover = resolveCover(options.cover);
  const generatedAt = options.generatedAt ?? new Date();
  const hiddenTopicIds = new Set(options.hiddenTopicIds ?? []);
  const skipEmptyContainers = Boolean(options.skipEmptyContainers);
  const creditOptions = resolveCreditOptions(options.creditOptions);
  const contributors = relabelContributors(options.contributors ?? [], creditOptions.showCredentials);
  const selected = options.selectedModuleIds?.length
    ? new Set(options.selectedModuleIds)
    : null;
  const ctx: CollectContext = {
    lang,
    globalInclusion: inclusion,
    skipEmptyContainers,
    hiddenTopicIds,
    overrides: options.topicOverrides ?? {},
    contributors,
    creditOptions,
    topicEditedAt: options.topicEditedAt ?? {},
  };

  const chapters: TextbookChapter[] = [];

  for (const mod of options.modules) {
    if (selected && !selected.has(mod.id)) continue;

    const lessons: TextbookLesson[] = [];
    collectLessons(mod.topics, [], null, 0, ctx, lessons);
    attachSectionBibliography(mod.id, mod.topics, lessons, ctx);

    const chapterTitle = lang === 'en' && mod.titleEn ? mod.titleEn : mod.title;
    const chapterDescription = lang === 'en' && mod.descriptionEn ? mod.descriptionEn : mod.description;
    const chapterRefs = inclusion.bibliography
      ? dedupeReferences(lessons.flatMap((lesson) => lesson.sectionBibliography))
      : [];
    const chapterCredits = creditOptions.showChapterCredits
      ? contributorsForModule(contributors, mod.id, creditOptions.disabledAuthorIds)
      : [];

    chapters.push({
      id: mod.id,
      number: mod.number,
      title: chapterTitle,
      description: inclusion.description ? chapterDescription : undefined,
      lessons,
      references: chapterRefs,
      contributors: chapterCredits,
    });
  }

  const appendix = inclusion.bibliography
    ? dedupeReferences(chapters.flatMap((chapter) => chapter.references))
    : [];

  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const stats: TextbookStats = {
    modules: chapters.length,
    lessons: lessons.length,
    images: lessons.reduce((sum, lesson) => sum + lesson.images.length, 0),
    references: appendix.length,
    missingTranslations: lessons.filter((lesson) => lesson.usedSpanishFallback).length,
    hiddenLessons: lessons.filter((lesson) => lesson.hiddenFromStudents).length,
  };

  const editorialAuthors = creditOptions.showCoverCredits
    ? contributors.filter(
        (person) =>
          !creditOptions.disabledAuthorIds.includes(person.id) &&
          chapters.some((chapter) => person.moduleIds.includes(chapter.id))
      )
    : [];

  return {
    cover,
    authors: parseTextbookAuthors(cover.authors),
    editorialAuthors,
    generatedAt: generatedAt.toISOString(),
    generatedAtLabel: formatTextbookTimestamp(generatedAt, lang),
    lang,
    includeHidden: Boolean(options.includeHidden),
    skipEmptyContainers,
    inclusion,
    creditOptions,
    chapters,
    appendix,
    stats,
  };
}
