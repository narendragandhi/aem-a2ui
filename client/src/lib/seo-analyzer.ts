/**
 * SEO Analyzer
 * Comprehensive SEO analysis for content optimization
 */

import { ContentSuggestion } from './types.js';

export interface SeoScore {
  overall: number;
  categories: {
    title: CategoryScore;
    meta: CategoryScore;
    content: CategoryScore;
    readability: CategoryScore;
    keywords: CategoryScore;
    structure: CategoryScore;
  };
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  issues: SeoIssue[];
  passed: string[];
}

export interface SeoIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  field?: string;
}

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number;
  inTitle: boolean;
  inDescription: boolean;
  inHeadings: boolean;
  prominence: number; // 0-100, how early it appears
}

export interface ReadabilityMetrics {
  fleschKincaid: number;
  fleschReadingEase: number;
  avgSentenceLength: number;
  avgWordLength: number;
  syllableCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTime: number; // minutes
  gradeLevel: string;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  canonical: string;
  robots: string;
}

/**
 * Analyze content for SEO
 */
export function analyzeContent(content: ContentSuggestion, targetKeyword?: string): SeoScore {
  const title = content.title || '';
  const description = content.description || '';
  const fullText = `${title} ${content.subtitle || ''} ${description} ${content.ctaText || ''}`;

  const categories = {
    title: analyzeTitleSeo(title, targetKeyword),
    meta: analyzeMetaSeo(content, targetKeyword),
    content: analyzeContentSeo(content, targetKeyword),
    readability: analyzeReadabilitySeo(fullText),
    keywords: analyzeKeywordsSeo(fullText, targetKeyword),
    structure: analyzeStructureSeo(content),
  };

  const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);
  const maxScore = Object.values(categories).reduce((sum, cat) => sum + cat.maxScore, 0);
  const overall = Math.round((totalScore / maxScore) * 100);

  return { overall, categories };
}

/**
 * Analyze title for SEO
 */
function analyzeTitleSeo(title: string, targetKeyword?: string): CategoryScore {
  const issues: SeoIssue[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 25;

  // Length check (50-60 chars ideal)
  if (title.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Title is missing',
      suggestion: 'Add a compelling title between 50-60 characters',
      field: 'title',
    });
  } else if (title.length < 30) {
    issues.push({
      severity: 'warning',
      message: `Title is too short (${title.length} chars)`,
      suggestion: 'Expand title to 50-60 characters for better SEO',
      field: 'title',
    });
    score += 3;
  } else if (title.length > 60) {
    issues.push({
      severity: 'warning',
      message: `Title may be truncated in search results (${title.length} chars)`,
      suggestion: 'Shorten to under 60 characters',
      field: 'title',
    });
    score += 4;
  } else {
    passed.push(`Title length is optimal (${title.length} chars)`);
    score += 6;
  }

  // Power words check
  const powerWords = [
    'discover',
    'ultimate',
    'proven',
    'exclusive',
    'free',
    'new',
    'best',
    'top',
    'essential',
    'complete',
    'guide',
    'secret',
    'amazing',
    'transform',
  ];
  const hasPowerWord = powerWords.some((word) => title.toLowerCase().includes(word));
  if (hasPowerWord) {
    passed.push('Title contains power words');
    score += 4;
  } else {
    issues.push({
      severity: 'info',
      message: 'Title could be more compelling',
      suggestion: `Add power words like: ${powerWords.slice(0, 5).join(', ')}`,
      field: 'title',
    });
  }

  // Number check (titles with numbers perform better)
  const hasNumber = /\d/.test(title);
  if (hasNumber) {
    passed.push('Title contains numbers (increases CTR)');
    score += 3;
  } else {
    issues.push({
      severity: 'info',
      message: 'Consider adding numbers to title',
      suggestion: 'Titles with numbers get 36% more clicks (e.g., "7 Ways to...")',
      field: 'title',
    });
  }

  // Target keyword check
  if (targetKeyword) {
    if (title.toLowerCase().includes(targetKeyword.toLowerCase())) {
      passed.push(`Target keyword "${targetKeyword}" found in title`);
      score += 6;

      // Check if keyword is near the beginning
      const keywordPosition = title.toLowerCase().indexOf(targetKeyword.toLowerCase());
      if (keywordPosition < 20) {
        passed.push('Keyword appears early in title (good for SEO)');
        score += 3;
      }
    } else {
      issues.push({
        severity: 'error',
        message: `Target keyword "${targetKeyword}" not in title`,
        suggestion: 'Include your primary keyword in the title, preferably near the beginning',
        field: 'title',
      });
    }
  } else {
    score += 3; // No penalty if no target keyword specified
  }

  // Starts with action word
  const actionWords = [
    'get',
    'learn',
    'discover',
    'find',
    'create',
    'build',
    'master',
    'unlock',
    'boost',
    'transform',
    'how',
    'why',
    'what',
  ];
  const startsWithAction = actionWords.some((word) => title.toLowerCase().startsWith(word));
  if (startsWithAction) {
    passed.push('Title starts with action word');
    score += 3;
  }

  return { score: Math.min(score, maxScore), maxScore, issues, passed };
}

/**
 * Analyze meta description for SEO
 */
function analyzeMetaSeo(content: ContentSuggestion, targetKeyword?: string): CategoryScore {
  const description = content.description || '';
  const issues: SeoIssue[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 20;

  // Length check (150-160 chars ideal)
  if (description.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Meta description is missing',
      suggestion: 'Add a meta description between 150-160 characters',
      field: 'description',
    });
  } else if (description.length < 120) {
    issues.push({
      severity: 'warning',
      message: `Description is short (${description.length} chars)`,
      suggestion: 'Expand to 150-160 characters to maximize SERP real estate',
      field: 'description',
    });
    score += 3;
  } else if (description.length > 160) {
    issues.push({
      severity: 'warning',
      message: `Description may be truncated (${description.length} chars)`,
      suggestion: 'Shorten to under 160 characters',
      field: 'description',
    });
    score += 4;
  } else {
    passed.push(`Description length is optimal (${description.length} chars)`);
    score += 6;
  }

  // CTA in description
  const ctaWords = ['learn', 'discover', 'get', 'find', 'read', 'click', 'explore', 'start', 'try', 'see'];
  const hasCta = ctaWords.some((word) => description.toLowerCase().includes(word));
  if (hasCta) {
    passed.push('Description contains call-to-action');
    score += 4;
  } else {
    issues.push({
      severity: 'info',
      message: 'Add a call-to-action to description',
      suggestion: 'Include action words like "Learn more", "Discover", "Get started"',
      field: 'description',
    });
  }

  // Target keyword in description
  if (targetKeyword && description.toLowerCase().includes(targetKeyword.toLowerCase())) {
    passed.push(`Target keyword found in description`);
    score += 5;
  } else if (targetKeyword) {
    issues.push({
      severity: 'warning',
      message: 'Target keyword missing from description',
      suggestion: `Include "${targetKeyword}" naturally in the description`,
      field: 'description',
    });
  } else {
    score += 2;
  }

  // Unique selling proposition
  const uspWords = ['only', 'exclusive', 'unique', 'best', 'leading', '#1', 'top-rated', 'award', 'guaranteed'];
  const hasUsp = uspWords.some((word) => description.toLowerCase().includes(word));
  if (hasUsp) {
    passed.push('Description highlights unique value');
    score += 3;
  }

  // Ends with period or call to action
  if (description.endsWith('.') || description.endsWith('!') || description.endsWith('?')) {
    passed.push('Description has proper punctuation');
    score += 2;
  }

  return { score: Math.min(score, maxScore), maxScore, issues, passed };
}

/**
 * Analyze content body for SEO
 */
function analyzeContentSeo(content: ContentSuggestion, targetKeyword?: string): CategoryScore {
  const fullText = `${content.title} ${content.subtitle || ''} ${content.description}`;
  const issues: SeoIssue[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 20;

  const wordCount = fullText.split(/\s+/).filter((w) => w.length > 0).length;

  // Word count
  if (wordCount < 50) {
    issues.push({
      severity: 'warning',
      message: `Content is thin (${wordCount} words)`,
      suggestion: 'Expand content to at least 100 words for better rankings',
    });
    score += 2;
  } else if (wordCount >= 100) {
    passed.push(`Good content length (${wordCount} words)`);
    score += 5;
  } else {
    score += 3;
  }

  // Image presence
  if (content.imageUrl) {
    passed.push('Content includes image');
    score += 4;

    // Alt text
    if (content.imageAlt) {
      passed.push('Image has alt text');
      score += 3;
    } else {
      issues.push({
        severity: 'warning',
        message: 'Image missing alt text',
        suggestion: 'Add descriptive alt text for accessibility and SEO',
        field: 'imageAlt',
      });
    }
  } else {
    issues.push({
      severity: 'info',
      message: 'No image in content',
      suggestion: 'Add relevant images to increase engagement and SEO',
    });
  }

  // CTA presence
  if (content.ctaText && content.ctaUrl) {
    passed.push('Content has clear call-to-action');
    score += 4;
  } else {
    issues.push({
      severity: 'warning',
      message: 'Missing call-to-action',
      suggestion: 'Add a CTA button to guide user actions',
    });
  }

  // Internal linking opportunity
  if (content.ctaUrl && !content.ctaUrl.startsWith('http')) {
    passed.push('Uses internal linking');
    score += 2;
  }

  // Keyword in first 100 words
  if (targetKeyword) {
    const first100 = fullText.split(/\s+/).slice(0, 100).join(' ');
    if (first100.toLowerCase().includes(targetKeyword.toLowerCase())) {
      passed.push('Keyword appears in first 100 words');
      score += 2;
    }
  }

  return { score: Math.min(score, maxScore), maxScore, issues, passed };
}

/**
 * Analyze readability for SEO
 */
function analyzeReadabilitySeo(text: string): CategoryScore {
  const metrics = calculateReadability(text);
  const issues: SeoIssue[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 20;

  // Flesch Reading Ease (60-70 is ideal for web)
  if (metrics.fleschReadingEase >= 60) {
    passed.push(`Good readability (Flesch: ${metrics.fleschReadingEase.toFixed(1)})`);
    score += 6;
  } else if (metrics.fleschReadingEase >= 45) {
    issues.push({
      severity: 'info',
      message: 'Content could be more readable',
      suggestion: 'Use shorter sentences and simpler words',
    });
    score += 3;
  } else {
    issues.push({
      severity: 'warning',
      message: `Content is difficult to read (Flesch: ${metrics.fleschReadingEase.toFixed(1)})`,
      suggestion: 'Simplify language, break up long sentences',
    });
  }

  // Sentence length
  if (metrics.avgSentenceLength <= 20) {
    passed.push(`Good sentence length (avg ${metrics.avgSentenceLength.toFixed(1)} words)`);
    score += 4;
  } else {
    issues.push({
      severity: 'info',
      message: `Sentences are long (avg ${metrics.avgSentenceLength.toFixed(1)} words)`,
      suggestion: 'Aim for 15-20 words per sentence',
    });
    score += 2;
  }

  // Paragraph check
  if (metrics.paragraphCount >= 2) {
    passed.push('Content is well-structured with paragraphs');
    score += 4;
  } else {
    issues.push({
      severity: 'info',
      message: 'Consider breaking content into paragraphs',
      suggestion: 'Use short paragraphs (2-3 sentences) for web readability',
    });
    score += 2;
  }

  // Reading time
  passed.push(`Reading time: ${metrics.readingTime} min`);
  score += 3;

  // Grade level
  passed.push(`Grade level: ${metrics.gradeLevel}`);
  score += 3;

  return { score: Math.min(score, maxScore), maxScore, issues, passed };
}

/**
 * Analyze keyword optimization
 */
function analyzeKeywordsSeo(text: string, targetKeyword?: string): CategoryScore {
  const issues: SeoIssue[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 15;

  if (!targetKeyword) {
    issues.push({
      severity: 'info',
      message: 'No target keyword specified',
      suggestion: 'Set a target keyword for detailed optimization analysis',
    });
    return { score: 8, maxScore, issues, passed };
  }

  const analysis = analyzeKeyword(text, targetKeyword);

  // Keyword presence
  if (analysis.count === 0) {
    issues.push({
      severity: 'error',
      message: `Target keyword "${targetKeyword}" not found`,
      suggestion: 'Include your target keyword naturally throughout the content',
    });
  } else {
    passed.push(`Keyword appears ${analysis.count} time(s)`);
    score += 5;
  }

  // Keyword density (1-3% ideal)
  if (analysis.density > 0 && analysis.density < 1) {
    issues.push({
      severity: 'info',
      message: `Low keyword density (${analysis.density.toFixed(1)}%)`,
      suggestion: 'Consider using the keyword more frequently (aim for 1-2%)',
    });
    score += 2;
  } else if (analysis.density >= 1 && analysis.density <= 3) {
    passed.push(`Optimal keyword density (${analysis.density.toFixed(1)}%)`);
    score += 5;
  } else if (analysis.density > 3) {
    issues.push({
      severity: 'warning',
      message: `High keyword density (${analysis.density.toFixed(1)}%)`,
      suggestion: 'Reduce keyword usage to avoid over-optimization',
    });
    score += 2;
  }

  // Keyword prominence
  if (analysis.prominence > 70) {
    passed.push('Keyword appears early in content');
    score += 3;
  } else if (analysis.prominence > 40) {
    score += 2;
  } else if (analysis.count > 0) {
    issues.push({
      severity: 'info',
      message: 'Keyword appears late in content',
      suggestion: 'Try to include keyword in the first 100 words',
    });
  }

  // LSI keywords suggestion
  const lsiKeywords = generateLsiKeywords(targetKeyword);
  const foundLsi = lsiKeywords.filter((lsi) => text.toLowerCase().includes(lsi));
  if (foundLsi.length >= 2) {
    passed.push(`Uses related terms: ${foundLsi.slice(0, 3).join(', ')}`);
    score += 2;
  } else {
    issues.push({
      severity: 'info',
      message: 'Consider adding related terms',
      suggestion: `Try including: ${lsiKeywords.slice(0, 4).join(', ')}`,
    });
  }

  return { score: Math.min(score, maxScore), maxScore, issues, passed };
}

/**
 * Analyze content structure
 */
function analyzeStructureSeo(content: ContentSuggestion): CategoryScore {
  const issues: SeoIssue[] = [];
  const passed: string[] = [];
  let score = 0;
  const maxScore = 10;

  // Title hierarchy
  if (content.title) {
    passed.push('Has primary heading (H1)');
    score += 3;
  } else {
    issues.push({
      severity: 'error',
      message: 'Missing primary heading',
      suggestion: 'Add a clear H1 title',
    });
  }

  // Subtitle (H2 equivalent)
  if (content.subtitle) {
    passed.push('Has subheading');
    score += 2;
  }

  // Description as body content
  if (content.description && content.description.length > 100) {
    passed.push('Has substantial body content');
    score += 3;
  }

  // CTA structure
  if (content.ctaText) {
    passed.push('Has actionable CTA');
    score += 2;

    // CTA text quality
    const goodCtaWords = ['start', 'get', 'try', 'learn', 'discover', 'download', 'join', 'subscribe'];
    if (goodCtaWords.some((w) => content.ctaText!.toLowerCase().includes(w))) {
      score += 1;
    }
  }

  return { score: Math.min(score, maxScore), maxScore, issues, passed };
}

/**
 * Calculate readability metrics
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(wordCount, 1);

  // Flesch Reading Ease
  const fleschReadingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

  // Flesch-Kincaid Grade Level
  const fleschKincaid = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

  const readingTime = Math.ceil(wordCount / 200); // 200 wpm average

  const gradeLevel = getGradeLevel(fleschKincaid);

  return {
    fleschKincaid: Math.max(0, fleschKincaid),
    fleschReadingEase: Math.min(100, Math.max(0, fleschReadingEase)),
    avgSentenceLength,
    avgWordLength,
    syllableCount,
    wordCount,
    sentenceCount,
    paragraphCount: paragraphs.length,
    readingTime,
    gradeLevel,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function getGradeLevel(fkGrade: number): string {
  if (fkGrade < 1) return '5th grade or below';
  if (fkGrade < 6) return '5th-6th grade';
  if (fkGrade < 8) return '7th-8th grade';
  if (fkGrade < 10) return '9th-10th grade';
  if (fkGrade < 12) return '11th-12th grade';
  return 'College level';
}

/**
 * Analyze a specific keyword
 */
export function analyzeKeyword(text: string, keyword: string): KeywordAnalysis {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Count occurrences
  const regex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(regex) || [];
  const count = matches.length;

  // Calculate density
  const keywordWords = keyword.split(/\s+/).length;
  const density = wordCount > 0 ? ((count * keywordWords) / wordCount) * 100 : 0;

  // Check positions
  const firstPosition = lowerText.indexOf(lowerKeyword);
  const prominence = firstPosition === -1 ? 0 : Math.max(0, 100 - (firstPosition / lowerText.length) * 100);

  // Check in different sections (simplified for component content)
  const titleArea = lowerText.substring(0, Math.min(100, lowerText.length));
  const inTitle = titleArea.includes(lowerKeyword);

  const descStart = Math.min(100, lowerText.length);
  const descArea = lowerText.substring(descStart);
  const inDescription = descArea.includes(lowerKeyword);

  return {
    keyword,
    count,
    density,
    inTitle,
    inDescription,
    inHeadings: inTitle, // Simplified
    prominence,
  };
}

/**
 * Generate LSI (Latent Semantic Indexing) keyword suggestions
 */
function generateLsiKeywords(keyword: string): string[] {
  const lsiMap: Record<string, string[]> = {
    sale: ['discount', 'offer', 'deal', 'savings', 'promotion', 'clearance', 'price', 'value'],
    product: ['item', 'goods', 'merchandise', 'solution', 'offering', 'service'],
    hero: ['banner', 'header', 'headline', 'feature', 'showcase', 'highlight'],
    summer: ['seasonal', 'warm', 'outdoor', 'vacation', 'holiday', 'sunny'],
    furniture: ['decor', 'home', 'interior', 'design', 'living', 'comfort'],
    outdoor: ['patio', 'garden', 'exterior', 'backyard', 'nature', 'open-air'],
  };

  const words = keyword.toLowerCase().split(/\s+/);
  const suggestions: string[] = [];

  for (const word of words) {
    if (lsiMap[word]) {
      suggestions.push(...lsiMap[word]);
    }
  }

  // Add generic related terms
  suggestions.push('best', 'top', 'quality', 'premium', 'affordable', 'professional');

  return [...new Set(suggestions)].slice(0, 10);
}

/**
 * Generate optimized meta tags
 */
export function generateMetaTags(content: ContentSuggestion, baseUrl: string = ''): MetaTags {
  const title = content.title || 'Untitled';
  const description = content.description || '';
  const truncatedDesc = description.length > 155 ? description.substring(0, 152) + '...' : description;

  // Extract keywords from content
  const keywords = extractKeywords(`${title} ${description}`);

  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    description: truncatedDesc,
    keywords,
    ogTitle: title,
    ogDescription: truncatedDesc,
    ogImage: content.imageUrl || '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: title.length > 70 ? title.substring(0, 67) + '...' : title,
    twitterDescription: truncatedDesc,
    canonical: baseUrl ? `${baseUrl}/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '',
    robots: 'index, follow',
  };
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'shall',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'what',
    'which',
    'who',
    'whom',
    'where',
    'when',
    'why',
    'how',
    'all',
    'each',
    'every',
    'both',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    'just',
    'your',
    'our',
    'their',
    'its',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Count frequency
  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Get SEO improvement suggestions
 */
export function getSeoSuggestions(content: ContentSuggestion, targetKeyword?: string): string[] {
  const score = analyzeContent(content, targetKeyword);
  const suggestions: string[] = [];

  // Collect all issues sorted by severity
  const allIssues: SeoIssue[] = [];
  for (const category of Object.values(score.categories)) {
    allIssues.push(...category.issues);
  }

  // Sort: errors first, then warnings, then info
  const severityOrder = { error: 0, warning: 1, info: 2 };
  allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Return top suggestions
  for (const issue of allIssues.slice(0, 5)) {
    suggestions.push(issue.suggestion);
  }

  return suggestions;
}
