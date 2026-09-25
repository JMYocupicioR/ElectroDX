import type { CSSProperties } from 'react';
import { RichContent } from '../../components/content/RichContent';
import { formatReference, type TextbookChapter, type TextbookLesson, type TextbookModel } from './buildTextbookModel';
import { contributorRoleLabel, type TextbookContributor } from './textbookCredits';
import { DEFAULT_TEXTBOOK_THEME, themePageCss, themeToCssVars, type TextbookTheme } from './textbookTheme';
import './textbookPrint.css';

function CreditsLine({
  people,
  lang,
  kicker,
}: {
  people: TextbookContributor[];
  lang: TextbookModel['lang'];
  kicker: string;
}) {
  if (!people.length) return null;
  return (
    <p className="book-credits">
      <span className="book-credits-label">{kicker}. </span>
      {people.map((person, index) => (
        <span key={person.id}>
          {index > 0 ? '; ' : ''}
          {person.label}
          <span className="book-credits-role"> ({contributorRoleLabel(person.role, lang)})</span>
        </span>
      ))}
    </p>
  );
}

function headingForDepth(depth: number): 2 | 3 | 4 | 5 {
  if (depth <= 0) return 2;
  if (depth === 1) return 3;
  if (depth === 2) return 4;
  return 5;
}

function LessonHeading({ lesson }: { lesson: TextbookLesson }) {
  const Tag = (`h${Math.min(5, lesson.depth + 2)}`) as 'h2' | 'h3' | 'h4' | 'h5';
  return (
    <Tag id={`lesson-${lesson.path.join('-')}`} className="book-lesson-title">
      {lesson.title}
      {lesson.hiddenFromStudents && <span className="book-hidden-flag"> · no publicado al alumnado</span>}
    </Tag>
  );
}

function LessonBlock({ lesson, lang }: { lesson: TextbookLesson; lang: TextbookModel['lang'] }) {
  return (
    <section className="book-lesson" data-depth={lesson.depth}>
      <LessonHeading lesson={lesson} />
      {lesson.editedAtLabel && (
        <p className="book-edited-date">
          {lang === 'en' ? 'Last editorial revision' : 'Última revisión editorial'} · {lesson.editedAtLabel}
        </p>
      )}
      {lesson.contributors.length > 0 && (
        <CreditsLine
          people={lesson.contributors}
          lang={lang}
          kicker={lang === 'en' ? 'Lesson editors' : 'Edición de este tema'}
        />
      )}
      {lesson.description && <p className="book-lesson-deck">{lesson.description}</p>}
      {lesson.content && (
        <RichContent text={lesson.content} headingLevel={headingForDepth(lesson.depth)} tone="print" />
      )}
      {lesson.clinicalPearls.length > 0 && (
        <aside className="book-callout book-pearls">
          <h6>{lang === 'en' ? 'Clinical pearls' : 'Perlas clínicas'}</h6>
          <ul>
            {lesson.clinicalPearls.map((pearl) => (
              <li key={pearl}>{pearl}</li>
            ))}
          </ul>
        </aside>
      )}
      {lesson.images.map((image) => (
        <figure key={image.src} className="book-figure">
          <img src={image.src} alt={image.alt} />
          {(image.caption || image.alt) && (
            <figcaption>
              {image.caption || image.alt}
            </figcaption>
          )}
        </figure>
      ))}
      {lesson.keyPoints.length > 0 && (
        <aside className="book-callout book-keypoints">
          <h6>{lang === 'en' ? 'Key points' : 'Puntos clave'}</h6>
          <ul>
            {lesson.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </aside>
      )}
      {lesson.teachingPdfs.length > 0 && (
        <aside className="book-callout book-pdf-cite">
          <h6>{lang === 'en' ? 'Supporting documents' : 'Material de apoyo'}</h6>
          <ul>
            {lesson.teachingPdfs.map((pdf) => (
              <li key={pdf.url}>
                <strong>{pdf.title}</strong>
                {pdf.author ? ` — ${pdf.author}` : ''}
                {pdf.description ? `. ${pdf.description}` : ''}
                {` ${pdf.url}`}
              </li>
            ))}
          </ul>
        </aside>
      )}
      {lesson.sectionBibliography.length > 0 && (
        <aside className="book-section-refs">
          <h6>{lang === 'en' ? 'References for this section' : 'Bibliografía de la sección'}</h6>
          <ol>
            {lesson.sectionBibliography.map((ref) => (
              <li key={formatReference(ref)}>{formatReference(ref)}</li>
            ))}
          </ol>
        </aside>
      )}
    </section>
  );
}

function ChapterBlock({ chapter, lang }: { chapter: TextbookChapter; lang: TextbookModel['lang'] }) {
  return (
    <article id={`book-chapter-${chapter.id}`} className="book-chapter">
      <p className="book-kicker">
        {lang === 'en' ? 'Module' : 'Módulo'} {String(chapter.number).padStart(2, '0')}
      </p>
      <h1 className="book-chapter-title">{chapter.title}</h1>
      {chapter.contributors.length > 0 && (
        <CreditsLine
          people={chapter.contributors}
          lang={lang}
          kicker={lang === 'en' ? 'Chapter editors' : 'Edición del capítulo'}
        />
      )}
      {chapter.description && <p className="book-chapter-deck">{chapter.description}</p>}
      {chapter.lessons.map((lesson) => (
        <LessonBlock key={lesson.path.join('/')} lesson={lesson} lang={lang} />
      ))}
    </article>
  );
}

export function TextbookDocument({
  model,
  theme = DEFAULT_TEXTBOOK_THEME,
  paginated = false,
}: {
  model: TextbookModel;
  theme?: TextbookTheme;
  paginated?: boolean;
}) {
  const { cover, authors, lang } = model;
  const copy = lang === 'en'
    ? {
        generated: 'Generated from the published syllabus',
        hidden: 'This edition includes material hidden from students.',
        toc: 'Contents',
        appendix: 'Collected bibliography',
        authors: 'Authors',
        editors: 'Editorial contributors',
      }
    : {
        generated: 'Generado a partir del temario publicado',
        hidden: 'Esta edición incluye material no publicado al alumnado.',
        toc: 'Índice',
        appendix: 'Bibliografía general',
        authors: 'Autores',
        editors: 'Edición y revisión',
      };

  return (
    <div
      className={`book-sheet${paginated ? ' book-paginated' : ' book-toc--plain'}`}
      style={themeToCssVars(theme) as CSSProperties}
    >
      <style>{themePageCss(theme)}</style>
      <header className="book-cover">
        <p className="book-kicker">{cover.institution}</p>
        <h1 className="book-cover-title">{cover.title}</h1>
        {cover.subtitle && <p className="book-cover-subtitle">{cover.subtitle}</p>}
        {authors.length > 0 && (
          <div className="book-authors">
            <p className="book-kicker">{copy.authors}</p>
            {authors.map((author) => (
              <p key={author}>{author}</p>
            ))}
          </div>
        )}
        {model.editorialAuthors.length > 0 && (
          <div className="book-authors book-cover-credits">
            <p className="book-kicker">{copy.editors}</p>
            {model.editorialAuthors.map((person) => (
              <p key={person.id}>
                {person.label}
                <span className="book-credits-role"> · {contributorRoleLabel(person.role, lang)}</span>
              </p>
            ))}
          </div>
        )}
      </header>

      <section className="book-frontmatter">
        <p>{copy.generated} · {model.generatedAtLabel}.</p>
        {model.includeHidden && <p>{copy.hidden}</p>}
        <p>
          {lang === 'en'
            ? `${model.stats.modules} modules · ${model.stats.lessons} topics · ${model.stats.references} references`
            : `${model.stats.modules} módulos · ${model.stats.lessons} temas · ${model.stats.references} referencias`}
        </p>
        {model.stats.missingTranslations > 0 && lang === 'en' && (
          <p>{model.stats.missingTranslations} topics fall back to Spanish where the English field is missing.</p>
        )}
      </section>

      <nav className="book-toc-page" aria-label={copy.toc}>
        <h1>{copy.toc}</h1>
        <ol className="book-toc">
          {model.chapters.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#book-chapter-${chapter.id}`}>
                {String(chapter.number).padStart(2, '0')}. {chapter.title}
              </a>
            </li>
          ))}
          {model.appendix.length > 0 && (
            <li>
              <a href="#book-appendix">{copy.appendix}</a>
            </li>
          )}
        </ol>
      </nav>

      {model.chapters.map((chapter) => (
        <ChapterBlock key={chapter.id} chapter={chapter} lang={lang} />
      ))}

      {model.appendix.length > 0 && (
        <section id="book-appendix" className="book-appendix">
          <h1>{copy.appendix}</h1>
          <ol>
            {model.appendix.map((ref) => (
              <li key={formatReference(ref)}>{formatReference(ref)}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
