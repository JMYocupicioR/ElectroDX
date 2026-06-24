// src/content/modules/index.ts
// Central registry of all 13 learning modules

import { Module } from '../../types/content';
import { module01 } from './module-01-fundamentals';
import { module02 } from './module-02-nerve-conduction';
import { module03 } from './module-03-emg-needle';
import { module04 } from './module-04-late-responses';
import { module05 } from './module-05-repetitive-stimulation';
import { module06 } from './module-06-evoked-potentials';
import { module07 } from './module-07-special-studies';
import { module08 } from './module-08-topographic-anatomy';
import { module09 } from './module-09-pathologies';
import { module10 } from './module-10-diagnostic-criteria';
import { module11 } from './module-11-quick-reference';
import { module12 } from './module-12-bibliography';
import { module13 } from './module-13-safety-qc';

export const allModules: Module[] = [
  module01,
  module02,
  module03,
  module04,
  module05,
  module06,
  module07,
  module08,
  module09,
  module10,
  module11,
  module12,
  module13,
];

export const getModuleById = (id: string): Module | undefined =>
  allModules.find(m => m.id === id);

// Flatten all topics recursively for search
import { Topic, SearchResult } from '../../types/content';

function flattenTopics(
  topics: Topic[],
  moduleId: string,
  moduleTitle: string,
  parentPath: string[] = [],
  parentTitlePath: string[] = []
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const topic of topics) {
    const currentPath = [...parentPath, topic.id];
    const currentTitlePath = [...parentTitlePath, topic.title];
    results.push({
      moduleId,
      moduleTitle,
      topicPath: currentPath,
      titlePath: currentTitlePath,
      title: topic.title,
      description: topic.description,
      matchType: 'title',
    });
    if (topic.children) {
      results.push(
        ...flattenTopics(topic.children, moduleId, moduleTitle, currentPath, currentTitlePath)
      );
    }
  }
  return results;
}

export const getAllSearchableTopics = (): SearchResult[] => {
  const results: SearchResult[] = [];
  for (const mod of allModules) {
    results.push(...flattenTopics(mod.topics, mod.id, mod.title));
  }
  return results;
};
