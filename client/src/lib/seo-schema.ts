/**
 * Schema.org Structured Data Generator
 * Generate JSON-LD for rich snippets in search results
 */

import { ContentSuggestion } from './types.js';

export type SchemaType =
  | 'Article'
  | 'Product'
  | 'Organization'
  | 'WebPage'
  | 'BreadcrumbList'
  | 'FAQPage'
  | 'HowTo'
  | 'LocalBusiness'
  | 'Event'
  | 'VideoObject'
  | 'ImageObject'
  | 'Review'
  | 'AggregateRating'
  | 'Offer';

export interface SchemaOptions {
  baseUrl?: string;
  organizationName?: string;
  organizationLogo?: string;
  authorName?: string;
  authorUrl?: string;
  datePublished?: string;
  dateModified?: string;
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(
  content: ContentSuggestion,
  options: SchemaOptions = {}
): Record<string, unknown> {
  const now = new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': content.title,
    'description': content.description,
    'image': content.imageUrl ? [content.imageUrl] : [],
    'author': {
      '@type': 'Person',
      'name': options.authorName || 'Content Team',
      'url': options.authorUrl,
    },
    'publisher': {
      '@type': 'Organization',
      'name': options.organizationName || 'AEM Component Factory',
      'logo': {
        '@type': 'ImageObject',
        'url': options.organizationLogo || '',
      },
    },
    'datePublished': options.datePublished || now,
    'dateModified': options.dateModified || now,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': options.baseUrl || '',
    },
  };
}

/**
 * Generate Product schema
 */
export function generateProductSchema(
  content: ContentSuggestion,
  options: SchemaOptions & {
    sku?: string;
    brand?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    currency?: string;
    ratingValue?: number;
    reviewCount?: number;
  } = {}
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': content.title,
    'description': content.description,
    'image': content.imageUrl,
    'sku': options.sku || content.id,
    'brand': {
      '@type': 'Brand',
      'name': options.brand || options.organizationName || 'Brand',
    },
  };

  // Add price/offer if available
  if (content.price) {
    const priceValue = parseFloat(content.price.replace(/[^0-9.]/g, ''));
    schema['offers'] = {
      '@type': 'Offer',
      'price': priceValue,
      'priceCurrency': options.currency || 'USD',
      'availability': `https://schema.org/${options.availability || 'InStock'}`,
      'url': options.baseUrl,
    };
  }

  // Add rating if available
  if (options.ratingValue) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': options.ratingValue,
      'reviewCount': options.reviewCount || 1,
      'bestRating': 5,
      'worstRating': 1,
    };
  }

  return schema;
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(
  content: ContentSuggestion,
  options: SchemaOptions & {
    pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'FAQPage' | 'CollectionPage';
  } = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': options.pageType || 'WebPage',
    'name': content.title,
    'description': content.description,
    'url': options.baseUrl,
    'image': content.imageUrl,
    'publisher': {
      '@type': 'Organization',
      'name': options.organizationName || 'AEM Component Factory',
    },
    'datePublished': options.datePublished,
    'dateModified': options.dateModified,
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}

/**
 * Generate FAQ schema
 */
export function generateFaqSchema(
  faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };
}

/**
 * Generate HowTo schema
 */
export function generateHowToSchema(
  content: ContentSuggestion,
  steps: Array<{ name: string; text: string; image?: string }>,
  options: SchemaOptions & {
    totalTime?: string; // ISO 8601 duration, e.g., "PT30M"
    estimatedCost?: { value: number; currency: string };
  } = {}
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': content.title,
    'description': content.description,
    'image': content.imageUrl,
    'step': steps.map((step, index) => ({
      '@type': 'HowToStep',
      'position': index + 1,
      'name': step.name,
      'text': step.text,
      'image': step.image,
    })),
  };

  if (options.totalTime) {
    schema['totalTime'] = options.totalTime;
  }

  if (options.estimatedCost) {
    schema['estimatedCost'] = {
      '@type': 'MonetaryAmount',
      'value': options.estimatedCost.value,
      'currency': options.estimatedCost.currency,
    };
  }

  return schema;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(
  options: {
    name: string;
    url: string;
    logo: string;
    description?: string;
    sameAs?: string[]; // Social media profiles
    contactPoint?: {
      type: string;
      telephone: string;
      email?: string;
    };
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': options.name,
    'url': options.url,
    'logo': options.logo,
    'description': options.description,
  };

  if (options.sameAs) {
    schema['sameAs'] = options.sameAs;
  }

  if (options.contactPoint) {
    schema['contactPoint'] = {
      '@type': 'ContactPoint',
      'contactType': options.contactPoint.type,
      'telephone': options.contactPoint.telephone,
      'email': options.contactPoint.email,
    };
  }

  if (options.address) {
    schema['address'] = {
      '@type': 'PostalAddress',
      'streetAddress': options.address.street,
      'addressLocality': options.address.city,
      'addressRegion': options.address.state,
      'postalCode': options.address.postalCode,
      'addressCountry': options.address.country,
    };
  }

  return schema;
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(
  options: {
    name: string;
    description?: string;
    url: string;
    image: string;
    telephone: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    geo?: { latitude: number; longitude: number };
    openingHours?: string[]; // e.g., ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00"]
    priceRange?: string; // e.g., "$$"
  }
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': options.name,
    'description': options.description,
    'url': options.url,
    'image': options.image,
    'telephone': options.telephone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': options.address.street,
      'addressLocality': options.address.city,
      'addressRegion': options.address.state,
      'postalCode': options.address.postalCode,
      'addressCountry': options.address.country,
    },
  };

  if (options.geo) {
    schema['geo'] = {
      '@type': 'GeoCoordinates',
      'latitude': options.geo.latitude,
      'longitude': options.geo.longitude,
    };
  }

  if (options.openingHours) {
    schema['openingHours'] = options.openingHours;
  }

  if (options.priceRange) {
    schema['priceRange'] = options.priceRange;
  }

  return schema;
}

/**
 * Generate Event schema
 */
export function generateEventSchema(
  content: ContentSuggestion,
  options: {
    startDate: string;
    endDate?: string;
    location?: {
      name: string;
      address: string;
    };
    isOnline?: boolean;
    onlineUrl?: string;
    performer?: string;
    organizer?: string;
    ticketUrl?: string;
    price?: number;
    currency?: string;
  }
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': content.title,
    'description': content.description,
    'image': content.imageUrl,
    'startDate': options.startDate,
    'endDate': options.endDate,
  };

  if (options.isOnline) {
    schema['eventAttendanceMode'] = 'https://schema.org/OnlineEventAttendanceMode';
    schema['location'] = {
      '@type': 'VirtualLocation',
      'url': options.onlineUrl,
    };
  } else if (options.location) {
    schema['eventAttendanceMode'] = 'https://schema.org/OfflineEventAttendanceMode';
    schema['location'] = {
      '@type': 'Place',
      'name': options.location.name,
      'address': options.location.address,
    };
  }

  if (options.performer) {
    schema['performer'] = {
      '@type': 'Person',
      'name': options.performer,
    };
  }

  if (options.organizer) {
    schema['organizer'] = {
      '@type': 'Organization',
      'name': options.organizer,
    };
  }

  if (options.ticketUrl && options.price !== undefined) {
    schema['offers'] = {
      '@type': 'Offer',
      'url': options.ticketUrl,
      'price': options.price,
      'priceCurrency': options.currency || 'USD',
      'availability': 'https://schema.org/InStock',
    };
  }

  return schema;
}

/**
 * Generate VideoObject schema
 */
export function generateVideoSchema(
  content: ContentSuggestion,
  options: {
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: string; // ISO 8601 duration
    uploadDate?: string;
    embedUrl?: string;
  }
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': content.title,
    'description': content.description,
    'thumbnailUrl': options.thumbnailUrl || content.imageUrl,
    'contentUrl': options.videoUrl,
    'embedUrl': options.embedUrl,
    'uploadDate': options.uploadDate || new Date().toISOString(),
    'duration': options.duration,
  };
}

/**
 * Auto-detect and generate appropriate schema
 */
export function autoGenerateSchema(
  content: ContentSuggestion,
  options: SchemaOptions = {}
): Record<string, unknown> {
  const type = content.componentType?.toLowerCase() || '';

  // Detect schema type based on component type
  if (type.includes('product') || content.price) {
    return generateProductSchema(content, options);
  }

  if (type.includes('article') || type.includes('blog') || type.includes('text')) {
    return generateArticleSchema(content, options);
  }

  if (type.includes('video')) {
    return generateVideoSchema(content, {
      videoUrl: content.ctaUrl || '',
      ...options,
    });
  }

  // Default to WebPage
  return generateWebPageSchema(content, options);
}

/**
 * Generate JSON-LD script tag
 */
export function generateJsonLdScript(schema: Record<string, unknown>): string {
  return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
}

/**
 * Validate schema structure
 */
export function validateSchema(schema: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!schema['@context']) {
    errors.push('Missing @context property');
  }

  if (!schema['@type']) {
    errors.push('Missing @type property');
  }

  // Type-specific validation
  const type = schema['@type'] as string;

  switch (type) {
    case 'Article':
      if (!schema['headline']) warnings.push('Article should have a headline');
      if (!schema['author']) warnings.push('Article should have an author');
      if (!schema['datePublished']) warnings.push('Article should have a datePublished');
      break;

    case 'Product':
      if (!schema['name']) errors.push('Product must have a name');
      if (!schema['offers']) warnings.push('Product should have offers/pricing');
      break;

    case 'LocalBusiness':
      if (!schema['name']) errors.push('LocalBusiness must have a name');
      if (!schema['address']) errors.push('LocalBusiness must have an address');
      break;

    case 'Event':
      if (!schema['name']) errors.push('Event must have a name');
      if (!schema['startDate']) errors.push('Event must have a startDate');
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Combine multiple schemas into a graph
 */
export function combineSchemas(schemas: Record<string, unknown>[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(schema => {
      const { '@context': _, ...rest } = schema;
      return rest;
    }),
  };
}
