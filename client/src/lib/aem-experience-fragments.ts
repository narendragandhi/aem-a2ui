/**
 * AEM Experience Fragment Support
 * Generate Experience Fragments for multi-channel content delivery
 */

import { ContentSuggestion } from './types.js';
import { contentToJcr } from './aem-content-structure.js';

export interface ExperienceFragmentModel {
  id: string;
  name: string;
  description: string;
  templatePath: string;
  allowedComponents: string[];
  variations: ExperienceFragmentVariation[];
}

export interface ExperienceFragmentVariation {
  id: string;
  name: string;
  type: 'web' | 'email' | 'social' | 'mobile' | 'print';
  description: string;
}

export interface ExperienceFragment {
  title: string;
  description?: string;
  path: string;
  templatePath: string;
  masterVariation: string;
  variations: ExperienceFragmentVariationContent[];
  components: ExperienceFragmentComponent[];
}

export interface ExperienceFragmentVariationContent {
  name: string;
  title: string;
  type: string;
  components: ExperienceFragmentComponent[];
}

export interface ExperienceFragmentComponent {
  resourceType: string;
  order: number;
  content: Record<string, unknown>;
}

/**
 * Pre-defined Experience Fragment Templates
 */
export const XF_TEMPLATES: ExperienceFragmentModel[] = [
  {
    id: 'hero-xf',
    name: 'Hero Banner XF',
    description: 'Reusable hero banner for landing pages',
    templatePath: '/conf/aem-component-factory/settings/wcm/templates/xf-hero',
    allowedComponents: ['hero', 'teaser', 'button'],
    variations: [
      { id: 'web', name: 'Web', type: 'web', description: 'Desktop and mobile web' },
      { id: 'email', name: 'Email', type: 'email', description: 'Email campaigns' },
      { id: 'social', name: 'Social', type: 'social', description: 'Social media cards' },
    ],
  },
  {
    id: 'promo-xf',
    name: 'Promotional Banner XF',
    description: 'Campaign banners for promotions',
    templatePath: '/conf/aem-component-factory/settings/wcm/templates/xf-promo',
    allowedComponents: ['banner', 'teaser', 'button', 'image'],
    variations: [
      { id: 'web', name: 'Web', type: 'web', description: 'Website banner' },
      { id: 'email', name: 'Email', type: 'email', description: 'Email header' },
      { id: 'mobile', name: 'Mobile App', type: 'mobile', description: 'In-app banner' },
    ],
  },
  {
    id: 'footer-xf',
    name: 'Footer XF',
    description: 'Reusable site footer',
    templatePath: '/conf/aem-component-factory/settings/wcm/templates/xf-footer',
    allowedComponents: ['footer', 'navigation', 'socialshare', 'text'],
    variations: [
      { id: 'full', name: 'Full Footer', type: 'web', description: 'Complete footer with all sections' },
      { id: 'minimal', name: 'Minimal', type: 'web', description: 'Compact footer' },
    ],
  },
  {
    id: 'cta-xf',
    name: 'Call to Action XF',
    description: 'Conversion-focused CTA blocks',
    templatePath: '/conf/aem-component-factory/settings/wcm/templates/xf-cta',
    allowedComponents: ['cta', 'button', 'text', 'image'],
    variations: [
      { id: 'primary', name: 'Primary CTA', type: 'web', description: 'Main conversion action' },
      { id: 'secondary', name: 'Secondary', type: 'web', description: 'Alternative action' },
      { id: 'email', name: 'Email CTA', type: 'email', description: 'Email button' },
    ],
  },
  {
    id: 'testimonial-xf',
    name: 'Testimonial XF',
    description: 'Customer testimonials and quotes',
    templatePath: '/conf/aem-component-factory/settings/wcm/templates/xf-testimonial',
    allowedComponents: ['quote', 'teaser', 'image'],
    variations: [
      { id: 'card', name: 'Card Style', type: 'web', description: 'Card-based testimonial' },
      { id: 'banner', name: 'Banner Style', type: 'web', description: 'Full-width banner' },
      { id: 'social', name: 'Social Proof', type: 'social', description: 'Social media format' },
    ],
  },
];

/**
 * Convert ContentSuggestion to Experience Fragment
 */
export function contentToExperienceFragment(
  content: ContentSuggestion,
  templateId: string,
  options: {
    path?: string;
    variations?: string[];
    title?: string;
  } = {},
): ExperienceFragment {
  const template = XF_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Unknown XF template: ${templateId}`);
  }

  const slug = (options.title || content.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const path = options.path || `/content/experience-fragments/aem-component-factory/${templateId}/${slug}`;

  // Create base component from content
  const baseComponent: ExperienceFragmentComponent = {
    resourceType: `core/wcm/components/${content.componentType || 'teaser'}/v2/${content.componentType || 'teaser'}`,
    order: 0,
    content: {
      title: content.title,
      description: content.description,
      ctaText: content.ctaText,
      ctaUrl: content.ctaUrl,
      imageUrl: content.imageUrl,
    },
  };

  // Create variations
  const selectedVariations = options.variations || template.variations.map((v) => v.id);
  const variations: ExperienceFragmentVariationContent[] = selectedVariations.map((varId) => {
    const varDef = template.variations.find((v) => v.id === varId);
    return {
      name: varId,
      title: varDef?.name || varId,
      type: varDef?.type || 'web',
      components: [adaptComponentForVariation(baseComponent, varDef?.type || 'web')],
    };
  });

  return {
    title: options.title || content.title,
    description: content.description,
    path,
    templatePath: template.templatePath,
    masterVariation: selectedVariations[0],
    variations,
    components: [baseComponent],
  };
}

/**
 * Adapt component content for different variation types
 */
function adaptComponentForVariation(
  component: ExperienceFragmentComponent,
  variationType: string,
): ExperienceFragmentComponent {
  const adapted = { ...component, content: { ...component.content } };

  switch (variationType) {
    case 'email':
      // Email variations might need inline styles, simpler markup
      adapted.content['emailOptimized'] = true;
      adapted.content['useInlineStyles'] = true;
      break;

    case 'social':
      // Social cards have character limits
      if (typeof adapted.content['description'] === 'string') {
        adapted.content['description'] = (adapted.content['description'] as string).substring(0, 140);
      }
      adapted.content['socialCard'] = true;
      break;

    case 'mobile':
      // Mobile might need condensed content
      adapted.content['mobileOptimized'] = true;
      break;
  }

  return adapted;
}

/**
 * Export Experience Fragment as JCR JSON
 */
export function experienceFragmentToJcr(xf: ExperienceFragment): Record<string, unknown> {
  const jcr: Record<string, unknown> = {
    'jcr:primaryType': 'cq:Page',
    'jcr:content': {
      'jcr:primaryType': 'cq:PageContent',
      'jcr:title': xf.title,
      'jcr:description': xf.description || '',
      'sling:resourceType': 'cq/experience-fragments/components/experiencefragment',
      'cq:xfMasterVariation': xf.masterVariation,
      'cq:template': xf.templatePath,
    },
  };

  // Add variations as child pages
  for (const variation of xf.variations) {
    (jcr as Record<string, unknown>)[variation.name] = {
      'jcr:primaryType': 'cq:Page',
      'jcr:content': {
        'jcr:primaryType': 'cq:PageContent',
        'jcr:title': variation.title,
        'sling:resourceType': 'cq/experience-fragments/components/xfpage',
        'cq:xfVariantType': variation.type,
        root: createComponentStructure(variation.components),
      },
    };
  }

  return jcr;
}

/**
 * Create component structure for XF
 */
function createComponentStructure(components: ExperienceFragmentComponent[]): Record<string, unknown> {
  const root: Record<string, unknown> = {
    'jcr:primaryType': 'nt:unstructured',
    'sling:resourceType': 'wcm/foundation/components/responsivegrid',
  };

  components.forEach((comp, index) => {
    root[`component_${index}`] = {
      'jcr:primaryType': 'nt:unstructured',
      'sling:resourceType': comp.resourceType,
      ...comp.content,
    };
  });

  return root;
}

/**
 * Generate XF HTML export (for publishing)
 */
export function experienceFragmentToHtml(xf: ExperienceFragment, variationId: string): string {
  const variation = xf.variations.find((v) => v.name === variationId);
  if (!variation) {
    throw new Error(`Variation not found: ${variationId}`);
  }

  const components = variation.components
    .map((comp) => {
      const content = comp.content;
      const type = comp.resourceType.split('/').pop() || 'component';

      switch (type) {
        case 'teaser':
        case 'hero':
          return `<div class="xf-${type}" data-xf-component="${type}">
  ${content['imageUrl'] ? `<img src="${content['imageUrl']}" alt="${content['title'] || ''}" class="xf-${type}__image" />` : ''}
  <div class="xf-${type}__content">
    <h2 class="xf-${type}__title">${content['title'] || ''}</h2>
    <p class="xf-${type}__description">${content['description'] || ''}</p>
    ${content['ctaText'] ? `<a href="${content['ctaUrl'] || '#'}" class="xf-${type}__cta">${content['ctaText']}</a>` : ''}
  </div>
</div>`;

        case 'button':
        case 'cta':
          return `<a href="${content['ctaUrl'] || '#'}" class="xf-cta-button">${content['ctaText'] || 'Click Here'}</a>`;

        default:
          return `<div class="xf-${type}" data-xf-component="${type}">
  <h3>${content['title'] || ''}</h3>
  <p>${content['description'] || ''}</p>
</div>`;
      }
    })
    .join('\n');

  // Wrap based on variation type
  if (variation.type === 'email') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${xf.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .xf-teaser, .xf-hero { max-width: 600px; margin: 0 auto; }
    .xf-teaser__image, .xf-hero__image { max-width: 100%; height: auto; }
    .xf-cta-button { display: inline-block; padding: 12px 24px; background: #0070c9; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
${components}
</body>
</html>`;
  }

  return `<!-- Experience Fragment: ${xf.title} - ${variation.title} -->
<div class="experience-fragment" data-xf-path="${xf.path}" data-xf-variation="${variationId}">
${components}
</div>`;
}

/**
 * Get template by ID
 */
export function getXfTemplateById(id: string): ExperienceFragmentModel | undefined {
  return XF_TEMPLATES.find((t) => t.id === id);
}
