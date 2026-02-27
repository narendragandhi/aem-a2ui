/**
 * AEM Content Fragment Support
 * Generate and export Content Fragments for headless delivery
 */

import { ContentSuggestion } from './types.js';

/**
 * Content Fragment Model definition
 */
export interface ContentFragmentModel {
  id: string;
  name: string;
  description: string;
  modelPath: string;  // e.g., /conf/mysite/settings/dam/cfm/models/article
  fields: ContentFragmentField[];
}

export interface ContentFragmentField {
  name: string;
  fieldName: string;  // JCR property name
  type: 'text' | 'multi-text' | 'number' | 'boolean' | 'date' | 'enumeration' | 'tags' | 'content-reference' | 'fragment-reference' | 'json';
  required?: boolean;
  multiValue?: boolean;
  description?: string;
}

/**
 * Content Fragment instance
 */
export interface ContentFragment {
  title: string;
  description?: string;
  modelPath: string;
  path: string;
  data: Record<string, unknown>;
  variations?: ContentFragmentVariation[];
}

export interface ContentFragmentVariation {
  name: string;
  title: string;
  data: Record<string, unknown>;
}

/**
 * Pre-defined Content Fragment Models
 */
export const CF_MODELS: ContentFragmentModel[] = [
  {
    id: 'article',
    name: 'Article',
    description: 'Blog or news article content',
    modelPath: '/conf/aem-component-factory/settings/dam/cfm/models/article',
    fields: [
      { name: 'Title', fieldName: 'title', type: 'text', required: true },
      { name: 'Slug', fieldName: 'slug', type: 'text', required: true },
      { name: 'Author', fieldName: 'author', type: 'text' },
      { name: 'Publish Date', fieldName: 'publishDate', type: 'date' },
      { name: 'Summary', fieldName: 'summary', type: 'multi-text' },
      { name: 'Body', fieldName: 'body', type: 'multi-text', required: true },
      { name: 'Featured Image', fieldName: 'featuredImage', type: 'content-reference' },
      { name: 'Tags', fieldName: 'tags', type: 'tags', multiValue: true },
      { name: 'Category', fieldName: 'category', type: 'enumeration' },
    ],
  },
  {
    id: 'product',
    name: 'Product',
    description: 'E-commerce product content',
    modelPath: '/conf/aem-component-factory/settings/dam/cfm/models/product',
    fields: [
      { name: 'Name', fieldName: 'name', type: 'text', required: true },
      { name: 'SKU', fieldName: 'sku', type: 'text', required: true },
      { name: 'Description', fieldName: 'description', type: 'multi-text' },
      { name: 'Price', fieldName: 'price', type: 'number', required: true },
      { name: 'Sale Price', fieldName: 'salePrice', type: 'number' },
      { name: 'In Stock', fieldName: 'inStock', type: 'boolean' },
      { name: 'Images', fieldName: 'images', type: 'content-reference', multiValue: true },
      { name: 'Category', fieldName: 'category', type: 'enumeration' },
      { name: 'Specifications', fieldName: 'specifications', type: 'json' },
    ],
  },
  {
    id: 'hero',
    name: 'Hero Banner',
    description: 'Reusable hero banner content',
    modelPath: '/conf/aem-component-factory/settings/dam/cfm/models/hero',
    fields: [
      { name: 'Title', fieldName: 'title', type: 'text', required: true },
      { name: 'Subtitle', fieldName: 'subtitle', type: 'text' },
      { name: 'Description', fieldName: 'description', type: 'multi-text' },
      { name: 'CTA Text', fieldName: 'ctaText', type: 'text' },
      { name: 'CTA Link', fieldName: 'ctaLink', type: 'text' },
      { name: 'Background Image', fieldName: 'backgroundImage', type: 'content-reference' },
      { name: 'Theme', fieldName: 'theme', type: 'enumeration' },
    ],
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer testimonial or quote',
    modelPath: '/conf/aem-component-factory/settings/dam/cfm/models/testimonial',
    fields: [
      { name: 'Quote', fieldName: 'quote', type: 'multi-text', required: true },
      { name: 'Author Name', fieldName: 'authorName', type: 'text', required: true },
      { name: 'Author Title', fieldName: 'authorTitle', type: 'text' },
      { name: 'Company', fieldName: 'company', type: 'text' },
      { name: 'Author Image', fieldName: 'authorImage', type: 'content-reference' },
      { name: 'Rating', fieldName: 'rating', type: 'number' },
    ],
  },
  {
    id: 'faq',
    name: 'FAQ Item',
    description: 'Frequently asked question',
    modelPath: '/conf/aem-component-factory/settings/dam/cfm/models/faq',
    fields: [
      { name: 'Question', fieldName: 'question', type: 'text', required: true },
      { name: 'Answer', fieldName: 'answer', type: 'multi-text', required: true },
      { name: 'Category', fieldName: 'category', type: 'enumeration' },
      { name: 'Order', fieldName: 'order', type: 'number' },
    ],
  },
  {
    id: 'team-member',
    name: 'Team Member',
    description: 'Team member profile',
    modelPath: '/conf/aem-component-factory/settings/dam/cfm/models/team-member',
    fields: [
      { name: 'Name', fieldName: 'name', type: 'text', required: true },
      { name: 'Title', fieldName: 'title', type: 'text', required: true },
      { name: 'Bio', fieldName: 'bio', type: 'multi-text' },
      { name: 'Photo', fieldName: 'photo', type: 'content-reference' },
      { name: 'Email', fieldName: 'email', type: 'text' },
      { name: 'LinkedIn', fieldName: 'linkedin', type: 'text' },
      { name: 'Twitter', fieldName: 'twitter', type: 'text' },
    ],
  },
];

/**
 * Convert ContentSuggestion to Content Fragment
 */
export function contentToFragment(
  content: ContentSuggestion,
  modelId: string,
  options: { path?: string; variations?: string[] } = {}
): ContentFragment {
  const model = CF_MODELS.find(m => m.id === modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  const slug = content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const path = options.path || `/content/dam/aem-component-factory/content-fragments/${modelId}s/${slug}`;

  // Map content to model fields
  const data: Record<string, unknown> = {};

  for (const field of model.fields) {
    const value = mapContentToField(content, field);
    if (value !== undefined) {
      data[field.fieldName] = value;
    }
  }

  const fragment: ContentFragment = {
    title: content.title,
    description: content.description,
    modelPath: model.modelPath,
    path,
    data,
  };

  // Add variations if requested
  if (options.variations && options.variations.length > 0) {
    fragment.variations = options.variations.map(varName => ({
      name: varName.toLowerCase().replace(/\s+/g, '-'),
      title: varName,
      data: { ...data },  // Could customize per variation
    }));
  }

  return fragment;
}

/**
 * Map content suggestion field to CF model field
 */
function mapContentToField(content: ContentSuggestion, field: ContentFragmentField): unknown {
  switch (field.fieldName) {
    case 'title':
    case 'name':
      return content.title;
    case 'slug':
      return content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    case 'description':
    case 'summary':
    case 'body':
    case 'bio':
    case 'quote':
      return content.description;
    case 'subtitle':
    case 'authorTitle':
      return content.subtitle;
    case 'ctaText':
      return content.ctaText;
    case 'ctaLink':
    case 'link':
      return content.ctaUrl;
    case 'featuredImage':
    case 'backgroundImage':
    case 'photo':
    case 'authorImage':
      return content.imageUrl ? { path: convertToDAMPath(content.imageUrl) } : undefined;
    case 'price':
      return content.price ? parseFloat(content.price.replace(/[^0-9.]/g, '')) : undefined;
    case 'authorName':
    case 'author':
      return 'Content Team';  // Default
    case 'publishDate':
      return new Date().toISOString();
    case 'inStock':
      return true;
    default:
      return undefined;
  }
}

/**
 * Export Content Fragment as JCR JSON
 */
export function fragmentToJcr(fragment: ContentFragment): Record<string, unknown> {
  const jcr: Record<string, unknown> = {
    'jcr:primaryType': 'dam:Asset',
    'jcr:content': {
      'jcr:primaryType': 'dam:AssetContent',
      'data': {
        'jcr:primaryType': 'nt:unstructured',
        'cq:model': fragment.modelPath,
        ...Object.entries(fragment.data).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, unknown>),
      },
      'metadata': {
        'jcr:primaryType': 'nt:unstructured',
        'dc:title': fragment.title,
        'dc:description': fragment.description || '',
      },
    },
  };

  // Add variations
  if (fragment.variations && fragment.variations.length > 0) {
    const variations: Record<string, unknown> = {
      'jcr:primaryType': 'nt:unstructured',
    };

    for (const variation of fragment.variations) {
      variations[variation.name] = {
        'jcr:primaryType': 'nt:unstructured',
        'jcr:title': variation.title,
        ...variation.data,
      };
    }

    (jcr['jcr:content'] as Record<string, unknown>)['variations'] = variations;
  }

  return jcr;
}

/**
 * Export Content Fragment for GraphQL (persisted query format)
 */
export function fragmentToGraphQL(fragment: ContentFragment, modelId: string): Record<string, unknown> {
  const model = CF_MODELS.find(m => m.id === modelId);

  return {
    '_path': fragment.path,
    '_model': {
      '_path': fragment.modelPath,
      'title': model?.name || modelId,
    },
    ...fragment.data,
    '_variations': fragment.variations?.map(v => v.name) || [],
  };
}

/**
 * Generate Content Fragment Model JSON (for creating models in AEM)
 */
export function generateModelDefinition(model: ContentFragmentModel): Record<string, unknown> {
  return {
    'jcr:primaryType': 'cq:Template',
    'jcr:title': model.name,
    'jcr:description': model.description,
    'ranking': 100,
    'cq:templateType': '/libs/settings/dam/cfm/model-types/fragment',
    'jcr:content': {
      'jcr:primaryType': 'nt:unstructured',
      'jcr:title': model.name,
      'dataTypesConfig': '/mnt/overlay/settings/dam/cfm/model-types/fragment/datatypes',
      'items': model.fields.reduce((acc, field, index) => {
        acc[field.fieldName] = {
          'jcr:primaryType': 'nt:unstructured',
          'fieldLabel': field.name,
          'name': field.fieldName,
          'renderType': mapFieldTypeToRenderType(field.type),
          'valueType': mapFieldTypeToValueType(field.type),
          'required': field.required || false,
          'metaType': field.type,
          'listOrder': index + 1,
          'multi': field.multiValue || false,
        };
        return acc;
      }, {} as Record<string, unknown>),
    },
  };
}

function mapFieldTypeToRenderType(type: ContentFragmentField['type']): string {
  const mapping: Record<string, string> = {
    'text': 'textfield',
    'multi-text': 'textarea',
    'number': 'numberfield',
    'boolean': 'checkbox',
    'date': 'datepicker',
    'enumeration': 'dropdown',
    'tags': 'tags',
    'content-reference': 'contentreference',
    'fragment-reference': 'fragmentreference',
    'json': 'textarea',
  };
  return mapping[type] || 'textfield';
}

function mapFieldTypeToValueType(type: ContentFragmentField['type']): string {
  const mapping: Record<string, string> = {
    'text': 'string',
    'multi-text': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'date': 'calendar',
    'enumeration': 'string',
    'tags': 'string[]',
    'content-reference': 'string',
    'fragment-reference': 'string',
    'json': 'string',
  };
  return mapping[type] || 'string';
}

function convertToDAMPath(url: string): string {
  if (url.startsWith('/content/dam')) {
    return url;
  }
  const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
  return `/content/dam/aem-component-factory/images/${filename}`;
}

/**
 * Get model by ID
 */
export function getModelById(id: string): ContentFragmentModel | undefined {
  return CF_MODELS.find(m => m.id === id);
}
