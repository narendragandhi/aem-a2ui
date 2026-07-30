/**
 * SERP Competitive Analysis Service
 * Analyze search engine results for competitive insights
 */

import { ContentSuggestion } from './types.js';

export interface SerpResult {
  position: number;
  url: string;
  title: string;
  description: string;
  domain: string;
  features: SerpFeature[];
}

export type SerpFeature =
  | 'featured_snippet'
  | 'knowledge_panel'
  | 'local_pack'
  | 'image_pack'
  | 'video_carousel'
  | 'people_also_ask'
  | 'reviews'
  | 'sitelinks'
  | 'faq_schema'
  | 'how_to_schema';

export interface SerpAnalysis {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
  results: SerpResult[];
  features: SerpFeature[];
  competitorInsights: CompetitorInsight[];
  opportunities: SerpOpportunity[];
  contentGap: ContentGapAnalysis;
}

export interface CompetitorInsight {
  domain: string;
  averagePosition: number;
  titlePatterns: string[];
  commonWords: string[];
  avgTitleLength: number;
  avgDescriptionLength: number;
  hasSchema: boolean;
  schemaTypes: string[];
}

export interface SerpOpportunity {
  type: 'featured_snippet' | 'faq' | 'how_to' | 'video' | 'local' | 'reviews';
  description: string;
  effort: 'low' | 'medium' | 'high';
  potentialImpact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface ContentGapAnalysis {
  missingTopics: string[];
  missingQuestions: string[];
  recommendedWordCount: number;
  recommendedHeadings: string[];
  competitorKeywords: string[];
}

export interface SerpApiConfig {
  provider: 'google' | 'bing' | 'mock';
  apiKey?: string;
  searchEngineId?: string;
  region?: string;
  language?: string;
}

/**
 * SERP Analyzer Service
 */
export class SerpAnalyzerService {
  private config: SerpApiConfig;

  constructor(config: SerpApiConfig = { provider: 'mock' }) {
    this.config = config;
  }

  /**
   * Analyze SERP for a keyword
   */
  async analyzeSerpForKeyword(keyword: string): Promise<SerpAnalysis> {
    let results: SerpResult[];

    if (this.config.provider === 'google' && this.config.apiKey) {
      results = await this.fetchGoogleResults(keyword);
    } else if (this.config.provider === 'bing' && this.config.apiKey) {
      results = await this.fetchBingResults(keyword);
    } else {
      results = this.generateMockResults(keyword);
    }

    const competitorInsights = this.analyzeCompetitors(results);
    const opportunities = this.identifyOpportunities(results, keyword);
    const contentGap = this.analyzeContentGap(results, keyword);
    const features = this.extractSerpFeatures(results);

    return {
      keyword,
      searchVolume: this.estimateSearchVolume(keyword),
      difficulty: this.estimateDifficulty(results),
      cpc: this.estimateCpc(keyword),
      results,
      features,
      competitorInsights,
      opportunities,
      contentGap,
    };
  }

  /**
   * Compare content against SERP competitors
   */
  async compareWithCompetitors(
    content: ContentSuggestion,
    keyword: string,
  ): Promise<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const serp = await this.analyzeSerpForKeyword(keyword);
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    let score = 50;

    // Title analysis
    const avgTitleLength =
      serp.competitorInsights.reduce((acc, c) => acc + c.avgTitleLength, 0) / serp.competitorInsights.length;

    const titleLength = content.title?.length || 0;
    if (titleLength >= avgTitleLength - 5 && titleLength <= avgTitleLength + 10) {
      strengths.push('Title length is competitive');
      score += 10;
    } else if (titleLength < avgTitleLength - 10) {
      weaknesses.push('Title is shorter than competitors');
      recommendations.push(`Expand title to ~${Math.round(avgTitleLength)} characters`);
      score -= 5;
    }

    // Keyword in title
    if (content.title?.toLowerCase().includes(keyword.toLowerCase())) {
      strengths.push('Target keyword in title');
      score += 10;
    } else {
      weaknesses.push('Target keyword missing from title');
      recommendations.push('Include target keyword in title');
      score -= 10;
    }

    // Description analysis
    const avgDescLength =
      serp.competitorInsights.reduce((acc, c) => acc + c.avgDescriptionLength, 0) / serp.competitorInsights.length;

    const descLength = content.description?.length || 0;
    if (descLength >= avgDescLength - 10) {
      strengths.push('Description length is competitive');
      score += 5;
    } else {
      weaknesses.push('Description shorter than competitors');
      recommendations.push(`Expand description to ~${Math.round(avgDescLength)} characters`);
    }

    // Content gap opportunities
    if (serp.contentGap.missingTopics.length > 0) {
      recommendations.push(`Cover these topics: ${serp.contentGap.missingTopics.slice(0, 3).join(', ')}`);
    }

    // Feature opportunities
    const hasSnippetOpportunity = serp.opportunities.some((o) => o.type === 'featured_snippet');
    if (hasSnippetOpportunity) {
      recommendations.push('Structure content for featured snippet (use lists, tables, or direct answers)');
    }

    // FAQ opportunity
    if (serp.opportunities.some((o) => o.type === 'faq')) {
      recommendations.push('Add FAQ section to target People Also Ask');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses,
      recommendations,
    };
  }

  /**
   * Fetch results from Google Custom Search API
   */
  private async fetchGoogleResults(keyword: string): Promise<SerpResult[]> {
    if (!this.config.apiKey || !this.config.searchEngineId) {
      return this.generateMockResults(keyword);
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', this.config.apiKey);
      url.searchParams.set('cx', this.config.searchEngineId);
      url.searchParams.set('q', keyword);
      url.searchParams.set('num', '10');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!data.items) {
        return this.generateMockResults(keyword);
      }

      return data.items.map((item: any, index: number) => ({
        position: index + 1,
        url: item.link,
        title: item.title,
        description: item.snippet,
        domain: new URL(item.link).hostname,
        features: this.detectFeatures(item),
      }));
    } catch (error) {
      console.error('Google SERP API error:', error);
      return this.generateMockResults(keyword);
    }
  }

  /**
   * Fetch results from Bing Web Search API
   */
  private async fetchBingResults(keyword: string): Promise<SerpResult[]> {
    if (!this.config.apiKey) {
      return this.generateMockResults(keyword);
    }

    try {
      const response = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(keyword)}&count=10`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.config.apiKey,
          },
        },
      );
      const data = await response.json();

      if (!data.webPages?.value) {
        return this.generateMockResults(keyword);
      }

      return data.webPages.value.map((item: any, index: number) => ({
        position: index + 1,
        url: item.url,
        title: item.name,
        description: item.snippet,
        domain: new URL(item.url).hostname,
        features: [],
      }));
    } catch (error) {
      console.error('Bing SERP API error:', error);
      return this.generateMockResults(keyword);
    }
  }

  /**
   * Generate mock SERP results for demo/testing
   */
  private generateMockResults(keyword: string): SerpResult[] {
    const domains = [
      'example.com',
      'competitor1.com',
      'industry-leader.com',
      'blog.techsite.com',
      'news.website.org',
      'guide.expert.io',
      'reviews.site.com',
      'howto.hub.net',
      'tips.portal.com',
      'learn.edu.org',
    ];

    const titleTemplates = [
      `${keyword} - Complete Guide`,
      `Best ${keyword} Tips for 2024`,
      `How to Master ${keyword}`,
      `${keyword}: Everything You Need to Know`,
      `Top 10 ${keyword} Strategies`,
      `${keyword} for Beginners`,
      `Advanced ${keyword} Techniques`,
      `${keyword} Best Practices`,
      `Ultimate ${keyword} Tutorial`,
      `${keyword} Explained Simply`,
    ];

    return domains.map((domain, index) => ({
      position: index + 1,
      url: `https://${domain}/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
      title: titleTemplates[index],
      description: `Learn everything about ${keyword}. Our comprehensive guide covers all aspects including tips, strategies, and best practices for success with ${keyword}.`,
      domain,
      features: index === 0 ? ['featured_snippet'] : index < 3 ? ['sitelinks'] : [],
    }));
  }

  /**
   * Detect SERP features from result
   */
  private detectFeatures(item: any): SerpFeature[] {
    const features: SerpFeature[] = [];

    if (item.pagemap?.metatags?.[0]?.['og:type'] === 'video') {
      features.push('video_carousel');
    }
    if (item.pagemap?.review) {
      features.push('reviews');
    }

    return features;
  }

  /**
   * Analyze competitor patterns
   */
  private analyzeCompetitors(results: SerpResult[]): CompetitorInsight[] {
    const domainMap = new Map<string, SerpResult[]>();

    results.forEach((result) => {
      const existing = domainMap.get(result.domain) || [];
      existing.push(result);
      domainMap.set(result.domain, existing);
    });

    return Array.from(domainMap.entries()).map(([domain, domainResults]) => {
      const titles = domainResults.map((r) => r.title);
      const descriptions = domainResults.map((r) => r.description);

      return {
        domain,
        averagePosition: domainResults.reduce((acc, r) => acc + r.position, 0) / domainResults.length,
        titlePatterns: this.extractPatterns(titles),
        commonWords: this.extractCommonWords(titles.concat(descriptions)),
        avgTitleLength: titles.reduce((acc, t) => acc + t.length, 0) / titles.length,
        avgDescriptionLength: descriptions.reduce((acc, d) => acc + d.length, 0) / descriptions.length,
        hasSchema: domainResults.some((r) => r.features.length > 0),
        schemaTypes: this.inferSchemaTypes(domainResults),
      };
    });
  }

  /**
   * Extract title patterns
   */
  private extractPatterns(titles: string[]): string[] {
    const patterns: string[] = [];

    const hasNumbers = titles.filter((t) => /\d+/.test(t)).length > titles.length / 2;
    const hasYear = titles.filter((t) => /202\d/.test(t)).length > titles.length / 3;
    const hasHowTo = titles.filter((t) => /how to/i.test(t)).length > titles.length / 4;
    const hasList =
      titles.filter((t) => /top \d+|best \d+|\d+ (ways|tips|strategies)/i.test(t)).length > titles.length / 4;

    if (hasNumbers) patterns.push('Uses numbers');
    if (hasYear) patterns.push('Includes current year');
    if (hasHowTo) patterns.push('How-to format');
    if (hasList) patterns.push('Listicle format');

    return patterns;
  }

  /**
   * Extract common words from text
   */
  private extractCommonWords(texts: string[]): string[] {
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
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'been',
      'be',
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
      'your',
      'our',
      'their',
      'its',
      'my',
      'his',
      'her',
    ]);

    const wordCounts = new Map<string, number>();

    texts.forEach((text) => {
      const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      words.forEach((word) => {
        if (!stopWords.has(word)) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Infer schema types from features
   */
  private inferSchemaTypes(results: SerpResult[]): string[] {
    const types: Set<string> = new Set();

    results.forEach((r) => {
      r.features.forEach((f) => {
        if (f === 'faq_schema') types.add('FAQPage');
        if (f === 'how_to_schema') types.add('HowTo');
        if (f === 'reviews') types.add('Review');
        if (f === 'video_carousel') types.add('VideoObject');
      });
    });

    return Array.from(types);
  }

  /**
   * Identify ranking opportunities
   */
  private identifyOpportunities(results: SerpResult[], keyword: string): SerpOpportunity[] {
    const opportunities: SerpOpportunity[] = [];
    const features = this.extractSerpFeatures(results);

    // Featured snippet opportunity
    if (!features.includes('featured_snippet')) {
      opportunities.push({
        type: 'featured_snippet',
        description: 'No featured snippet present - opportunity to capture position zero',
        effort: 'medium',
        potentialImpact: 'high',
        recommendation: 'Structure content with clear answers, lists, or tables at the beginning',
      });
    }

    // FAQ opportunity
    if (!features.includes('people_also_ask') && !features.includes('faq_schema')) {
      opportunities.push({
        type: 'faq',
        description: 'FAQ schema not detected in top results',
        effort: 'low',
        potentialImpact: 'medium',
        recommendation: 'Add FAQ section with common questions about the topic',
      });
    }

    // How-to opportunity
    if (keyword.toLowerCase().includes('how') && !features.includes('how_to_schema')) {
      opportunities.push({
        type: 'how_to',
        description: 'How-to query without HowTo schema in results',
        effort: 'low',
        potentialImpact: 'high',
        recommendation: 'Add step-by-step instructions with HowTo schema markup',
      });
    }

    // Video opportunity
    if (!features.includes('video_carousel')) {
      opportunities.push({
        type: 'video',
        description: 'No video results present',
        effort: 'high',
        potentialImpact: 'medium',
        recommendation: 'Create video content to capture video carousel position',
      });
    }

    // Reviews opportunity
    if (!features.includes('reviews')) {
      opportunities.push({
        type: 'reviews',
        description: 'No review rich results present',
        effort: 'medium',
        potentialImpact: 'medium',
        recommendation: 'Add review/rating schema for enhanced SERP visibility',
      });
    }

    return opportunities;
  }

  /**
   * Analyze content gaps
   */
  private analyzeContentGap(results: SerpResult[], keyword: string): ContentGapAnalysis {
    const allText = results.map((r) => `${r.title} ${r.description}`).join(' ');
    const commonWords = this.extractCommonWords([allText]);

    // Generate related questions
    const questionStarters = ['what is', 'how to', 'why', 'when to', 'where to', 'who should'];
    const missingQuestions = questionStarters.map((starter) => `${starter} ${keyword}?`);

    // Extract potential subtopics
    const missingTopics = commonWords.slice(0, 5).map((word) => `${keyword} ${word}`);

    // Calculate recommended word count from competitors
    const avgPosition1To3Length =
      results.filter((r) => r.position <= 3).reduce((acc, r) => acc + r.description.length * 10, 0) / 3; // Estimate full content

    return {
      missingTopics,
      missingQuestions,
      recommendedWordCount: Math.max(1500, Math.round(avgPosition1To3Length)),
      recommendedHeadings: [
        `What is ${keyword}`,
        `How ${keyword} works`,
        `Benefits of ${keyword}`,
        `${keyword} best practices`,
        `Common ${keyword} mistakes`,
        `${keyword} FAQ`,
      ],
      competitorKeywords: commonWords,
    };
  }

  /**
   * Extract all SERP features
   */
  private extractSerpFeatures(results: SerpResult[]): SerpFeature[] {
    const features = new Set<SerpFeature>();
    results.forEach((r) => r.features.forEach((f) => features.add(f)));
    return Array.from(features);
  }

  /**
   * Estimate search volume (mock - would use real API in production)
   */
  private estimateSearchVolume(keyword: string): number {
    // In production, use Google Ads API, SEMrush, or Ahrefs
    const wordCount = keyword.split(' ').length;
    const baseVolume = 10000;
    return Math.round(baseVolume / Math.pow(1.5, wordCount - 1));
  }

  /**
   * Estimate keyword difficulty
   */
  private estimateDifficulty(results: SerpResult[]): number {
    // Estimate based on competitor authority
    const authorityDomains = ['wikipedia.org', 'amazon.com', 'google.com', 'youtube.com'];
    const authorityCount = results.filter((r) => authorityDomains.some((d) => r.domain.includes(d))).length;

    return Math.min(100, 30 + authorityCount * 10);
  }

  /**
   * Estimate CPC (mock)
   */
  private estimateCpc(keyword: string): number {
    const commercialTerms = ['buy', 'price', 'cost', 'cheap', 'best', 'top', 'review'];
    const hasCommercial = commercialTerms.some((t) => keyword.toLowerCase().includes(t));
    return hasCommercial ? 2.5 + Math.random() * 5 : 0.5 + Math.random() * 2;
  }
}

/**
 * Default SERP analyzer instance
 */
export const serpAnalyzer = new SerpAnalyzerService();
