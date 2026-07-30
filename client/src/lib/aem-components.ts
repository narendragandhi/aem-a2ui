/**
 * AEM Component Registry
 * Maps component types to real AEM Core Component paths and structures
 */

export interface AemComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'content' | 'media' | 'form' | 'commerce';
  icon: string;

  // AEM paths
  resourceType: string; // e.g., 'core/wcm/components/teaser/v2/teaser'
  componentGroup: string;

  // Content structure
  properties: AemProperty[];

  // For nested components
  childComponents?: string[];
}

export interface AemProperty {
  name: string;
  type: string;
  jcrName: string; // The actual JCR property name
  required?: boolean;
  defaultValue?: string | number | boolean;
  label?: string;
  description?: string;
  options?: Array<{ text: string; value: string }>;
}

/**
 * AEM Core Components v2 Registry
 * Based on https://github.com/adobe/aem-core-wcm-components
 */
export const AEM_COMPONENTS: AemComponentDefinition[] = [
  // === LAYOUT ===
  {
    id: 'container',
    name: 'Container',
    description: 'Layout container for grouping components',
    category: 'layout',
    icon: '📦',
    resourceType: 'core/wcm/components/container/v1/container',
    componentGroup: 'AEM Component Factory - Layout',
    properties: [
      { name: 'layout', type: 'String', jcrName: 'layout', defaultValue: 'responsiveGrid' },
      { name: 'backgroundStyle', type: 'String', jcrName: 'backgroundStyle' },
    ],
    childComponents: ['teaser', 'text', 'image', 'button'],
  },

  // === CONTENT ===
  {
    id: 'hero',
    name: 'Hero / Teaser',
    description: 'Large banner with image, text, and CTA',
    category: 'content',
    icon: '🎯',
    resourceType: 'core/wcm/components/teaser/v2/teaser',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'title', type: 'String', jcrName: 'jcr:title', required: true },
      { name: 'pretitle', type: 'String', jcrName: 'pretitle' },
      { name: 'description', type: 'String', jcrName: 'jcr:description' },
      { name: 'titleFromPage', type: 'Boolean', jcrName: 'titleFromPage', defaultValue: false },
      { name: 'descriptionFromPage', type: 'Boolean', jcrName: 'descriptionFromPage', defaultValue: false },
      { name: 'linkURL', type: 'String', jcrName: 'linkURL' },
      { name: 'actionsEnabled', type: 'Boolean', jcrName: 'actionsEnabled', defaultValue: true },
    ],
  },
  {
    id: 'teaser',
    name: 'Teaser',
    description: 'Promotional content block with image and CTA',
    category: 'content',
    icon: '📰',
    resourceType: 'core/wcm/components/teaser/v2/teaser',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'title', type: 'String', jcrName: 'jcr:title', required: true },
      { name: 'pretitle', type: 'String', jcrName: 'pretitle' },
      { name: 'description', type: 'String', jcrName: 'jcr:description' },
      { name: 'linkURL', type: 'String', jcrName: 'linkURL' },
      { name: 'actionsEnabled', type: 'Boolean', jcrName: 'actionsEnabled', defaultValue: true },
    ],
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Rich text content block',
    category: 'content',
    icon: '📝',
    resourceType: 'core/wcm/components/text/v2/text',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'text', type: 'String', jcrName: 'text', required: true },
      { name: 'textIsRich', type: 'Boolean', jcrName: 'textIsRich', defaultValue: true },
    ],
  },
  {
    id: 'title',
    name: 'Title',
    description: 'Section or page title',
    category: 'content',
    icon: '🔤',
    resourceType: 'core/wcm/components/title/v3/title',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'title', type: 'String', jcrName: 'jcr:title', required: true },
      { name: 'type', type: 'String', jcrName: 'type', defaultValue: 'h2' },
      { name: 'linkURL', type: 'String', jcrName: 'linkURL' },
      { name: 'linkDisabled', type: 'Boolean', jcrName: 'linkDisabled', defaultValue: false },
    ],
  },
  {
    id: 'button',
    name: 'Button',
    description: 'Call-to-action button',
    category: 'content',
    icon: '🔘',
    resourceType: 'core/wcm/components/button/v2/button',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'text', type: 'String', jcrName: 'jcr:title', required: true },
      { name: 'link', type: 'String', jcrName: 'link' },
      { name: 'icon', type: 'String', jcrName: 'icon' },
      { name: 'accessibilityLabel', type: 'String', jcrName: 'accessibilityLabel' },
    ],
  },
  {
    id: 'list',
    name: 'List',
    description: 'Dynamic or static list of items',
    category: 'content',
    icon: '📋',
    resourceType: 'core/wcm/components/list/v4/list',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'listFrom', type: 'String', jcrName: 'listFrom', defaultValue: 'children' },
      { name: 'orderBy', type: 'String', jcrName: 'orderBy', defaultValue: 'title' },
      { name: 'maxItems', type: 'Long', jcrName: 'maxItems', defaultValue: 10 },
      { name: 'linkItems', type: 'Boolean', jcrName: 'linkItems', defaultValue: true },
    ],
  },
  {
    id: 'accordion',
    name: 'Accordion',
    description: 'Collapsible content panels',
    category: 'content',
    icon: '🪗',
    resourceType: 'core/wcm/components/accordion/v1/accordion',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'singleExpansion', type: 'Boolean', jcrName: 'singleExpansion', defaultValue: false },
      { name: 'expandedItems', type: 'String', jcrName: 'expandedItems' },
      { name: 'headingElement', type: 'String', jcrName: 'headingElement', defaultValue: 'h3' },
    ],
    childComponents: ['accordion-item'],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Tabbed content container',
    category: 'content',
    icon: '📑',
    resourceType: 'core/wcm/components/tabs/v1/tabs',
    componentGroup: 'AEM Component Factory - Content',
    properties: [
      { name: 'activeItem', type: 'String', jcrName: 'activeItem' },
      { name: 'accessibilityLabel', type: 'String', jcrName: 'accessibilityLabel' },
    ],
    childComponents: ['tab-item'],
  },

  // === MEDIA ===
  {
    id: 'image',
    name: 'Image',
    description: 'Responsive image with DAM integration',
    category: 'media',
    icon: '🖼️',
    resourceType: 'core/wcm/components/image/v3/image',
    componentGroup: 'AEM Component Factory - Media',
    properties: [
      { name: 'fileReference', type: 'Reference', jcrName: 'fileReference', required: true },
      { name: 'alt', type: 'String', jcrName: 'alt' },
      { name: 'title', type: 'String', jcrName: 'jcr:title' },
      { name: 'linkURL', type: 'String', jcrName: 'linkURL' },
      { name: 'isDecorative', type: 'Boolean', jcrName: 'isDecorative', defaultValue: false },
    ],
  },
  {
    id: 'carousel',
    name: 'Carousel',
    description: 'Image/content slider',
    category: 'media',
    icon: '🎠',
    resourceType: 'core/wcm/components/carousel/v1/carousel',
    componentGroup: 'AEM Component Factory - Media',
    properties: [
      { name: 'autoplay', type: 'Boolean', jcrName: 'autoplay', defaultValue: false },
      { name: 'delay', type: 'Long', jcrName: 'delay', defaultValue: 5000 },
      { name: 'autopauseDisabled', type: 'Boolean', jcrName: 'autopauseDisabled', defaultValue: false },
      { name: 'controlsPrepended', type: 'Boolean', jcrName: 'controlsPrepended', defaultValue: false },
    ],
    childComponents: ['image', 'teaser'],
  },
  {
    id: 'video',
    name: 'Embed / Video',
    description: 'Video embed (YouTube, Vimeo, or DAM)',
    category: 'media',
    icon: '🎬',
    resourceType: 'core/wcm/components/embed/v2/embed',
    componentGroup: 'AEM Component Factory - Media',
    properties: [
      { name: 'type', type: 'String', jcrName: 'type', defaultValue: 'url' },
      { name: 'url', type: 'String', jcrName: 'url' },
    ],
  },

  // === NAVIGATION ===
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Site navigation menu',
    category: 'layout',
    icon: '🧭',
    resourceType: 'core/wcm/components/navigation/v2/navigation',
    componentGroup: 'AEM Component Factory - Layout',
    properties: [
      { name: 'navigationRoot', type: 'String', jcrName: 'navigationRoot' },
      { name: 'structureDepth', type: 'Long', jcrName: 'structureDepth', defaultValue: 2 },
      { name: 'collectAllPages', type: 'Boolean', jcrName: 'collectAllPages', defaultValue: false },
    ],
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    description: 'Page location breadcrumb trail',
    category: 'layout',
    icon: '🥖',
    resourceType: 'core/wcm/components/breadcrumb/v3/breadcrumb',
    componentGroup: 'AEM Component Factory - Layout',
    properties: [
      { name: 'startLevel', type: 'Long', jcrName: 'startLevel', defaultValue: 2 },
      { name: 'showHidden', type: 'Boolean', jcrName: 'showHidden', defaultValue: false },
      { name: 'hideCurrent', type: 'Boolean', jcrName: 'hideCurrent', defaultValue: false },
    ],
  },

  // === COMMERCE ===
  {
    id: 'product',
    name: 'Product Teaser',
    description: 'Commerce product display',
    category: 'commerce',
    icon: '🛒',
    resourceType: 'core/cif/components/commerce/productteaser/v1/productteaser',
    componentGroup: 'AEM Component Factory - Commerce',
    properties: [
      { name: 'product', type: 'String', jcrName: 'product', required: true },
      { name: 'showTitle', type: 'Boolean', jcrName: 'showTitle', defaultValue: true },
      { name: 'showPrice', type: 'Boolean', jcrName: 'showPrice', defaultValue: true },
      { name: 'showAddToCart', type: 'Boolean', jcrName: 'showAddToCart', defaultValue: true },
    ],
  },

  // === FORM ===
  {
    id: 'form-container',
    name: 'Form Container',
    description: 'Form wrapper with submit handling',
    category: 'form',
    icon: '📋',
    resourceType: 'core/wcm/components/form/container/v2/container',
    componentGroup: 'AEM Component Factory - Form',
    properties: [
      {
        name: 'actionType',
        type: 'String',
        jcrName: 'actionType',
        defaultValue: 'foundation/components/form/actions/mail',
      },
      { name: 'redirect', type: 'String', jcrName: 'redirect' },
    ],
    childComponents: ['form-text', 'form-button'],
  },
];

/**
 * Get component definition by ID
 */
export function getComponentById(id: string): AemComponentDefinition | undefined {
  return AEM_COMPONENTS.find((c) => c.id === id);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: AemComponentDefinition['category']): AemComponentDefinition[] {
  return AEM_COMPONENTS.filter((c) => c.category === category);
}

/**
 * Get all component categories
 */
export function getCategories(): AemComponentDefinition['category'][] {
  return ['layout', 'content', 'media', 'form', 'commerce'];
}
