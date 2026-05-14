import type { Lang } from '$lib/i18n/route-map.js';

export interface BlogPost {
  slug: string;
  lang: Lang;
  storyNumber: string;
  filePath: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  thumbnail: string;
  thumbnail_alt: string;
  tags: string[];
  category: string;
  content: string;
}
