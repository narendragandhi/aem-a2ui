/**
 * Backlink Analysis Service
 * Analyze backlink profile and link building opportunities
 */

export interface Backlink {
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  spamScore: number;
  isDoFollow: boolean;
  isNoFollow: boolean;
  firstSeen: string;
  lastSeen: string;
  linkType: 'text' | 'image' | 'redirect' | 'canonical';
}

export interface BacklinkProfile {
  totalBacklinks: number;
  uniqueDomains: number;
  doFollowLinks: number;
  noFollowLinks: number;
  domainAuthority: number;
  pageAuthority: number;
  spamScore: number;
  topBacklinks: Backlink[];
  anchorTextDistribution: AnchorTextAnalysis;
  linkTypeDistribution: Record<string, number>;
  newLinks30Days: number;
  lostLinks30Days: number;
  linkVelocity: number;
  topLinkingDomains: DomainStats[];
}

export interface AnchorTextAnalysis {
  branded: number;
  exact: number;
  partial: number;
  naked: number;
  generic: number;
  topAnchors: Array<{ text: string; count: number; percentage: number }>;
}

export interface DomainStats {
  domain: string;
  domainAuthority: number;
  linkCount: number;
  doFollowCount: number;
  topPages: string[];
}

export interface LinkBuildingOpportunity {
  type: 'guest_post' | 'resource_page' | 'broken_link' | 'competitor_link' | 'mention' | 'directory';
  domain: string;
  url: string;
  domainAuthority: number;
  difficulty: 'easy' | 'medium' | 'hard';
  reason: string;
  outreachTemplate?: string;
}

export interface CompetitorBacklinkGap {
  domain: string;
  linkCount: number;
  exclusiveLinks: number;
  sharedLinks: number;
  gapOpportunities: LinkBuildingOpportunity[];
}

export interface BacklinkApiConfig {
  provider: 'ahrefs' | 'moz' | 'majestic' | 'semrush' | 'mock';
  apiKey?: string;
}

/**
 * Backlink Analyzer Service
 */
export class BacklinkAnalyzerService {
  private config: BacklinkApiConfig;

  constructor(config: BacklinkApiConfig = { provider: 'mock' }) {
    this.config = config;
  }

  /**
   * Get backlink profile for a domain
   */
  async getBacklinkProfile(domain: string): Promise<BacklinkProfile> {
    switch (this.config.provider) {
      case 'ahrefs':
        return this.fetchAhrefsProfile(domain);
      case 'moz':
        return this.fetchMozProfile(domain);
      case 'majestic':
        return this.fetchMajesticProfile(domain);
      case 'semrush':
        return this.fetchSemrushProfile(domain);
      default:
        return this.generateMockProfile(domain);
    }
  }

  /**
   * Get backlinks for a specific URL
   */
  async getBacklinksForUrl(url: string, limit = 100): Promise<Backlink[]> {
    if (this.config.provider !== 'mock' && this.config.apiKey) {
      // Would call real API here
    }
    return this.generateMockBacklinks(url, limit);
  }

  /**
   * Analyze competitor backlink gap
   */
  async analyzeCompetitorGap(
    yourDomain: string,
    competitorDomains: string[]
  ): Promise<CompetitorBacklinkGap[]> {
    const gaps: CompetitorBacklinkGap[] = [];

    for (const competitor of competitorDomains) {
      const competitorProfile = await this.getBacklinkProfile(competitor);
      const yourProfile = await this.getBacklinkProfile(yourDomain);

      // Find domains linking to competitor but not to you
      const competitorDomains = new Set(
        competitorProfile.topLinkingDomains.map(d => d.domain)
      );
      const yourDomains = new Set(
        yourProfile.topLinkingDomains.map(d => d.domain)
      );

      const exclusiveDomains = [...competitorDomains].filter(d => !yourDomains.has(d));
      const sharedDomains = [...competitorDomains].filter(d => yourDomains.has(d));

      const opportunities: LinkBuildingOpportunity[] = exclusiveDomains.slice(0, 10).map(domain => ({
        type: 'competitor_link',
        domain,
        url: `https://${domain}`,
        domainAuthority: Math.round(30 + Math.random() * 50),
        difficulty: Math.random() > 0.6 ? 'easy' : Math.random() > 0.3 ? 'medium' : 'hard',
        reason: `Links to ${competitor} but not to you`,
        outreachTemplate: this.generateOutreachTemplate(domain, competitor),
      }));

      gaps.push({
        domain: competitor,
        linkCount: competitorProfile.totalBacklinks,
        exclusiveLinks: exclusiveDomains.length,
        sharedLinks: sharedDomains.length,
        gapOpportunities: opportunities,
      });
    }

    return gaps;
  }

  /**
   * Find link building opportunities
   */
  async findLinkOpportunities(
    domain: string,
    niche: string
  ): Promise<LinkBuildingOpportunity[]> {
    const opportunities: LinkBuildingOpportunity[] = [];

    // Resource page opportunities
    opportunities.push({
      type: 'resource_page',
      domain: `${niche}-resources.com`,
      url: `https://${niche}-resources.com/best-tools`,
      domainAuthority: 45,
      difficulty: 'medium',
      reason: 'Curated resource page in your niche',
      outreachTemplate: this.generateResourcePageTemplate(domain, niche),
    });

    // Guest post opportunities
    opportunities.push({
      type: 'guest_post',
      domain: `${niche}-blog.com`,
      url: `https://${niche}-blog.com/write-for-us`,
      domainAuthority: 55,
      difficulty: 'medium',
      reason: 'Accepts guest contributions',
      outreachTemplate: this.generateGuestPostTemplate(domain, niche),
    });

    // Directory listings
    opportunities.push({
      type: 'directory',
      domain: 'industry-directory.com',
      url: 'https://industry-directory.com/submit',
      domainAuthority: 40,
      difficulty: 'easy',
      reason: 'Niche-specific directory',
    });

    // Broken link opportunities (mock)
    opportunities.push({
      type: 'broken_link',
      domain: 'popular-blog.com',
      url: 'https://popular-blog.com/old-article',
      domainAuthority: 60,
      difficulty: 'medium',
      reason: 'Broken link to similar content',
      outreachTemplate: this.generateBrokenLinkTemplate(domain),
    });

    // Unlinked mentions
    opportunities.push({
      type: 'mention',
      domain: 'news-site.com',
      url: 'https://news-site.com/industry-article',
      domainAuthority: 70,
      difficulty: 'easy',
      reason: 'Mentions your brand without linking',
      outreachTemplate: this.generateMentionTemplate(domain),
    });

    return opportunities;
  }

  /**
   * Analyze anchor text health
   */
  analyzeAnchorTextHealth(profile: BacklinkProfile): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const { anchorTextDistribution } = profile;

    // Check for over-optimization
    if (anchorTextDistribution.exact > 30) {
      issues.push('Over-optimized anchor text (too many exact match)');
      recommendations.push('Diversify anchor text with branded and generic links');
      score -= 20;
    }

    // Check branded ratio
    if (anchorTextDistribution.branded < 20) {
      issues.push('Low branded anchor text ratio');
      recommendations.push('Build more links with brand name as anchor');
      score -= 10;
    }

    // Check generic ratio
    if (anchorTextDistribution.generic > 40) {
      issues.push('Too many generic anchors (click here, read more)');
      recommendations.push('Use more descriptive anchor text');
      score -= 10;
    }

    // Check naked URLs
    if (anchorTextDistribution.naked > 25) {
      issues.push('High ratio of naked URL links');
      score -= 5;
    }

    if (issues.length === 0) {
      recommendations.push('Anchor text distribution looks healthy');
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  /**
   * Calculate link velocity trend
   */
  calculateLinkVelocity(profile: BacklinkProfile): {
    trend: 'growing' | 'stable' | 'declining';
    monthlyAverage: number;
    recommendation: string;
  } {
    const netChange = profile.newLinks30Days - profile.lostLinks30Days;

    if (netChange > 10) {
      return {
        trend: 'growing',
        monthlyAverage: profile.newLinks30Days,
        recommendation: 'Link velocity is healthy. Continue current strategy.',
      };
    } else if (netChange > -5) {
      return {
        trend: 'stable',
        monthlyAverage: profile.newLinks30Days,
        recommendation: 'Link acquisition is stable. Consider increasing outreach.',
      };
    } else {
      return {
        trend: 'declining',
        monthlyAverage: profile.newLinks30Days,
        recommendation: 'Losing links faster than acquiring. Investigate lost links and increase link building efforts.',
      };
    }
  }

  // API implementations (would be real in production)

  private async fetchAhrefsProfile(domain: string): Promise<BacklinkProfile> {
    if (!this.config.apiKey) {
      return this.generateMockProfile(domain);
    }

    try {
      const response = await fetch(
        `https://apiv2.ahrefs.com?token=${this.config.apiKey}&target=${domain}&mode=domain&output=json`,
        { method: 'GET' }
      );
      const data = await response.json();
      // Transform Ahrefs response to our format
      return this.transformAhrefsResponse(data);
    } catch (error) {
      console.error('Ahrefs API error:', error);
      return this.generateMockProfile(domain);
    }
  }

  private async fetchMozProfile(domain: string): Promise<BacklinkProfile> {
    return this.generateMockProfile(domain);
  }

  private async fetchMajesticProfile(domain: string): Promise<BacklinkProfile> {
    return this.generateMockProfile(domain);
  }

  private async fetchSemrushProfile(domain: string): Promise<BacklinkProfile> {
    return this.generateMockProfile(domain);
  }

  private transformAhrefsResponse(data: any): BacklinkProfile {
    // Would transform real Ahrefs API response
    return this.generateMockProfile('transformed.com');
  }

  /**
   * Generate mock backlink profile
   */
  private generateMockProfile(domain: string): BacklinkProfile {
    const totalBacklinks = Math.round(1000 + Math.random() * 50000);
    const uniqueDomains = Math.round(totalBacklinks * 0.15);

    return {
      totalBacklinks,
      uniqueDomains,
      doFollowLinks: Math.round(totalBacklinks * 0.7),
      noFollowLinks: Math.round(totalBacklinks * 0.3),
      domainAuthority: Math.round(20 + Math.random() * 60),
      pageAuthority: Math.round(15 + Math.random() * 50),
      spamScore: Math.round(Math.random() * 20),
      topBacklinks: this.generateMockBacklinks(`https://${domain}`, 10),
      anchorTextDistribution: {
        branded: Math.round(20 + Math.random() * 20),
        exact: Math.round(10 + Math.random() * 15),
        partial: Math.round(15 + Math.random() * 20),
        naked: Math.round(10 + Math.random() * 15),
        generic: Math.round(15 + Math.random() * 20),
        topAnchors: [
          { text: domain, count: 150, percentage: 25 },
          { text: 'click here', count: 80, percentage: 13 },
          { text: `https://${domain}`, count: 60, percentage: 10 },
          { text: 'learn more', count: 45, percentage: 8 },
          { text: 'official site', count: 30, percentage: 5 },
        ],
      },
      linkTypeDistribution: {
        text: 75,
        image: 15,
        redirect: 7,
        canonical: 3,
      },
      newLinks30Days: Math.round(50 + Math.random() * 200),
      lostLinks30Days: Math.round(20 + Math.random() * 80),
      linkVelocity: Math.round(30 + Math.random() * 120),
      topLinkingDomains: this.generateMockLinkingDomains(10),
    };
  }

  /**
   * Generate mock backlinks
   */
  private generateMockBacklinks(targetUrl: string, count: number): Backlink[] {
    const domains = [
      'techblog.com', 'industry-news.org', 'marketing-weekly.com',
      'digital-trends.io', 'business-insider.net', 'startup-hub.co',
      'innovation-daily.com', 'tech-review.org', 'web-magazine.io',
      'online-journal.net'
    ];

    const anchors = [
      'click here', 'learn more', 'visit site', 'read more',
      'official website', 'check it out', 'see details', 'discover more'
    ];

    return Array.from({ length: count }, (_, i) => {
      const domain = domains[i % domains.length];
      return {
        sourceUrl: `https://${domain}/article-${i + 1}`,
        sourceDomain: domain,
        targetUrl,
        anchorText: anchors[i % anchors.length],
        domainAuthority: Math.round(30 + Math.random() * 50),
        pageAuthority: Math.round(20 + Math.random() * 40),
        spamScore: Math.round(Math.random() * 10),
        isDoFollow: Math.random() > 0.3,
        isNoFollow: Math.random() <= 0.3,
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date().toISOString(),
        linkType: 'text' as const,
      };
    });
  }

  /**
   * Generate mock linking domains
   */
  private generateMockLinkingDomains(count: number): DomainStats[] {
    const domains = [
      'news-site.com', 'industry-blog.org', 'tech-publication.com',
      'business-journal.net', 'startup-news.io', 'digital-magazine.com',
      'web-weekly.org', 'innovation-hub.net', 'trends-daily.com',
      'market-watch.io'
    ];

    return Array.from({ length: count }, (_, i) => ({
      domain: domains[i % domains.length],
      domainAuthority: Math.round(40 + Math.random() * 40),
      linkCount: Math.round(1 + Math.random() * 20),
      doFollowCount: Math.round(1 + Math.random() * 15),
      topPages: ['/article-1', '/blog/post-2', '/resources/guide'],
    }));
  }

  // Outreach templates

  private generateOutreachTemplate(domain: string, competitor: string): string {
    return `Subject: Quick question about your ${competitor} link

Hi,

I noticed you linked to ${competitor} in your recent article. We offer a similar (and some would say better!) solution at [Your Site].

Would you consider adding a link to our resource as well? Here's what makes us different:
- [Key differentiator 1]
- [Key differentiator 2]

Happy to provide any additional information you need.

Best regards`;
  }

  private generateResourcePageTemplate(domain: string, niche: string): string {
    return `Subject: Resource suggestion for your ${niche} page

Hi,

I came across your excellent ${niche} resources page and thought our tool at ${domain} would be a great addition.

We help [target audience] with [key benefit], and have been featured in [notable mentions].

Would you consider adding us to your list?

Thanks for your time!`;
  }

  private generateGuestPostTemplate(domain: string, niche: string): string {
    return `Subject: Guest post pitch for your ${niche} blog

Hi,

I'm a [your role] at ${domain} and a regular reader of your blog.

I'd love to contribute a guest post on [topic idea]. Here's a brief outline:
- [Point 1]
- [Point 2]
- [Point 3]

I've previously written for [notable publications].

Would this be of interest?

Best regards`;
  }

  private generateBrokenLinkTemplate(domain: string): string {
    return `Subject: Broken link on your site + replacement suggestion

Hi,

I was reading your article at [article URL] and noticed the link to [broken resource] is no longer working.

We have a similar resource at ${domain} that covers the same topic. Would you consider replacing the broken link with ours?

Here's the link: [your URL]

Thanks for maintaining such a helpful site!`;
  }

  private generateMentionTemplate(domain: string): string {
    return `Subject: Thank you for the mention!

Hi,

I noticed you mentioned ${domain} in your recent article [article URL]. Thank you for the kind words!

I was wondering if you'd be open to adding a link to our site? It would help your readers find us more easily.

Either way, we really appreciate the mention.

Best regards`;
  }
}

/**
 * Default backlink analyzer instance
 */
export const backlinkAnalyzer = new BacklinkAnalyzerService();
