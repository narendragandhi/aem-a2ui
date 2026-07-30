/**
 * Universal Editor Integration Utilities
 *
 * This module provides helpers for integrating Lit Web Components
 * with AEM Universal Editor for inline content authoring.
 *
 * @see https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor
 */

import { ContentSuggestion } from '../lib/types.js';

/**
 * Configuration for Universal Editor connection
 */
export interface UEConfig {
  /** AEM Author URL */
  aemAuthorUrl: string;
  /** Content path in AEM repository */
  contentPath: string;
  /** Enable Universal Editor instrumentation */
  enabled: boolean;
}

/**
 * Default configuration
 */
let config: UEConfig = {
  aemAuthorUrl: 'http://localhost:4502',
  contentPath: '/content/aem-demo',
  enabled: false,
};

/**
 * Initialize Universal Editor with configuration
 */
export function initUniversalEditor(options: Partial<UEConfig>): void {
  config = { ...config, ...options };

  if (config.enabled) {
    injectUEMetaTags();
    console.log('[UE] Universal Editor initialized with config:', config);
  }
}

/**
 * Inject required meta tags for Universal Editor
 */
function injectUEMetaTags(): void {
  // Check if already injected
  if (document.querySelector('meta[name="urn:auecon:aemconnection"]')) {
    return;
  }

  const connectionMeta = document.createElement('meta');
  connectionMeta.name = 'urn:auecon:aemconnection';
  connectionMeta.content = `aem:${config.aemAuthorUrl}`;
  document.head.appendChild(connectionMeta);

  console.log('[UE] Injected Universal Editor meta tags');
}

/**
 * Generate data-aue-* attributes for a content element
 *
 * @param content - The content suggestion to make editable
 * @param componentType - The component type (hero, teaser, etc.)
 * @returns Object with data-aue-* attributes
 */
export function getEditableAttributes(content: ContentSuggestion, componentType: string): Record<string, string> {
  if (!config.enabled) {
    return {};
  }

  const resourcePath = `${config.contentPath}/jcr:content/${content.id || componentType}`;

  return {
    'data-aue-resource': `urn:aem:${resourcePath}`,
    'data-aue-type': 'component',
    'data-aue-label': content.title || componentType,
    'data-aue-model': componentType,
  };
}

/**
 * Generate data-aue-prop attribute for an editable field
 *
 * @param fieldName - The property name (title, description, etc.)
 * @returns Object with data-aue-prop attribute
 */
export function getFieldAttributes(fieldName: string): Record<string, string> {
  if (!config.enabled) {
    return {};
  }

  return {
    'data-aue-prop': fieldName,
    'data-aue-type': 'text',
  };
}

/**
 * Generate data-aue-prop attribute for a rich text field
 */
export function getRichTextFieldAttributes(fieldName: string): Record<string, string> {
  if (!config.enabled) {
    return {};
  }

  return {
    'data-aue-prop': fieldName,
    'data-aue-type': 'richtext',
  };
}

/**
 * Generate data-aue-prop attribute for an image/reference field
 */
export function getMediaFieldAttributes(fieldName: string): Record<string, string> {
  if (!config.enabled) {
    return {};
  }

  return {
    'data-aue-prop': fieldName,
    'data-aue-type': 'reference',
  };
}

/**
 * Generate attributes for a container that can have child components
 */
export function getContainerAttributes(containerId: string, filter: string = 'page-content'): Record<string, string> {
  if (!config.enabled) {
    return {};
  }

  return {
    'data-aue-resource': `urn:aem:${config.contentPath}/jcr:content/${containerId}`,
    'data-aue-type': 'container',
    'data-aue-filter': filter,
    'data-aue-label': 'Content Section',
  };
}

/**
 * Helper to spread attributes into Lit html template
 *
 * Usage in Lit component:
 * ```typescript
 * import { spreadAttributes } from '../aue/universal-editor.js';
 *
 * render() {
 *   const attrs = getEditableAttributes(this.content, 'hero');
 *   return html`
 *     <div ${spreadAttributes(attrs)}>
 *       <h1 ${spreadAttributes(getFieldAttributes('title'))}>
 *         ${this.content.title}
 *       </h1>
 *     </div>
 *   `;
 * }
 * ```
 */
export function spreadAttributes(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

/**
 * Check if Universal Editor is enabled
 */
export function isUEEnabled(): boolean {
  return config.enabled;
}

/**
 * Get current Universal Editor configuration
 */
export function getUEConfig(): UEConfig {
  return { ...config };
}

/**
 * Listen for Universal Editor events
 */
export function onUEEvent(
  eventType: 'aue:content-patch' | 'aue:ui-select' | 'aue:ui-preview',
  callback: (event: CustomEvent) => void,
): () => void {
  const handler = (e: Event) => callback(e as CustomEvent);
  document.addEventListener(eventType, handler);

  // Return cleanup function
  return () => document.removeEventListener(eventType, handler);
}

/**
 * Notify Universal Editor of content changes
 */
export function notifyContentChange(resourcePath: string, property: string, value: string): void {
  if (!config.enabled) return;

  const event = new CustomEvent('aue:content-update', {
    detail: {
      resource: resourcePath,
      property,
      value,
    },
    bubbles: true,
  });

  document.dispatchEvent(event);
}
