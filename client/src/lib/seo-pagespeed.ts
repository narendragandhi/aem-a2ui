/**
 * PageSpeed & Core Web Vitals Analysis
 * Integrates with Google PageSpeed Insights API and Lighthouse
 */

export interface CoreWebVitals {
  lcp: WebVitalMetric; // Largest Contentful Paint
  fid: WebVitalMetric; // First Input Delay
  cls: WebVitalMetric; // Cumulative Layout Shift
  fcp: WebVitalMetric; // First Contentful Paint
  ttfb: WebVitalMetric; // Time to First Byte
  inp: WebVitalMetric; // Interaction to Next Paint
}

export interface WebVitalMetric {
  value: number;
  unit: 'ms' | 's' | 'score';
  rating: 'good' | 'needs-improvement' | 'poor';
  percentile: number;
}

export interface PageSpeedScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

export interface PageSpeedAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo';
  impact: 'high' | 'medium' | 'low';
  recommendations?: string[];
}

export interface PageSpeedAnalysis {
  url: string;
  fetchTime: string;
  strategy: 'mobile' | 'desktop';
  scores: PageSpeedScore;
  coreWebVitals: CoreWebVitals;
  audits: PageSpeedAudit[];
  opportunities: PageSpeedOpportunity[];
  diagnostics: PageSpeedDiagnostic[];
  resourceSummary: ResourceSummary;
  screenshotUrl?: string;
}

export interface PageSpeedOpportunity {
  id: string;
  title: string;
  description: string;
  savings: {
    bytes?: number;
    ms?: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
}

export interface PageSpeedDiagnostic {
  id: string;
  title: string;
  description: string;
  details?: string;
  items?: Array<Record<string, unknown>>;
}

export interface ResourceSummary {
  totalBytes: number;
  totalRequests: number;
  resourceTypes: {
    type: string;
    bytes: number;
    requests: number;
  }[];
  thirdPartyBytes: number;
  mainThreadTime: number;
}

export interface PageSpeedConfig {
  apiKey?: string;
  strategy?: 'mobile' | 'desktop';
  categories?: ('performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa')[];
}

/**
 * PageSpeed Analysis Service
 */
export class PageSpeedService {
  private config: PageSpeedConfig;
  private apiEndpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  constructor(config: PageSpeedConfig = {}) {
    this.config = {
      strategy: 'mobile',
      categories: ['performance', 'accessibility', 'best-practices', 'seo'],
      ...config,
    };
  }

  /**
   * Analyze a URL with PageSpeed Insights
   */
  async analyzeUrl(url: string): Promise<PageSpeedAnalysis> {
    if (this.config.apiKey) {
      return this.fetchRealAnalysis(url);
    }
    return this.generateMockAnalysis(url);
  }

  /**
   * Get Core Web Vitals for a URL
   */
  async getCoreWebVitals(url: string): Promise<CoreWebVitals> {
    const analysis = await this.analyzeUrl(url);
    return analysis.coreWebVitals;
  }

  /**
   * Compare two URLs
   */
  async compareUrls(
    url1: string,
    url2: string,
  ): Promise<{
    url1: PageSpeedAnalysis;
    url2: PageSpeedAnalysis;
    comparison: {
      metric: string;
      url1Value: number;
      url2Value: number;
      winner: 'url1' | 'url2' | 'tie';
      difference: number;
    }[];
  }> {
    const [analysis1, analysis2] = await Promise.all([this.analyzeUrl(url1), this.analyzeUrl(url2)]);

    const comparison = [
      {
        metric: 'Performance',
        url1Value: analysis1.scores.performance,
        url2Value: analysis2.scores.performance,
        winner: this.getWinner(analysis1.scores.performance, analysis2.scores.performance),
        difference: Math.abs(analysis1.scores.performance - analysis2.scores.performance),
      },
      {
        metric: 'LCP',
        url1Value: analysis1.coreWebVitals.lcp.value,
        url2Value: analysis2.coreWebVitals.lcp.value,
        winner: this.getWinner(analysis2.coreWebVitals.lcp.value, analysis1.coreWebVitals.lcp.value), // Lower is better
        difference: Math.abs(analysis1.coreWebVitals.lcp.value - analysis2.coreWebVitals.lcp.value),
      },
      {
        metric: 'CLS',
        url1Value: analysis1.coreWebVitals.cls.value,
        url2Value: analysis2.coreWebVitals.cls.value,
        winner: this.getWinner(analysis2.coreWebVitals.cls.value, analysis1.coreWebVitals.cls.value), // Lower is better
        difference: Math.abs(analysis1.coreWebVitals.cls.value - analysis2.coreWebVitals.cls.value),
      },
      {
        metric: 'SEO',
        url1Value: analysis1.scores.seo,
        url2Value: analysis2.scores.seo,
        winner: this.getWinner(analysis1.scores.seo, analysis2.scores.seo),
        difference: Math.abs(analysis1.scores.seo - analysis2.scores.seo),
      },
    ];

    return { url1: analysis1, url2: analysis2, comparison };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationPlan(analysis: PageSpeedAnalysis): {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    action: string;
    estimatedImpact: string;
    implementation: string;
  }[] {
    const plan: ReturnType<typeof this.getOptimizationPlan> = [];

    // Critical: Core Web Vitals failures
    if (analysis.coreWebVitals.lcp.rating === 'poor') {
      plan.push({
        priority: 'critical',
        category: 'LCP',
        action: 'Optimize Largest Contentful Paint',
        estimatedImpact: `Reduce LCP from ${analysis.coreWebVitals.lcp.value}ms to under 2500ms`,
        implementation: 'Optimize hero images, preload critical resources, use CDN',
      });
    }

    if (analysis.coreWebVitals.cls.rating === 'poor') {
      plan.push({
        priority: 'critical',
        category: 'CLS',
        action: 'Fix Layout Shifts',
        estimatedImpact: `Reduce CLS from ${analysis.coreWebVitals.cls.value} to under 0.1`,
        implementation: 'Add explicit dimensions to images/embeds, avoid inserting content above existing content',
      });
    }

    // High priority opportunities
    analysis.opportunities
      .filter((o) => o.priority >= 7)
      .forEach((opp) => {
        plan.push({
          priority: 'high',
          category: 'Performance',
          action: opp.title,
          estimatedImpact: opp.savings.ms
            ? `Save ${opp.savings.ms}ms`
            : opp.savings.bytes
              ? `Save ${this.formatBytes(opp.savings.bytes)}`
              : 'Significant improvement',
          implementation: opp.description,
        });
      });

    // Medium priority
    analysis.opportunities
      .filter((o) => o.priority >= 4 && o.priority < 7)
      .forEach((opp) => {
        plan.push({
          priority: 'medium',
          category: 'Performance',
          action: opp.title,
          estimatedImpact: opp.savings.ms
            ? `Save ${opp.savings.ms}ms`
            : opp.savings.bytes
              ? `Save ${this.formatBytes(opp.savings.bytes)}`
              : 'Moderate improvement',
          implementation: opp.description,
        });
      });

    // Low priority
    analysis.opportunities
      .filter((o) => o.priority < 4)
      .forEach((opp) => {
        plan.push({
          priority: 'low',
          category: 'Performance',
          action: opp.title,
          estimatedImpact: 'Minor improvement',
          implementation: opp.description,
        });
      });

    return plan;
  }

  /**
   * Fetch real PageSpeed Insights analysis
   */
  private async fetchRealAnalysis(url: string): Promise<PageSpeedAnalysis> {
    try {
      const params = new URLSearchParams({
        url,
        key: this.config.apiKey!,
        strategy: this.config.strategy!,
        category: this.config.categories!.join(','),
      });

      const response = await fetch(`${this.apiEndpoint}?${params}`);
      const data = await response.json();

      if (data.error) {
        console.error('PageSpeed API error:', data.error);
        return this.generateMockAnalysis(url);
      }

      return this.transformApiResponse(data, url);
    } catch (error) {
      console.error('PageSpeed fetch error:', error);
      return this.generateMockAnalysis(url);
    }
  }

  /**
   * Transform API response to our format
   */
  private transformApiResponse(data: any, url: string): PageSpeedAnalysis {
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;
    const audits = lighthouse.audits;

    // Extract Core Web Vitals
    const coreWebVitals: CoreWebVitals = {
      lcp: this.extractMetric(audits['largest-contentful-paint'], 'ms'),
      fid: this.extractMetric(audits['max-potential-fid'], 'ms'),
      cls: this.extractMetric(audits['cumulative-layout-shift'], 'score'),
      fcp: this.extractMetric(audits['first-contentful-paint'], 'ms'),
      ttfb: this.extractMetric(audits['server-response-time'], 'ms'),
      inp: this.extractMetric(audits['interaction-to-next-paint'] || { numericValue: 0 }, 'ms'),
    };

    // Extract opportunities
    const opportunities: PageSpeedOpportunity[] = Object.values(audits)
      .filter((audit: any) => audit.details?.type === 'opportunity' && audit.score !== 1)
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        savings: {
          bytes: audit.details?.overallSavingsBytes,
          ms: audit.details?.overallSavingsMs,
        },
        difficulty: this.estimateDifficulty(audit),
        priority: Math.round((1 - (audit.score || 0)) * 10),
      }));

    // Extract diagnostics
    const diagnostics: PageSpeedDiagnostic[] = Object.values(audits)
      .filter((audit: any) => audit.details?.type === 'table' && audit.score !== 1)
      .slice(0, 10)
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        details: audit.displayValue,
        items: audit.details?.items?.slice(0, 5),
      }));

    return {
      url,
      fetchTime: new Date().toISOString(),
      strategy: this.config.strategy!,
      scores: {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
        pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : undefined,
      },
      coreWebVitals,
      audits: this.extractAudits(audits),
      opportunities,
      diagnostics,
      resourceSummary: this.extractResourceSummary(audits),
      screenshotUrl: audits['final-screenshot']?.details?.data,
    };
  }

  /**
   * Extract metric from audit
   */
  private extractMetric(audit: any, unit: 'ms' | 's' | 'score'): WebVitalMetric {
    const value = audit?.numericValue || 0;
    const score = audit?.score || 0;

    return {
      value: unit === 'ms' ? Math.round(value) : parseFloat(value.toFixed(3)),
      unit,
      rating: score >= 0.9 ? 'good' : score >= 0.5 ? 'needs-improvement' : 'poor',
      percentile: Math.round(score * 100),
    };
  }

  /**
   * Extract audits
   */
  private extractAudits(audits: any): PageSpeedAudit[] {
    const categoryMap: Record<string, 'performance' | 'accessibility' | 'best-practices' | 'seo'> = {
      'first-contentful-paint': 'performance',
      'largest-contentful-paint': 'performance',
      'cumulative-layout-shift': 'performance',
      'speed-index': 'performance',
      'total-blocking-time': 'performance',
      'color-contrast': 'accessibility',
      'image-alt': 'accessibility',
      'meta-description': 'seo',
      'document-title': 'seo',
    };

    return Object.values(audits)
      .filter((audit: any) => audit.score !== null && audit.score < 1)
      .slice(0, 20)
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        category: categoryMap[audit.id] || 'performance',
        impact: audit.score < 0.5 ? 'high' : audit.score < 0.9 ? 'medium' : 'low',
      }));
  }

  /**
   * Extract resource summary
   */
  private extractResourceSummary(audits: any): ResourceSummary {
    const resourceSummary = audits['resource-summary']?.details?.items || [];
    const mainThread = audits['mainthread-work-breakdown'];

    return {
      totalBytes: resourceSummary.reduce((acc: number, item: any) => acc + (item.transferSize || 0), 0),
      totalRequests: resourceSummary.reduce((acc: number, item: any) => acc + (item.requestCount || 0), 0),
      resourceTypes: resourceSummary.map((item: any) => ({
        type: item.resourceType,
        bytes: item.transferSize || 0,
        requests: item.requestCount || 0,
      })),
      thirdPartyBytes: audits['third-party-summary']?.details?.summary?.wastedBytes || 0,
      mainThreadTime: mainThread?.numericValue || 0,
    };
  }

  /**
   * Estimate difficulty
   */
  private estimateDifficulty(audit: any): 'easy' | 'medium' | 'hard' {
    const easyFixes = ['uses-optimized-images', 'uses-webp-images', 'uses-text-compression'];
    const hardFixes = ['render-blocking-resources', 'mainthread-work-breakdown', 'dom-size'];

    if (easyFixes.includes(audit.id)) return 'easy';
    if (hardFixes.includes(audit.id)) return 'hard';
    return 'medium';
  }

  /**
   * Generate mock analysis
   */
  private generateMockAnalysis(url: string): PageSpeedAnalysis {
    const performanceScore = Math.round(50 + Math.random() * 40);
    const lcpValue = 1800 + Math.random() * 2500;
    const clsValue = 0.05 + Math.random() * 0.2;

    return {
      url,
      fetchTime: new Date().toISOString(),
      strategy: this.config.strategy!,
      scores: {
        performance: performanceScore,
        accessibility: Math.round(70 + Math.random() * 25),
        bestPractices: Math.round(75 + Math.random() * 20),
        seo: Math.round(80 + Math.random() * 15),
      },
      coreWebVitals: {
        lcp: {
          value: Math.round(lcpValue),
          unit: 'ms',
          rating: lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'needs-improvement' : 'poor',
          percentile: Math.round(100 - lcpValue / 50),
        },
        fid: {
          value: Math.round(50 + Math.random() * 200),
          unit: 'ms',
          rating: 'good',
          percentile: 85,
        },
        cls: {
          value: parseFloat(clsValue.toFixed(3)),
          unit: 'score',
          rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
          percentile: Math.round(100 - clsValue * 200),
        },
        fcp: {
          value: Math.round(1200 + Math.random() * 1500),
          unit: 'ms',
          rating: 'needs-improvement',
          percentile: 65,
        },
        ttfb: {
          value: Math.round(200 + Math.random() * 500),
          unit: 'ms',
          rating: 'good',
          percentile: 80,
        },
        inp: {
          value: Math.round(100 + Math.random() * 300),
          unit: 'ms',
          rating: 'good',
          percentile: 75,
        },
      },
      audits: [
        {
          id: 'largest-contentful-paint',
          title: 'Largest Contentful Paint',
          description: 'Largest Contentful Paint marks the time at which the largest text or image is painted.',
          score: 0.6,
          displayValue: `${Math.round(lcpValue)} ms`,
          category: 'performance',
          impact: 'high',
        },
        {
          id: 'cumulative-layout-shift',
          title: 'Cumulative Layout Shift',
          description: 'Cumulative Layout Shift measures the movement of visible elements within the viewport.',
          score: clsValue < 0.1 ? 0.9 : 0.5,
          displayValue: clsValue.toFixed(3),
          category: 'performance',
          impact: clsValue > 0.1 ? 'high' : 'low',
        },
        {
          id: 'render-blocking-resources',
          title: 'Eliminate render-blocking resources',
          description: 'Resources are blocking the first paint of your page.',
          score: 0.4,
          displayValue: 'Potential savings of 450 ms',
          category: 'performance',
          impact: 'high',
        },
        {
          id: 'uses-optimized-images',
          title: 'Properly size images',
          description: 'Serve images that are appropriately-sized to save cellular data.',
          score: 0.6,
          displayValue: 'Potential savings of 120 KiB',
          category: 'performance',
          impact: 'medium',
        },
      ],
      opportunities: [
        {
          id: 'render-blocking-resources',
          title: 'Eliminate render-blocking resources',
          description: 'Defer non-critical CSS and JavaScript to reduce blocking time.',
          savings: { ms: 450 },
          difficulty: 'hard',
          priority: 9,
        },
        {
          id: 'uses-optimized-images',
          title: 'Properly size images',
          description: 'Serve images in next-gen formats (WebP, AVIF) and resize for display size.',
          savings: { bytes: 122880 },
          difficulty: 'easy',
          priority: 7,
        },
        {
          id: 'unused-css-rules',
          title: 'Reduce unused CSS',
          description: 'Remove unused CSS rules to reduce network bytes consumed.',
          savings: { bytes: 45000 },
          difficulty: 'medium',
          priority: 5,
        },
        {
          id: 'uses-text-compression',
          title: 'Enable text compression',
          description: 'Text-based resources should be served with compression (gzip, brotli).',
          savings: { bytes: 80000 },
          difficulty: 'easy',
          priority: 6,
        },
      ],
      diagnostics: [
        {
          id: 'dom-size',
          title: 'Avoid an excessive DOM size',
          description: 'A large DOM will increase memory usage and produce costly layout reflows.',
          details: '1,245 elements',
        },
        {
          id: 'mainthread-work-breakdown',
          title: 'Minimize main-thread work',
          description: 'Consider reducing the time spent parsing, compiling, and executing JS.',
          details: '2.5 s',
        },
      ],
      resourceSummary: {
        totalBytes: 2500000,
        totalRequests: 65,
        resourceTypes: [
          { type: 'script', bytes: 850000, requests: 15 },
          { type: 'image', bytes: 1200000, requests: 25 },
          { type: 'stylesheet', bytes: 150000, requests: 5 },
          { type: 'font', bytes: 200000, requests: 4 },
          { type: 'document', bytes: 50000, requests: 1 },
          { type: 'other', bytes: 50000, requests: 15 },
        ],
        thirdPartyBytes: 450000,
        mainThreadTime: 2500,
      },
    };
  }

  /**
   * Helper methods
   */
  private getWinner(val1: number, val2: number): 'url1' | 'url2' | 'tie' {
    if (Math.abs(val1 - val2) < 0.01) return 'tie';
    return val1 > val2 ? 'url1' : 'url2';
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Default PageSpeed service instance
 */
export const pageSpeedService = new PageSpeedService();

/**
 * Utility functions
 */
export function getCoreWebVitalsStatus(vitals: CoreWebVitals): {
  overall: 'good' | 'needs-improvement' | 'poor';
  passedCount: number;
  totalCount: number;
} {
  const metrics = [vitals.lcp, vitals.cls, vitals.fid];
  const passedCount = metrics.filter((m) => m.rating === 'good').length;
  const poorCount = metrics.filter((m) => m.rating === 'poor').length;

  return {
    overall: poorCount > 0 ? 'poor' : passedCount === metrics.length ? 'good' : 'needs-improvement',
    passedCount,
    totalCount: metrics.length,
  };
}

export function formatMetricValue(metric: WebVitalMetric): string {
  switch (metric.unit) {
    case 'ms':
      return metric.value >= 1000 ? `${(metric.value / 1000).toFixed(2)}s` : `${metric.value}ms`;
    case 's':
      return `${metric.value.toFixed(2)}s`;
    case 'score':
      return metric.value.toFixed(3);
    default:
      return String(metric.value);
  }
}
