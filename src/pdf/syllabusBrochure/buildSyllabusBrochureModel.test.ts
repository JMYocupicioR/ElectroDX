import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COURSE_MODULES,
  DEFAULT_COURSES,
  groupModulesByCourse,
} from '../../content/courseCatalog';
import { allModules } from '../../content/modules';
import type { Module } from '../../types/content';
import {
  buildSyllabusBrochureModel,
  countTopicNodes,
  formatBrochureDate,
  toBrochureModule,
} from './buildSyllabusBrochureModel';
import { DEFAULT_ACADEMIC_MILESTONES } from '../../services/academicScheduleService';

const sample: Module = {
  id: 'fundamentals',
  number: 1,
  title: 'Fundamentos',
  titleEn: 'Fundamentals',
  emoji: '📘',
  description: 'Bases',
  descriptionEn: 'Bases',
  color: 'from-blue-500 to-blue-700',
  icon: 'BookOpen',
  topics: [
    {
      id: 'intro',
      title: 'Introducción',
      description: 'Historia y rol clínico',
      content: 'NO DEBE SALIR EN EL PDF',
      clinicalPearls: ['secreto'],
      keyPoints: ['secreto'],
      children: [
        { id: 'history', title: 'Historia', content: 'TAMPOCO ESTO' },
        { id: 'role', title: 'Rol clínico' },
      ],
    },
  ],
};

function collectKeys(topics: ReturnType<typeof toBrochureModule>['topics'], acc: Set<string>) {
  for (const node of topics) {
    Object.keys(node).forEach((key) => acc.add(key));
    collectKeys(node.children, acc);
  }
}

describe('buildSyllabusBrochureModel', () => {
  it('counts nested topic nodes the same way as the public temario', () => {
    expect(countTopicNodes(sample.topics)).toBe(3);
  });

  it('maps titles and descriptions without lesson bodies', () => {
    const mapped = toBrochureModule(sample);
    expect(mapped.numberLabel).toBe('01');
    expect(mapped.colorFrom).toBe('#3b82f6');
    expect(mapped.topics[0].code).toBe('1.1');
    expect(mapped.topics[0].children.map((c) => c.code)).toEqual(['1.1.1', '1.1.2']);
    const keys = new Set<string>();
    collectKeys(mapped.topics, keys);
    expect([...keys].sort()).toEqual(['children', 'code', 'description', 'title']);
    const serialized = JSON.stringify(mapped);
    expect(serialized).not.toContain('NO DEBE SALIR');
    expect(serialized).not.toContain('clinicalPearls');
    expect(serialized).not.toContain('TAMPOCO ESTO');
  });

  it('builds the live static catalog with all modules and no leaked lesson content', () => {
    const { grouped, unassigned } = groupModulesByCourse(allModules, DEFAULT_COURSES, DEFAULT_COURSE_MODULES);
    const model = buildSyllabusBrochureModel({
      grouped,
      unassigned,
      siteUrl: 'https://electro-dx.vercel.app/',
    });
    expect(model.stats.modules).toBe(allModules.length);
    expect(model.stats.topics).toBeGreaterThan(400);
    expect(model.stats.courses).toBeGreaterThanOrEqual(3);
    expect(model.registerUrl).toBe('https://electro-dx.vercel.app/auth/registro');
    expect(model.courses.some((c) => c.id === 'principiante')).toBe(true);
    expect(model.complementary.length + model.courses.reduce((n, c) => n + c.moduleCount, 0)).toBe(allModules.length);

    const payload = JSON.stringify(model);
    expect(payload).not.toMatch(/"clinicalPearls"/);
    expect(payload.length).toBeLessThan(350_000);

    const expectedTopics = [...grouped.flatMap((g) => g.modules), ...unassigned].reduce(
      (sum, mod) => sum + countTopicNodes(mod.topics),
      0
    );
    expect(model.stats.topics).toBe(expectedTopics);
  });

  it('formats admin corte dates from the calendar day, not the timezone', () => {
    expect(formatBrochureDate('2026-09-15T23:59:59Z')).toBe('15 de septiembre de 2026');
    expect(formatBrochureDate('2026-08-01T00:00:00Z')).toBe('1 de agosto de 2026');
    expect(formatBrochureDate('')).toBe('Fecha por confirmar');
  });

  it('includes administrator cortes with start, due date and required topics', () => {
    const { grouped, unassigned } = groupModulesByCourse(allModules, DEFAULT_COURSES, DEFAULT_COURSE_MODULES);
    const model = buildSyllabusBrochureModel({
      grouped,
      unassigned,
      siteUrl: 'https://electro-dx.vercel.app',
      milestones: DEFAULT_ACADEMIC_MILESTONES,
    });
    expect(model.cortes).toHaveLength(DEFAULT_ACADEMIC_MILESTONES.length);
    expect(model.cortes[0].startKey).toBe('2026-08-01');
    expect(model.cortes[0].dueKey).toBe('2026-09-15');
    expect(model.cortes[0].startLabel).toBe('1 de agosto de 2026');
    expect(model.cortes[0].dueLabel).toBe('15 de septiembre de 2026');
    expect(model.cortes[0].topicCount).toBeGreaterThan(0);
    expect(model.cortes[0].topics[0].title).not.toMatch(/^Tema /);
    expect(model.corteRangeLabel).toContain('agosto');
    expect(model.corteRangeLabel).toContain('diciembre');
    expect(JSON.stringify(model.cortes)).not.toMatch(/"content":/);
  });
});
