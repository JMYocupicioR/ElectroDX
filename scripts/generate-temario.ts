// scripts/generate-temario.ts
import { allModules } from '../src/content/modules/index';
import { applyLessonExpansions } from '../src/services/contentMerge';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname under ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function countWords(text?: string): number {
  if (!text) return 0;
  // Clean markdown syntax or HTML if any to get a realistic word count
  const cleanText = text
    .replace(/#+\s+/g, '') // headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_`~]/g, ''); // formatting
  return cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;
}

interface ShortTopic {
  moduleId: string;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
  wordCount: number;
}

let totalModules = allModules.length;
let totalTopics = 0;
let topicsWithContent = 0;
let emptyTopics = 0;
let totalWords = 0;
const shortTopicsList: ShortTopic[] = [];

function calculateStats(topics: any[], moduleId: string, moduleTitle: string) {
  for (const topic of topics) {
    totalTopics++;
    const words = countWords(topic.content);
    if (topic.children && topic.children.length > 0) {
      calculateStats(topic.children, moduleId, moduleTitle);
    } else {
      if (words > 0) {
        topicsWithContent++;
        totalWords += words;
        if (words < 60) {
          shortTopicsList.push({
            moduleId,
            moduleTitle,
            topicId: topic.id,
            topicTitle: topic.title,
            wordCount: words,
          });
        }
      } else {
        emptyTopics++;
      }
    }
  }
}

const modulesForInventory = allModules.map((mod) => applyLessonExpansions(mod));

for (const mod of modulesForInventory) {
  calculateStats(mod.topics, mod.id, mod.title);
}

let mdContent = `# 📋 Temario Completo y Estado de Contenido - EMG Educativo\n\n`;
mdContent += `Este documento contiene el índice jerárquico de todos los módulos, temas y subtemas registrados en la plataforma. Sirve de referencia para saber qué temas ya cuentan con material didáctico, cuáles son agrupadores y cuáles están vacíos o requieren ampliación.\n\n`;

mdContent += `## 📊 Resumen General del Contenido\n\n`;
mdContent += `- **Módulos totales:** ${totalModules}\n`;
mdContent += `- **Temas/Subtemas totales:** ${totalTopics}\n`;
mdContent += `- **Temas con contenido redactado:** ${topicsWithContent}\n`;
mdContent += `- **Temas vacíos / por redactar:** ${emptyTopics}\n`;
mdContent += `- **Temas con contenido muy corto (< 60 palabras) para ampliación:** ${shortTopicsList.length}\n`;
mdContent += `- **Total de palabras del curso:** ${totalWords.toLocaleString()} palabras\n\n`;

if (shortTopicsList.length > 0) {
  mdContent += `### ⚠️ Temas Cortos Sugeridos para Ampliación (Menos de 60 palabras)\n`;
  mdContent += `Estos temas son hojas finales de la estructura, pero tienen muy poco texto y deben ser expandidos:\n\n`;
  
  // Group by module for cleaner output
  const groupedShort: Record<string, typeof shortTopicsList> = {};
  for (const t of shortTopicsList) {
    if (!groupedShort[t.moduleTitle]) groupedShort[t.moduleTitle] = [];
    groupedShort[t.moduleTitle].push(t);
  }

  for (const [modTitle, list] of Object.entries(groupedShort)) {
    mdContent += `* **${modTitle}**:\n`;
    for (const item of list) {
      mdContent += `  - \`${item.topicId}\` — **${item.topicTitle}** (${item.wordCount} palabras)\n`;
    }
  }
  mdContent += `\n`;
}

mdContent += `---\n\n`;

function renderTopic(topic: any, depth: number): string {
  const indent = '  '.repeat(depth);
  const words = countWords(topic.content);
  let status = '';

  if (topic.children && topic.children.length > 0) {
    status = `*(Agrupador: ${topic.children.length} subtemas)*`;
  } else if (words > 0) {
    if (words < 60) {
      status = `⚠️ **[Muy corto: ${words} palabras]**`;
    } else {
      status = `✅ **[${words} palabras]**`;
    }
  } else {
    status = `❌ ⚠️ **[VACÍO - Sin contenido]**`;
  }

  // Extra details
  let details: string[] = [];
  if (topic.videoUrls && topic.videoUrls.length > 0) details.push(`🎥 ${topic.videoUrls.length} video(s)`);
  if (topic.youtubeUrls && topic.youtubeUrls.length > 0) details.push(`🎬 ${topic.youtubeUrls.length} YouTube`);
  if (topic.clinicalPearls && topic.clinicalPearls.length > 0) details.push(`💡 ${topic.clinicalPearls.length} perlas`);
  if (topic.keyPoints && topic.keyPoints.length > 0) details.push(`📌 ${topic.keyPoints.length} puntos clave`);
  if (topic.tags && topic.tags.length > 0) details.push(`🏷️ ${topic.tags.length} tags`);

  const detailsStr = details.length > 0 ? ` _(${details.join(', ')})_` : '';

  let line = `${indent}- **${topic.title}** \`(${topic.id})\` — ${status}${detailsStr}\n`;

  if (topic.children && topic.children.length > 0) {
    for (const child of topic.children) {
      line += renderTopic(child, depth + 1);
    }
  }
  return line;
}

for (const mod of modulesForInventory) {
  mdContent += `## 📦 Módulo ${mod.number.toString().padStart(2, '0')}: ${mod.emoji} ${mod.title} \`(${mod.id})\`\n`;
  mdContent += `> ${mod.description}\n\n`;

  if (mod.topics && mod.topics.length > 0) {
    for (const topic of mod.topics) {
      mdContent += renderTopic(topic, 0);
    }
  } else {
    mdContent += `*No hay temas registrados en este módulo.*\n`;
  }
  mdContent += `\n---\n\n`;
}

// Write file
const outputPath = path.join(__dirname, '../TEMARIO.md');
fs.writeFileSync(outputPath, mdContent, 'utf-8');
console.log(`Temario generado exitosamente en: ${outputPath}`);

