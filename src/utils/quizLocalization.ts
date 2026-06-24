import type { QuizOption, QuizQuestion } from '../types/quiz';

export function localizeQuizOption(option: QuizOption, lang: 'es' | 'en'): QuizOption {
  if (lang !== 'en' || !option.textEn?.trim()) return option;
  return { ...option, text: option.textEn };
}

export function localizeQuizQuestion(question: QuizQuestion, lang: 'es' | 'en'): QuizQuestion {
  return {
    ...question,
    stem: lang === 'en' && question.stem_en?.trim() ? question.stem_en : question.stem,
    explanation:
      lang === 'en' && question.explanation_en?.trim()
        ? question.explanation_en
        : question.explanation,
    options: question.options.map((option) => localizeQuizOption(option, lang)),
  };
}
