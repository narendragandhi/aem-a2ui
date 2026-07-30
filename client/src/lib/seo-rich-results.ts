/**
 * Rich Results & Schema Validation Service
 * Validates structured data against Google's Rich Results requirements
 */

export interface ValidationResult {
  valid: boolean;
  schemaType: string;
  richResultsEligible: boolean;
  eligibleFeatures: RichResultFeature[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationError {
  property: string;
  message: string;
  severity: 'error' | 'critical';
  path: string;
  documentationUrl?: string;
}

export interface ValidationWarning {
  property: string;
  message: string;
  recommendation: string;
  path: string;
}

export type RichResultFeature =
  | 'search_appearance' // Basic rich result
  | 'breadcrumb' // Breadcrumb trail
  | 'faq' // FAQ accordion
  | 'how_to' // How-to steps
  | 'product' // Product info with price
  | 'review' // Star ratings
  | 'recipe' // Recipe card
  | 'video' // Video thumbnail
  | 'event' // Event details
  | 'job_posting' // Job listing
  | 'local_business' // Local pack
  | 'article' // News/Article
  | 'book' // Book info
  | 'course' // Course info
  | 'dataset' // Dataset
  | 'fact_check' // Fact check
  | 'image_license' // Image license
  | 'movie' // Movie info
  | 'software_app' // App info
  | 'sitelinks_searchbox'; // Site search

export interface RichResultPreview {
  feature: RichResultFeature;
  title: string;
  description: string;
  visualElements: string[];
  searchAppearance: string;
  requirements: string[];
  implementationStatus: 'complete' | 'partial' | 'missing';
}

export interface SchemaRequirement {
  property: string;
  required: boolean;
  type: string;
  description: string;
  example?: string;
  validValues?: string[];
}

/**
 * Schema type requirements database
 */
const SCHEMA_REQUIREMENTS: Record<string, SchemaRequirement[]> = {
  Article: [
    { property: '@type', required: true, type: 'string', description: 'Must be Article, NewsArticle, or BlogPosting' },
    { property: 'headline', required: true, type: 'string', description: 'Article title (max 110 characters)' },
    { property: 'image', required: true, type: 'array|string', description: 'At least one image URL' },
    { property: 'datePublished', required: true, type: 'string', description: 'ISO 8601 date format' },
    { property: 'dateModified', required: false, type: 'string', description: 'ISO 8601 date format' },
    { property: 'author', required: true, type: 'object|array', description: 'Person or Organization' },
    { property: 'author.name', required: true, type: 'string', description: 'Author name' },
    { property: 'publisher', required: false, type: 'object', description: 'Organization publishing the article' },
    { property: 'publisher.name', required: false, type: 'string', description: 'Publisher name' },
    { property: 'publisher.logo', required: false, type: 'object', description: 'Publisher logo (ImageObject)' },
  ],
  Product: [
    { property: '@type', required: true, type: 'string', description: 'Must be Product' },
    { property: 'name', required: true, type: 'string', description: 'Product name' },
    { property: 'image', required: true, type: 'array|string', description: 'Product images' },
    { property: 'description', required: false, type: 'string', description: 'Product description' },
    { property: 'sku', required: false, type: 'string', description: 'Stock keeping unit' },
    { property: 'brand', required: false, type: 'object', description: 'Brand information' },
    { property: 'brand.name', required: false, type: 'string', description: 'Brand name' },
    { property: 'offers', required: true, type: 'object|array', description: 'Product offer/pricing' },
    { property: 'offers.price', required: true, type: 'number', description: 'Product price' },
    { property: 'offers.priceCurrency', required: true, type: 'string', description: 'ISO 4217 currency code' },
    { property: 'offers.availability', required: true, type: 'string', description: 'schema.org availability value' },
    { property: 'aggregateRating', required: false, type: 'object', description: 'Product rating' },
    { property: 'review', required: false, type: 'array', description: 'Product reviews' },
  ],
  FAQPage: [
    { property: '@type', required: true, type: 'string', description: 'Must be FAQPage' },
    { property: 'mainEntity', required: true, type: 'array', description: 'Array of Question items' },
    { property: 'mainEntity[].@type', required: true, type: 'string', description: 'Must be Question' },
    { property: 'mainEntity[].name', required: true, type: 'string', description: 'Question text' },
    { property: 'mainEntity[].acceptedAnswer', required: true, type: 'object', description: 'Answer object' },
    { property: 'mainEntity[].acceptedAnswer.@type', required: true, type: 'string', description: 'Must be Answer' },
    { property: 'mainEntity[].acceptedAnswer.text', required: true, type: 'string', description: 'Answer text' },
  ],
  HowTo: [
    { property: '@type', required: true, type: 'string', description: 'Must be HowTo' },
    { property: 'name', required: true, type: 'string', description: 'Title of the how-to' },
    { property: 'step', required: true, type: 'array', description: 'Array of HowToStep items' },
    { property: 'step[].@type', required: true, type: 'string', description: 'Must be HowToStep' },
    { property: 'step[].text', required: true, type: 'string', description: 'Step instruction text' },
    { property: 'step[].name', required: false, type: 'string', description: 'Step title' },
    { property: 'step[].image', required: false, type: 'string', description: 'Step image URL' },
    { property: 'totalTime', required: false, type: 'string', description: 'ISO 8601 duration' },
    { property: 'estimatedCost', required: false, type: 'object', description: 'Cost information' },
    { property: 'supply', required: false, type: 'array', description: 'Materials needed' },
    { property: 'tool', required: false, type: 'array', description: 'Tools needed' },
  ],
  LocalBusiness: [
    { property: '@type', required: true, type: 'string', description: 'LocalBusiness or more specific type' },
    { property: 'name', required: true, type: 'string', description: 'Business name' },
    { property: 'address', required: true, type: 'object', description: 'PostalAddress object' },
    { property: 'address.streetAddress', required: true, type: 'string', description: 'Street address' },
    { property: 'address.addressLocality', required: true, type: 'string', description: 'City' },
    { property: 'address.addressRegion', required: true, type: 'string', description: 'State/Region' },
    { property: 'address.postalCode', required: true, type: 'string', description: 'Postal/ZIP code' },
    { property: 'address.addressCountry', required: true, type: 'string', description: 'Country' },
    { property: 'telephone', required: false, type: 'string', description: 'Phone number' },
    { property: 'openingHoursSpecification', required: false, type: 'array', description: 'Business hours' },
    { property: 'geo', required: false, type: 'object', description: 'Geographic coordinates' },
    { property: 'image', required: false, type: 'array', description: 'Business images' },
    { property: 'priceRange', required: false, type: 'string', description: 'Price range ($ to $$$$)' },
  ],
  Event: [
    { property: '@type', required: true, type: 'string', description: 'Must be Event' },
    { property: 'name', required: true, type: 'string', description: 'Event name' },
    { property: 'startDate', required: true, type: 'string', description: 'ISO 8601 date/time' },
    { property: 'endDate', required: false, type: 'string', description: 'ISO 8601 date/time' },
    { property: 'location', required: true, type: 'object', description: 'Place or VirtualLocation' },
    { property: 'location.name', required: true, type: 'string', description: 'Venue name' },
    { property: 'location.address', required: true, type: 'object|string', description: 'Venue address' },
    { property: 'description', required: false, type: 'string', description: 'Event description' },
    { property: 'image', required: false, type: 'array', description: 'Event images' },
    { property: 'performer', required: false, type: 'object|array', description: 'Performer(s)' },
    { property: 'organizer', required: false, type: 'object', description: 'Event organizer' },
    { property: 'offers', required: false, type: 'object|array', description: 'Ticket information' },
    {
      property: 'eventStatus',
      required: false,
      type: 'string',
      description: 'Event status',
      validValues: ['EventScheduled', 'EventCancelled', 'EventPostponed', 'EventRescheduled'],
    },
    {
      property: 'eventAttendanceMode',
      required: false,
      type: 'string',
      description: 'Attendance mode',
      validValues: ['OfflineEventAttendanceMode', 'OnlineEventAttendanceMode', 'MixedEventAttendanceMode'],
    },
  ],
  VideoObject: [
    { property: '@type', required: true, type: 'string', description: 'Must be VideoObject' },
    { property: 'name', required: true, type: 'string', description: 'Video title' },
    { property: 'description', required: true, type: 'string', description: 'Video description' },
    { property: 'thumbnailUrl', required: true, type: 'array|string', description: 'Thumbnail image(s)' },
    { property: 'uploadDate', required: true, type: 'string', description: 'ISO 8601 date' },
    { property: 'duration', required: false, type: 'string', description: 'ISO 8601 duration' },
    { property: 'contentUrl', required: false, type: 'string', description: 'Video file URL' },
    { property: 'embedUrl', required: false, type: 'string', description: 'Embed player URL' },
    { property: 'interactionStatistic', required: false, type: 'object', description: 'View count' },
  ],
  BreadcrumbList: [
    { property: '@type', required: true, type: 'string', description: 'Must be BreadcrumbList' },
    { property: 'itemListElement', required: true, type: 'array', description: 'Array of ListItem' },
    { property: 'itemListElement[].@type', required: true, type: 'string', description: 'Must be ListItem' },
    {
      property: 'itemListElement[].position',
      required: true,
      type: 'number',
      description: 'Position in breadcrumb (1-indexed)',
    },
    { property: 'itemListElement[].name', required: true, type: 'string', description: 'Breadcrumb text' },
    {
      property: 'itemListElement[].item',
      required: false,
      type: 'string',
      description: 'URL (not required for last item)',
    },
  ],
  Organization: [
    { property: '@type', required: true, type: 'string', description: 'Organization or more specific type' },
    { property: 'name', required: true, type: 'string', description: 'Organization name' },
    { property: 'url', required: true, type: 'string', description: 'Organization website' },
    { property: 'logo', required: true, type: 'string|object', description: 'Organization logo' },
    { property: 'contactPoint', required: false, type: 'object|array', description: 'Contact information' },
    { property: 'sameAs', required: false, type: 'array', description: 'Social media profile URLs' },
  ],
  WebPage: [
    { property: '@type', required: true, type: 'string', description: 'WebPage or more specific type' },
    { property: 'name', required: true, type: 'string', description: 'Page title' },
    { property: 'description', required: false, type: 'string', description: 'Page description' },
    { property: 'url', required: false, type: 'string', description: 'Page URL' },
  ],
};

/**
 * Rich Results Validator Service
 */
export class RichResultsValidator {
  /**
   * Validate schema against Google Rich Results requirements
   */
  validate(schema: Record<string, unknown>): ValidationResult {
    const schemaType = this.getSchemaType(schema);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Check required @context
    if (!schema['@context']) {
      errors.push({
        property: '@context',
        message: 'Missing @context property',
        severity: 'critical',
        path: '@context',
        documentationUrl: 'https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data',
      });
    } else if (schema['@context'] !== 'https://schema.org') {
      warnings.push({
        property: '@context',
        message: '@context should be "https://schema.org"',
        recommendation: 'Use the canonical schema.org URL',
        path: '@context',
      });
    }

    // Check @type
    if (!schema['@type']) {
      errors.push({
        property: '@type',
        message: 'Missing @type property',
        severity: 'critical',
        path: '@type',
      });
    }

    // Validate against schema requirements
    const requirements = SCHEMA_REQUIREMENTS[schemaType] || [];
    for (const req of requirements) {
      const value = this.getNestedValue(schema, req.property);

      if (req.required && (value === undefined || value === null || value === '')) {
        errors.push({
          property: req.property,
          message: `Missing required property: ${req.property}`,
          severity: 'error',
          path: req.property,
          documentationUrl: this.getDocumentationUrl(schemaType),
        });
      }

      // Type validation
      if (value !== undefined && !this.validateType(value, req.type)) {
        warnings.push({
          property: req.property,
          message: `Property ${req.property} has incorrect type. Expected ${req.type}`,
          recommendation: req.description,
          path: req.property,
        });
      }

      // Valid values check
      if (value && req.validValues && !req.validValues.includes(value as string)) {
        warnings.push({
          property: req.property,
          message: `Property ${req.property} has invalid value: ${value}`,
          recommendation: `Valid values: ${req.validValues.join(', ')}`,
          path: req.property,
        });
      }
    }

    // Schema-specific validations
    this.validateSchemaSpecific(schema, schemaType, errors, warnings, recommendations);

    // Determine eligible features
    const eligibleFeatures = this.getEligibleFeatures(schema, schemaType, errors);

    return {
      valid: errors.filter((e) => e.severity === 'critical').length === 0,
      schemaType,
      richResultsEligible: errors.length === 0 && eligibleFeatures.length > 0,
      eligibleFeatures,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Get rich results preview
   */
  getPreview(schema: Record<string, unknown>): RichResultPreview[] {
    const schemaType = this.getSchemaType(schema);
    const validation = this.validate(schema);
    const previews: RichResultPreview[] = [];

    for (const feature of validation.eligibleFeatures) {
      previews.push(this.generatePreview(schema, schemaType, feature, validation));
    }

    return previews;
  }

  /**
   * Generate enhanced schema with Google recommendations
   */
  enhanceSchema(schema: Record<string, unknown>): {
    enhanced: Record<string, unknown>;
    addedProperties: string[];
    suggestions: string[];
  } {
    const enhanced = { ...schema };
    const addedProperties: string[] = [];
    const suggestions: string[] = [];
    const schemaType = this.getSchemaType(schema);

    // Add missing recommended properties
    if (schemaType === 'Article') {
      if (!enhanced['dateModified']) {
        enhanced['dateModified'] = enhanced['datePublished'] || new Date().toISOString();
        addedProperties.push('dateModified');
      }
      if (!enhanced['mainEntityOfPage']) {
        suggestions.push('Add mainEntityOfPage with the canonical URL');
      }
      if (!(enhanced['publisher'] as Record<string, unknown> | undefined)?.['logo']) {
        suggestions.push('Add publisher logo for better article appearance');
      }
    }

    if (schemaType === 'Product') {
      if (!enhanced['aggregateRating']) {
        suggestions.push('Add aggregateRating for star ratings in search results');
      }
      if (!enhanced['review']) {
        suggestions.push('Add at least one review for rich review snippets');
      }
      if (!enhanced['brand']) {
        suggestions.push('Add brand information for better product matching');
      }
    }

    if (schemaType === 'LocalBusiness') {
      if (!enhanced['geo']) {
        suggestions.push('Add geo coordinates for local pack eligibility');
      }
      if (!enhanced['openingHoursSpecification']) {
        suggestions.push('Add opening hours for enhanced local listing');
      }
      if (!enhanced['image']) {
        suggestions.push('Add business images for better local pack appearance');
      }
    }

    return { enhanced, addedProperties, suggestions };
  }

  /**
   * Test schema against Google's Rich Results Test
   */
  async testWithGoogle(schema: Record<string, unknown>): Promise<{
    success: boolean;
    renderableItems: number;
    errors: string[];
    warnings: string[];
    detectedTypes: string[];
  }> {
    // In production, this would call Google's Rich Results Test API
    // For now, we simulate the response based on our validation
    const validation = this.validate(schema);

    return {
      success: validation.valid && validation.richResultsEligible,
      renderableItems: validation.eligibleFeatures.length,
      errors: validation.errors.map((e) => e.message),
      warnings: validation.warnings.map((w) => w.message),
      detectedTypes: [validation.schemaType],
    };
  }

  // Private methods

  private getSchemaType(schema: Record<string, unknown>): string {
    const type = schema['@type'];
    if (Array.isArray(type)) {
      return type[0] as string;
    }
    return (type as string) || 'Unknown';
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.replace(/\[\]/g, '.0').split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private validateType(value: unknown, expectedType: string): boolean {
    const types = expectedType.split('|');

    for (const type of types) {
      switch (type.trim()) {
        case 'string':
          if (typeof value === 'string') return true;
          break;
        case 'number':
          if (typeof value === 'number') return true;
          break;
        case 'array':
          if (Array.isArray(value)) return true;
          break;
        case 'object':
          if (typeof value === 'object' && !Array.isArray(value) && value !== null) return true;
          break;
      }
    }

    return false;
  }

  private validateSchemaSpecific(
    schema: Record<string, unknown>,
    schemaType: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    recommendations: string[],
  ): void {
    switch (schemaType) {
      case 'Article':
        // Headline length check
        const headline = schema['headline'] as string;
        if (headline && headline.length > 110) {
          warnings.push({
            property: 'headline',
            message: `Headline is ${headline.length} characters, should be under 110`,
            recommendation: 'Shorten headline for better display in search results',
            path: 'headline',
          });
        }

        // Image requirements
        const images = schema['image'];
        if (images) {
          recommendations.push('Ensure images are at least 1200px wide for AMP stories');
        }
        break;

      case 'Product':
        // Price validation
        const offers = schema['offers'] as Record<string, unknown>;
        if (offers) {
          const price = offers['price'];
          if (typeof price === 'string') {
            warnings.push({
              property: 'offers.price',
              message: 'Price should be a number, not a string',
              recommendation: 'Use numeric value without currency symbol',
              path: 'offers.price',
            });
          }

          // Availability URL check
          const availability = offers['availability'] as string;
          if (availability && !availability.startsWith('https://schema.org/')) {
            warnings.push({
              property: 'offers.availability',
              message: 'Availability should use full schema.org URL',
              recommendation: 'Use format: https://schema.org/InStock',
              path: 'offers.availability',
            });
          }
        }
        break;

      case 'FAQPage':
        const mainEntity = schema['mainEntity'] as unknown[];
        if (mainEntity && mainEntity.length < 2) {
          warnings.push({
            property: 'mainEntity',
            message: 'FAQ should have at least 2 questions',
            recommendation: 'Add more questions for better FAQ rich result',
            path: 'mainEntity',
          });
        }
        if (mainEntity && mainEntity.length > 10) {
          recommendations.push('Consider limiting to 10 most important questions for better UX');
        }
        break;

      case 'HowTo':
        const steps = schema['step'] as unknown[];
        if (steps && steps.length < 2) {
          errors.push({
            property: 'step',
            message: 'HowTo must have at least 2 steps',
            severity: 'error',
            path: 'step',
          });
        }
        recommendations.push('Add images to steps for visual how-to rich results');
        break;

      case 'Event':
        const startDate = schema['startDate'] as string;
        if (startDate) {
          const eventDate = new Date(startDate);
          if (eventDate < new Date()) {
            warnings.push({
              property: 'startDate',
              message: 'Event date is in the past',
              recommendation: 'Past events may not show in search results',
              path: 'startDate',
            });
          }
        }
        break;
    }
  }

  private getEligibleFeatures(
    schema: Record<string, unknown>,
    schemaType: string,
    errors: ValidationError[],
  ): RichResultFeature[] {
    if (errors.some((e) => e.severity === 'critical')) {
      return [];
    }

    const featureMap: Record<string, RichResultFeature[]> = {
      Article: ['article', 'search_appearance'],
      Product: ['product', 'review', 'search_appearance'],
      FAQPage: ['faq', 'search_appearance'],
      HowTo: ['how_to', 'search_appearance'],
      LocalBusiness: ['local_business', 'search_appearance'],
      Event: ['event', 'search_appearance'],
      VideoObject: ['video', 'search_appearance'],
      BreadcrumbList: ['breadcrumb'],
      Organization: ['search_appearance'],
      WebPage: ['search_appearance'],
    };

    const features = featureMap[schemaType] || ['search_appearance'];

    // Add review feature if aggregateRating present
    if (schema['aggregateRating'] && !features.includes('review')) {
      features.push('review');
    }

    return features;
  }

  private generatePreview(
    schema: Record<string, unknown>,
    schemaType: string,
    feature: RichResultFeature,
    validation: ValidationResult,
  ): RichResultPreview {
    const previewTemplates: Record<RichResultFeature, Partial<RichResultPreview>> = {
      search_appearance: {
        title: 'Enhanced Search Appearance',
        description: 'Your content will appear with enhanced formatting in search results',
        visualElements: ['Title', 'URL', 'Description'],
      },
      article: {
        title: 'Article Rich Result',
        description: 'Article with headline, image, and publish date',
        visualElements: ['Headline', 'Thumbnail', 'Publisher Logo', 'Publish Date'],
      },
      product: {
        title: 'Product Rich Result',
        description: 'Product with price, availability, and ratings',
        visualElements: ['Product Name', 'Price', 'Availability', 'Rating Stars'],
      },
      faq: {
        title: 'FAQ Accordion',
        description: 'Expandable FAQ questions directly in search results',
        visualElements: ['Question List', 'Expandable Answers'],
      },
      how_to: {
        title: 'How-To Rich Result',
        description: 'Step-by-step instructions with images',
        visualElements: ['Step List', 'Step Images', 'Total Time', 'Materials'],
      },
      local_business: {
        title: 'Local Business Pack',
        description: 'Business listing with map, hours, and contact info',
        visualElements: ['Business Name', 'Address', 'Hours', 'Phone', 'Map Pin'],
      },
      event: {
        title: 'Event Rich Result',
        description: 'Event with date, location, and ticket info',
        visualElements: ['Event Name', 'Date/Time', 'Location', 'Ticket Price'],
      },
      video: {
        title: 'Video Rich Result',
        description: 'Video thumbnail with duration in search results',
        visualElements: ['Video Thumbnail', 'Duration', 'Upload Date'],
      },
      review: {
        title: 'Review Stars',
        description: 'Star rating displayed in search results',
        visualElements: ['Star Rating', 'Review Count'],
      },
      breadcrumb: {
        title: 'Breadcrumb Trail',
        description: 'Navigation path shown instead of URL',
        visualElements: ['Breadcrumb Links'],
      },
      recipe: {
        title: 'Recipe Card',
        description: 'Recipe with image, ratings, and cook time',
        visualElements: ['Recipe Image', 'Rating', 'Cook Time', 'Calories'],
      },
      job_posting: {
        title: 'Job Posting',
        description: 'Job listing with salary and location',
        visualElements: ['Job Title', 'Company', 'Location', 'Salary'],
      },
      course: {
        title: 'Course Info',
        description: 'Course with provider and pricing',
        visualElements: ['Course Name', 'Provider', 'Price'],
      },
      book: {
        title: 'Book Info',
        description: 'Book with author and ratings',
        visualElements: ['Book Title', 'Author', 'Rating'],
      },
      dataset: {
        title: 'Dataset',
        description: 'Dataset with description and download info',
        visualElements: ['Dataset Name', 'Description'],
      },
      fact_check: {
        title: 'Fact Check',
        description: 'Fact check claim and rating',
        visualElements: ['Claim', 'Rating'],
      },
      image_license: {
        title: 'Image License',
        description: 'Image licensing information',
        visualElements: ['License Info'],
      },
      movie: {
        title: 'Movie Info',
        description: 'Movie with cast and ratings',
        visualElements: ['Movie Title', 'Rating', 'Release Date'],
      },
      software_app: {
        title: 'Software App',
        description: 'App with ratings and pricing',
        visualElements: ['App Name', 'Rating', 'Price'],
      },
      sitelinks_searchbox: {
        title: 'Sitelinks Searchbox',
        description: 'Search box in sitelinks',
        visualElements: ['Search Box'],
      },
    };

    const template = previewTemplates[feature] || previewTemplates.search_appearance;
    const missingRequired = validation.errors.filter((e) => e.severity === 'error').length;

    return {
      feature,
      title: template.title || feature,
      description: template.description || '',
      visualElements: template.visualElements || [],
      searchAppearance: this.generateSearchAppearanceHtml(schema, schemaType),
      requirements: SCHEMA_REQUIREMENTS[schemaType]?.filter((r) => r.required).map((r) => r.property) || [],
      implementationStatus: missingRequired === 0 ? 'complete' : missingRequired < 3 ? 'partial' : 'missing',
    };
  }

  private generateSearchAppearanceHtml(schema: Record<string, unknown>, schemaType: string): string {
    const title = (schema['headline'] || schema['name'] || 'Page Title') as string;
    const description = (schema['description'] || 'Page description...') as string;
    const url = (schema['url'] || 'https://example.com/page') as string;

    return `
      <div class="serp-preview">
        <div class="serp-title">${title.substring(0, 60)}${title.length > 60 ? '...' : ''}</div>
        <div class="serp-url">${url}</div>
        <div class="serp-description">${description.substring(0, 160)}${description.length > 160 ? '...' : ''}</div>
      </div>
    `;
  }

  private getDocumentationUrl(schemaType: string): string {
    const docs: Record<string, string> = {
      Article: 'https://developers.google.com/search/docs/appearance/structured-data/article',
      Product: 'https://developers.google.com/search/docs/appearance/structured-data/product',
      FAQPage: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage',
      HowTo: 'https://developers.google.com/search/docs/appearance/structured-data/how-to',
      LocalBusiness: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
      Event: 'https://developers.google.com/search/docs/appearance/structured-data/event',
      VideoObject: 'https://developers.google.com/search/docs/appearance/structured-data/video',
      BreadcrumbList: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
    };

    return (
      docs[schemaType] || 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data'
    );
  }
}

/**
 * Default validator instance
 */
export const richResultsValidator = new RichResultsValidator();
