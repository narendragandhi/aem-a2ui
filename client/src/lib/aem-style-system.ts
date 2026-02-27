/**
 * AEM Style System Support
 * Generate style policies and CSS class mappings for components
 */

export interface StyleGroup {
  id: string;
  name: string;
  styles: StyleOption[];
}

export interface StyleOption {
  id: string;
  name: string;
  cssClasses: string;
  description?: string;
  preview?: string; // CSS for preview
}

export interface ComponentStylePolicy {
  componentPath: string;
  resourceType: string;
  styleGroups: StyleGroup[];
}

/**
 * Pre-defined Style Groups for AEM Core Components
 */
export const STYLE_GROUPS: Record<string, StyleGroup[]> = {
  'teaser': [
    {
      id: 'layout',
      name: 'Layout',
      styles: [
        { id: 'default', name: 'Default', cssClasses: '', description: 'Standard teaser layout' },
        { id: 'card', name: 'Card', cssClasses: 'cmp-teaser--card', description: 'Card-style with shadow' },
        { id: 'horizontal', name: 'Horizontal', cssClasses: 'cmp-teaser--horizontal', description: 'Side-by-side layout' },
        { id: 'overlay', name: 'Overlay', cssClasses: 'cmp-teaser--overlay', description: 'Text overlays image' },
      ],
    },
    {
      id: 'size',
      name: 'Size',
      styles: [
        { id: 'small', name: 'Small', cssClasses: 'cmp-teaser--small' },
        { id: 'medium', name: 'Medium', cssClasses: 'cmp-teaser--medium' },
        { id: 'large', name: 'Large', cssClasses: 'cmp-teaser--large' },
        { id: 'full', name: 'Full Width', cssClasses: 'cmp-teaser--full' },
      ],
    },
    {
      id: 'theme',
      name: 'Theme',
      styles: [
        { id: 'light', name: 'Light', cssClasses: 'cmp-teaser--light' },
        { id: 'dark', name: 'Dark', cssClasses: 'cmp-teaser--dark' },
        { id: 'brand', name: 'Brand', cssClasses: 'cmp-teaser--brand' },
      ],
    },
  ],
  'hero': [
    {
      id: 'height',
      name: 'Height',
      styles: [
        { id: 'auto', name: 'Auto', cssClasses: '' },
        { id: 'half', name: '50vh', cssClasses: 'cmp-hero--half' },
        { id: 'full', name: 'Full Screen', cssClasses: 'cmp-hero--fullscreen' },
      ],
    },
    {
      id: 'alignment',
      name: 'Content Alignment',
      styles: [
        { id: 'left', name: 'Left', cssClasses: 'cmp-hero--align-left' },
        { id: 'center', name: 'Center', cssClasses: 'cmp-hero--align-center' },
        { id: 'right', name: 'Right', cssClasses: 'cmp-hero--align-right' },
      ],
    },
    {
      id: 'overlay',
      name: 'Overlay',
      styles: [
        { id: 'none', name: 'None', cssClasses: '' },
        { id: 'light', name: 'Light Overlay', cssClasses: 'cmp-hero--overlay-light' },
        { id: 'dark', name: 'Dark Overlay', cssClasses: 'cmp-hero--overlay-dark' },
        { id: 'gradient', name: 'Gradient', cssClasses: 'cmp-hero--overlay-gradient' },
      ],
    },
  ],
  'button': [
    {
      id: 'variant',
      name: 'Variant',
      styles: [
        { id: 'primary', name: 'Primary', cssClasses: 'cmp-button--primary' },
        { id: 'secondary', name: 'Secondary', cssClasses: 'cmp-button--secondary' },
        { id: 'outline', name: 'Outline', cssClasses: 'cmp-button--outline' },
        { id: 'link', name: 'Link Style', cssClasses: 'cmp-button--link' },
      ],
    },
    {
      id: 'size',
      name: 'Size',
      styles: [
        { id: 'small', name: 'Small', cssClasses: 'cmp-button--sm' },
        { id: 'medium', name: 'Medium', cssClasses: '' },
        { id: 'large', name: 'Large', cssClasses: 'cmp-button--lg' },
      ],
    },
  ],
  'image': [
    {
      id: 'shape',
      name: 'Shape',
      styles: [
        { id: 'default', name: 'Default', cssClasses: '' },
        { id: 'rounded', name: 'Rounded', cssClasses: 'cmp-image--rounded' },
        { id: 'circle', name: 'Circle', cssClasses: 'cmp-image--circle' },
      ],
    },
    {
      id: 'effects',
      name: 'Effects',
      styles: [
        { id: 'none', name: 'None', cssClasses: '' },
        { id: 'shadow', name: 'Shadow', cssClasses: 'cmp-image--shadow' },
        { id: 'zoom', name: 'Zoom on Hover', cssClasses: 'cmp-image--zoom' },
      ],
    },
  ],
  'text': [
    {
      id: 'typography',
      name: 'Typography',
      styles: [
        { id: 'body', name: 'Body', cssClasses: '' },
        { id: 'lead', name: 'Lead Text', cssClasses: 'cmp-text--lead' },
        { id: 'small', name: 'Small', cssClasses: 'cmp-text--small' },
      ],
    },
    {
      id: 'columns',
      name: 'Columns',
      styles: [
        { id: 'single', name: 'Single', cssClasses: '' },
        { id: 'two', name: 'Two Columns', cssClasses: 'cmp-text--two-col' },
        { id: 'three', name: 'Three Columns', cssClasses: 'cmp-text--three-col' },
      ],
    },
  ],
};

/**
 * Generate Style Policy for a component
 */
export function generateStylePolicy(
  componentType: string,
  policyPath: string
): Record<string, unknown> {
  const styleGroups = STYLE_GROUPS[componentType] || [];

  const policy: Record<string, unknown> = {
    'jcr:primaryType': 'nt:unstructured',
    'jcr:title': `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Style Policy`,
    'sling:resourceType': 'wcm/core/components/policy/policy',
  };

  // Add style groups
  if (styleGroups.length > 0) {
    policy['cq:styleGroups'] = styleGroups.map(group => ({
      'cq:styleGroupLabel': group.name,
      'cq:styles': group.styles.map(style => ({
        'cq:styleId': style.id,
        'cq:styleLabel': style.name,
        'cq:styleCssClasses': style.cssClasses,
      })),
    }));
  }

  return policy;
}

/**
 * Generate CSS for Style System
 */
export function generateStyleSystemCss(componentType: string): string {
  const styleGroups = STYLE_GROUPS[componentType] || [];
  const cssRules: string[] = [];

  cssRules.push(`/* Style System CSS for ${componentType} */`);
  cssRules.push(`/* Generated by AEM Component Factory */\n`);

  for (const group of styleGroups) {
    cssRules.push(`/* ${group.name} styles */`);

    for (const style of group.styles) {
      if (!style.cssClasses) continue;

      const selector = `.${style.cssClasses.split(' ').join('.')}`;

      switch (componentType) {
        case 'teaser':
          cssRules.push(generateTeaserStyleCss(selector, style));
          break;
        case 'hero':
          cssRules.push(generateHeroStyleCss(selector, style));
          break;
        case 'button':
          cssRules.push(generateButtonStyleCss(selector, style));
          break;
        default:
          cssRules.push(`${selector} {\n  /* Add custom styles */\n}\n`);
      }
    }
  }

  return cssRules.join('\n');
}

function generateTeaserStyleCss(selector: string, style: StyleOption): string {
  const id = style.id;

  if (id === 'card') {
    return `${selector} {
  background: var(--teaser-card-bg, #fff);
  border-radius: var(--teaser-card-radius, 8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
${selector}:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
`;
  }

  if (id === 'horizontal') {
    return `${selector} {
  display: flex;
  flex-direction: row;
  align-items: center;
}
${selector} .cmp-teaser__image {
  flex: 0 0 40%;
  max-width: 40%;
}
${selector} .cmp-teaser__content {
  flex: 1;
  padding: 1.5rem;
}
`;
  }

  if (id === 'overlay') {
    return `${selector} {
  position: relative;
}
${selector} .cmp-teaser__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
}
`;
  }

  if (id.includes('dark')) {
    return `${selector} {
  background: var(--teaser-dark-bg, #1a1a1a);
  color: var(--teaser-dark-text, #fff);
}
`;
  }

  return `${selector} {\n  /* ${style.name} */\n}\n`;
}

function generateHeroStyleCss(selector: string, style: StyleOption): string {
  const id = style.id;

  if (id === 'half') {
    return `${selector} {
  min-height: 50vh;
}
`;
  }

  if (id === 'full' || id === 'fullscreen') {
    return `${selector} {
  min-height: 100vh;
  display: flex;
  align-items: center;
}
`;
  }

  if (id === 'center') {
    return `${selector} .cmp-hero__content {
  text-align: center;
  margin: 0 auto;
  max-width: 800px;
}
`;
  }

  if (id.includes('overlay')) {
    const overlayColor = id.includes('dark') ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)';
    return `${selector}::before {
  content: '';
  position: absolute;
  inset: 0;
  background: ${overlayColor};
  z-index: 1;
}
${selector} .cmp-hero__content {
  position: relative;
  z-index: 2;
}
`;
  }

  return `${selector} {\n  /* ${style.name} */\n}\n`;
}

function generateButtonStyleCss(selector: string, style: StyleOption): string {
  const id = style.id;

  if (id === 'primary') {
    return `${selector} {
  background: var(--button-primary-bg, #0070c9);
  color: var(--button-primary-text, #fff);
  border: none;
}
${selector}:hover {
  background: var(--button-primary-hover, #005a9e);
}
`;
  }

  if (id === 'secondary') {
    return `${selector} {
  background: var(--button-secondary-bg, #e0e0e0);
  color: var(--button-secondary-text, #333);
  border: none;
}
`;
  }

  if (id === 'outline') {
    return `${selector} {
  background: transparent;
  border: 2px solid var(--button-outline-color, #0070c9);
  color: var(--button-outline-color, #0070c9);
}
${selector}:hover {
  background: var(--button-outline-color, #0070c9);
  color: white;
}
`;
  }

  if (id === 'large' || id === 'lg') {
    return `${selector} {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}
`;
  }

  if (id === 'small' || id === 'sm') {
    return `${selector} {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
`;
  }

  return `${selector} {\n  /* ${style.name} */\n}\n`;
}

/**
 * Get available style groups for a component type
 */
export function getStyleGroupsForComponent(componentType: string): StyleGroup[] {
  return STYLE_GROUPS[componentType] || [];
}

/**
 * Generate full policy mapping
 */
export function generatePolicyMapping(
  templatePath: string,
  components: Array<{ type: string; policyName: string }>
): Record<string, unknown> {
  const mapping: Record<string, unknown> = {
    'jcr:primaryType': 'nt:unstructured',
    'sling:resourceType': 'wcm/core/components/policies/mappings',
  };

  for (const comp of components) {
    mapping[comp.type] = {
      'jcr:primaryType': 'nt:unstructured',
      'cq:policy': `${templatePath}/policies/${comp.policyName}`,
    };
  }

  return mapping;
}
