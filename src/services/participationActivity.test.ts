import { describe, expect, it } from 'vitest';
import {
  applyActivitySplit,
  charEdits,
  creditClassSessions,
  creditLessonVideos,
  creditQuizActivity,
  editorialActivityUnits,
  emptyActivity,
  measureProseEdit,
} from './participationActivity';

describe('measureProseEdit', () => {
  it('ignores identical prose', () => {
    expect(measureProseEdit('Un párrafo.\n\nOtro.', 'Un párrafo.\n\nOtro.')).toEqual({
      lettersChanged: 0,
      paragraphsChanged: 0,
    });
  });

  it('counts a new paragraph by its letters', () => {
    const size = measureProseEdit('Base clínica.', 'Base clínica.\n\nHallazgo nuevo.');
    expect(size.paragraphsChanged).toBe(1);
    expect(size.lettersChanged).toBe('Hallazgo nuevo.'.length);
  });

  it('counts a one-letter rewrite as that letter, not the whole paragraph', () => {
    const size = measureProseEdit('Latencia distal normal.', 'Latencia distal anormal.');
    expect(size.paragraphsChanged).toBe(1);
    expect(size.lettersChanged).toBe(1);
    expect(charEdits('normal', 'anormal')).toBe(1);
  });
});

describe('class and quiz credits', () => {
  it('credits each instructor with the class video time and ignores a scheduled slot', () => {
    const { byAuthor, recordingKeys } = creditClassSessions([
      {
        id: 'done',
        status: 'completed',
        duration_minutes: 40,
        recording_url: 'https://cdn.example/clase.mp4',
        instructors: [{ id: 'ana' }, { id: 'luis' }],
      },
      {
        id: 'planned',
        status: 'scheduled',
        duration_minutes: 90,
        instructors: [{ id: 'ana' }],
      },
    ]);
    expect(byAuthor.get('ana')).toEqual({ seconds: 2400, count: 1 });
    expect(byAuthor.get('luis')).toEqual({ seconds: 2400, count: 1 });
    expect(recordingKeys.has('https://cdn.example/clase.mp4')).toBe(true);
  });

  it('does not pay a lesson video that is the same class recording', () => {
    const credits = new Map<string, { seconds: number; count: number }>();
    creditLessonVideos(
      [
        {
          key: 'topic:embed',
          blockKey: 'https://cdn.example/clase.mp4',
          seconds: 2400,
          authorIds: ['ana'],
        },
        {
          key: 'topic:extra',
          seconds: 600,
          authorIds: ['ana'],
        },
      ],
      new Set(['https://cdn.example/clase.mp4']),
      credits,
    );
    expect(credits.get('ana')).toEqual({ seconds: 600, count: 1 });
  });

  it('counts an added quiz and a later edit by someone else', () => {
    const credits = creditQuizActivity({
      quizzes: [
        {
          id: 'q1',
          topic_id: 'h-reflex',
          published_by: 'ana',
          last_edited_by: 'luis',
          version: 2,
        },
      ],
      questions: [
        { quiz_id: 'q1', author_id: 'ana', last_edited_by: 'luis', is_system_baseline: false },
        { quiz_id: 'q1', author_id: null, last_edited_by: null, is_system_baseline: true },
      ],
      revisionAuthorsByTopic: new Map(),
    });
    expect(credits.get('ana')).toMatchObject({ quizzesAdded: 1, questionsAdded: 1 });
    expect(credits.get('luis')).toMatchObject({
      quizzesModified: 1,
      questionsModified: 1,
    });
  });
});

describe('pool split', () => {
  it('divides each bag by that activity and leaves an empty bag on the platform', () => {
    const ana = emptyActivity(['contributor']);
    ana.classVideoSeconds = 3600;
    ana.obraWeightWords = 100;
    ana.activityEditorialUnits = editorialActivityUnits({
      questionsAdded: 2,
      questionsModified: 0,
      examQuestions: 0,
      cases: 0,
      configClosed: 0,
      figures: 0,
      pdfs: 0,
      traces: 0,
    });
    const luis = emptyActivity(['editor']);
    luis.obraWeightWords = 300;
    applyActivitySplit([ana, luis], { docencia: 1000, obra: 1000, editorial: 500 });
    expect(ana.docenciaActivityMxn).toBe(1000);
    expect(luis.docenciaActivityMxn).toBe(0);
    expect(ana.obraActivityMxn).toBe(250);
    expect(luis.obraActivityMxn).toBe(750);
    expect(ana.editorialActivityMxn).toBe(500);
    expect(luis.editorialActivityMxn).toBe(0);
    expect(ana.activityPayoutMxn).toBe(1750);
    expect(luis.activityPayoutMxn).toBe(750);
  });
});
