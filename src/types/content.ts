// src/types/content.ts
// Hierarchical content system for the neurodiagnostic learning platform

export interface Topic {
  id: string;
  title: string;
  titleEn?: string;
  icon?: string;
  description?: string;
  descriptionEn?: string;
  content?: string;        // Markdown/HTML content
  contentEn?: string;
  videoUrls?: { title: string; driveId: string }[];  // Google Drive video embeds
  youtubeUrls?: { title: string; videoId: string; startTime?: number }[];  // YouTube video embeds
  imageUrls?: { src: string; alt: string; caption?: string }[];  // Educational images/diagrams
  clinicalPearls?: string[];    // Highlighted clinical tips (💡)
  clinicalPearlsEn?: string[];
  keyPoints?: string[];         // Key takeaway summaries (📌)
  keyPointsEn?: string[];
  children?: Topic[];      // Recursive sub-topics (unlimited depth)
  tags?: string[];
  keyTerms?: string[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  emoji: string;
  description: string;
  descriptionEn: string;
  color: string;           // Tailwind gradient class
  icon: string;            // Lucide icon name
  topics: Topic[];
}

// Breadcrumb for deep navigation
export interface Breadcrumb {
  id: string;
  title: string;
  path: string;
}

// Search result from any depth
export interface SearchResult {
  moduleId: string;
  moduleTitle: string;
  topicPath: string[];     // Full path of topic IDs
  titlePath: string[];     // Full path of topic titles
  title: string;
  description?: string;
  matchType: 'title' | 'content' | 'tag' | 'keyTerm';
}
