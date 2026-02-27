/**
 * AEM Content Structure Generator
 * Converts content suggestions to AEM JCR content structure
 */

import { ContentSuggestion } from './types.js';
import { getComponentById, AemComponentDefinition } from './aem-components.js';

/**
 * JCR Node representation
 */
export interface JcrNode {
  'jcr:primaryType': string;
  'sling:resourceType'?: string;
  [key: string]: unknown;
}

/**
 * AEM Content Package structure
 */
export interface AemContentPackage {
  path: string;
  jcrContent: JcrNode;
  assets: AssetReference[];
}

export interface AssetReference {
  sourcePath: string;  // External URL or local path
  targetPath: string;  // DAM path in AEM
}

/**
 * Convert ContentSuggestion to AEM JCR content structure
 */
export function contentToJcr(
  content: ContentSuggestion,
  options: {
    pagePath?: string;
    nodeName?: string;
    includeActions?: boolean;
  } = {}
): JcrNode {
  const componentDef = getComponentById(content.componentType || 'teaser');
  const resourceType = componentDef?.resourceType || 'core/wcm/components/teaser/v2/teaser';

  const nodeName = options.nodeName || generateNodeName(content.title);
  const pagePath = options.pagePath || '/content/aem-component-factory/us/en';

  // Base node structure
  const node: JcrNode = {
    'jcr:primaryType': 'nt:unstructured',
    'sling:resourceType': resourceType,
  };

  // Map content fields to JCR properties based on component type
  switch (content.componentType?.toLowerCase()) {
    case 'hero':
    case 'teaser':
      Object.assign(node, {
        'jcr:title': content.title,
        'jcr:description': content.description,
        'pretitle': content.subtitle || '',
        'actionsEnabled': true,
        'titleFromPage': false,
        'descriptionFromPage': false,
      });

      // Add CTA as action
      if (content.ctaText && options.includeActions !== false) {
        node['actions'] = {
          'jcr:primaryType': 'nt:unstructured',
          'item0': {
            'jcr:primaryType': 'nt:unstructured',
            'link': content.ctaUrl || '#',
            'text': content.ctaText,
          },
        };
      }

      // Add image reference
      if (content.imageUrl) {
        node['fileReference'] = convertToDAMPath(content.imageUrl);
        node['alt'] = content.imageAlt || content.title;
      }
      break;

    case 'text':
      Object.assign(node, {
        'text': `<p>${content.description}</p>`,
        'textIsRich': true,
      });
      break;

    case 'title':
      Object.assign(node, {
        'jcr:title': content.title,
        'type': 'h1',
      });
      break;

    case 'button':
      Object.assign(node, {
        'jcr:title': content.ctaText || 'Click Here',
        'link': content.ctaUrl || '#',
      });
      break;

    case 'image':
      Object.assign(node, {
        'fileReference': convertToDAMPath(content.imageUrl || ''),
        'alt': content.imageAlt || content.title,
        'jcr:title': content.title,
        'isDecorative': false,
      });
      break;

    case 'product':
      Object.assign(node, {
        'sling:resourceType': 'core/cif/components/commerce/productteaser/v1/productteaser',
        'jcr:title': content.title,
        'jcr:description': content.description,
        'showTitle': true,
        'showPrice': true,
        'showAddToCart': true,
      });
      if (content.price) {
        node['price'] = content.price;
      }
      break;

    default:
      // Generic mapping
      Object.assign(node, {
        'jcr:title': content.title,
        'jcr:description': content.description,
      });
  }

  return node;
}

/**
 * Generate a full page structure with components
 */
export function generatePageStructure(
  contents: ContentSuggestion[],
  options: {
    pagePath: string;
    pageTitle: string;
    template?: string;
  }
): JcrNode {
  const pageNode: JcrNode = {
    'jcr:primaryType': 'cq:Page',
    'jcr:content': {
      'jcr:primaryType': 'cq:PageContent',
      'jcr:title': options.pageTitle,
      'sling:resourceType': 'aem-component-factory/components/page',
      'cq:template': options.template || '/conf/aem-component-factory/settings/wcm/templates/page',
      'root': {
        'jcr:primaryType': 'nt:unstructured',
        'sling:resourceType': 'core/wcm/components/container/v1/container',
        'layout': 'responsiveGrid',
        ...contents.reduce((acc, content, index) => {
          const nodeName = `component_${index}`;
          acc[nodeName] = contentToJcr(content, { nodeName });
          return acc;
        }, {} as Record<string, JcrNode>),
      },
    },
  };

  return pageNode;
}

/**
 * Convert ContentSuggestion to Sling Model JSON format
 * This is what the component would export via .model.json
 */
export function contentToSlingModel(content: ContentSuggestion): Record<string, unknown> {
  const componentType = content.componentType?.toLowerCase() || 'teaser';

  const baseModel = {
    ':type': getComponentById(componentType)?.resourceType || 'core/wcm/components/teaser/v2/teaser',
    'id': content.id,
  };

  switch (componentType) {
    case 'hero':
    case 'teaser':
      return {
        ...baseModel,
        'pretitle': content.subtitle || null,
        'title': content.title,
        'description': content.description,
        'titleType': 'h2',
        'actionsEnabled': true,
        'actions': content.ctaText ? [{
          'title': content.ctaText,
          'url': content.ctaUrl || '#',
        }] : [],
        'image': content.imageUrl ? {
          'src': content.imageUrl,
          'alt': content.imageAlt || content.title,
          'width': 1200,
          'height': 800,
        } : null,
      };

    case 'text':
      return {
        ...baseModel,
        'text': content.description,
        'richText': true,
      };

    case 'image':
      return {
        ...baseModel,
        'src': content.imageUrl,
        'alt': content.imageAlt || content.title,
        'title': content.title,
        'link': content.ctaUrl,
      };

    case 'product':
      return {
        ...baseModel,
        ':type': 'core/cif/components/commerce/productteaser/v1/productteaser',
        'name': content.title,
        'description': content.description,
        'price': {
          'formatted': content.price,
          'currency': 'USD',
        },
        'image': {
          'src': content.imageUrl,
          'alt': content.title,
        },
        'actions': [{
          'title': content.ctaText || 'Add to Cart',
          'url': content.ctaUrl || '#',
        }],
      };

    default:
      return {
        ...baseModel,
        'title': content.title,
        'description': content.description,
      };
  }
}

/**
 * Generate HTL (Sightly) template for a component
 */
export function generateHTL(content: ContentSuggestion): string {
  const componentType = content.componentType?.toLowerCase() || 'teaser';
  const componentDef = getComponentById(componentType);

  switch (componentType) {
    case 'hero':
    case 'teaser':
      return `<!--/* Hero/Teaser Component - Generated by AEM Component Factory */-->
<sly data-sly-use.teaser="com.adobe.cq.wcm.core.components.models.Teaser">
    <div class="cmp-teaser" data-cmp-data-layer="\${teaser.data.json}">
        <sly data-sly-test="\${teaser.imageResource}">
            <div class="cmp-teaser__image">
                <img src="${content.imageUrl}" alt="${content.imageAlt || content.title}" class="cmp-image__image"/>
            </div>
        </sly>
        <div class="cmp-teaser__content">
            <sly data-sly-test="\${teaser.pretitle}">
                <p class="cmp-teaser__pretitle">${content.subtitle || ''}</p>
            </sly>
            <h2 class="cmp-teaser__title">${content.title}</h2>
            <div class="cmp-teaser__description">
                <p>${content.description}</p>
            </div>
            <sly data-sly-test="\${teaser.actionsEnabled}">
                <div class="cmp-teaser__action-container">
                    <a class="cmp-teaser__action-link" href="${content.ctaUrl || '#'}">${content.ctaText || 'Learn More'}</a>
                </div>
            </sly>
        </div>
    </div>
</sly>`;

    case 'text':
      return `<!--/* Text Component - Generated by AEM Component Factory */-->
<sly data-sly-use.text="com.adobe.cq.wcm.core.components.models.Text">
    <div class="cmp-text" data-cmp-data-layer="\${text.data.json}">
        <p>${content.description}</p>
    </div>
</sly>`;

    case 'image':
      return `<!--/* Image Component - Generated by AEM Component Factory */-->
<sly data-sly-use.image="com.adobe.cq.wcm.core.components.models.Image">
    <div class="cmp-image" data-cmp-data-layer="\${image.data.json}">
        <img src="${content.imageUrl}"
             alt="${content.imageAlt || content.title}"
             title="${content.title}"
             class="cmp-image__image"/>
    </div>
</sly>`;

    case 'product':
      return `<!--/* Product Teaser Component - Generated by AEM Component Factory */-->
<sly data-sly-use.product="com.adobe.cq.commerce.core.components.models.productteaser.ProductTeaser">
    <div class="cmp-productteaser">
        <div class="cmp-productteaser__image">
            <img src="${content.imageUrl}" alt="${content.title}"/>
        </div>
        <div class="cmp-productteaser__content">
            <h3 class="cmp-productteaser__title">${content.title}</h3>
            <p class="cmp-productteaser__description">${content.description}</p>
            <span class="cmp-productteaser__price">${content.price}</span>
            <button class="cmp-productteaser__cta">${content.ctaText || 'Add to Cart'}</button>
        </div>
    </div>
</sly>`;

    default:
      return `<!--/* ${componentDef?.name || 'Component'} - Generated by AEM Component Factory */-->
<div class="cmp-${componentType}">
    <h2>${content.title}</h2>
    <p>${content.description}</p>
</div>`;
  }
}

/**
 * Helper: Convert external URL to DAM path
 */
function convertToDAMPath(url: string): string {
  if (url.startsWith('/content/dam')) {
    return url;
  }
  // For external URLs, suggest a DAM path
  const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
  return `/content/dam/aem-component-factory/images/${filename}`;
}

/**
 * Helper: Generate valid JCR node name from title
 */
function generateNodeName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Get asset references that need to be uploaded to DAM
 */
export function getAssetReferences(content: ContentSuggestion): AssetReference[] {
  const assets: AssetReference[] = [];

  if (content.imageUrl && !content.imageUrl.startsWith('/content/dam')) {
    assets.push({
      sourcePath: content.imageUrl,
      targetPath: convertToDAMPath(content.imageUrl),
    });
  }

  return assets;
}
