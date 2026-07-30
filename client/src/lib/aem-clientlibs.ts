/**
 * AEM ClientLib Generator
 * Generate CSS/JS clientlibs for components
 */

import { ContentSuggestion } from './types.js';
import { generateStyleSystemCss, getStyleGroupsForComponent } from './aem-style-system.js';

export interface ClientLibConfig {
  name: string;
  categories: string[];
  dependencies?: string[];
  embeds?: string[];
}

export interface ClientLibFile {
  path: string;
  content: string;
  type: 'css' | 'js' | 'less' | 'txt';
}

export interface ClientLib {
  config: ClientLibConfig;
  files: ClientLibFile[];
}

/**
 * Generate base component CSS
 */
function generateBaseComponentCss(componentType: string): string {
  const baseStyles: Record<string, string> = {
    hero: `/* Hero Component Base Styles */
.cmp-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 400px;
  overflow: hidden;
}

.cmp-hero__image-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.cmp-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cmp-hero__content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 800px;
}

.cmp-hero__title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.cmp-hero__subtitle {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  opacity: 0.9;
}

.cmp-hero__description {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.cmp-hero__cta {
  display: inline-block;
  padding: 0.875rem 1.75rem;
  background: var(--cta-bg, #0070c9);
  color: var(--cta-text, #fff);
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s, transform 0.2s;
}

.cmp-hero__cta:hover {
  background: var(--cta-hover-bg, #005a9e);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .cmp-hero {
    min-height: 300px;
  }
  .cmp-hero__title {
    font-size: 2rem;
  }
  .cmp-hero__subtitle {
    font-size: 1.25rem;
  }
}`,

    teaser: `/* Teaser Component Base Styles */
.cmp-teaser {
  display: flex;
  flex-direction: column;
  background: var(--teaser-bg, #fff);
  border-radius: var(--teaser-radius, 8px);
  overflow: hidden;
}

.cmp-teaser__image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.cmp-teaser__content {
  padding: 1.5rem;
}

.cmp-teaser__pretitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--teaser-pretitle-color, #666);
  margin-bottom: 0.5rem;
}

.cmp-teaser__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.cmp-teaser__description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--teaser-text-color, #444);
  margin: 0 0 1rem;
}

.cmp-teaser__action-container {
  margin-top: auto;
}

.cmp-teaser__action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--teaser-link-color, #0070c9);
  text-decoration: none;
  font-weight: 500;
}

.cmp-teaser__action-link:hover {
  text-decoration: underline;
}`,

    button: `/* Button Component Base Styles */
.cmp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cmp-button:focus {
  outline: 2px solid var(--button-focus-color, #0070c9);
  outline-offset: 2px;
}

.cmp-button__text {
  white-space: nowrap;
}

.cmp-button__icon {
  width: 1.25em;
  height: 1.25em;
}`,

    image: `/* Image Component Base Styles */
.cmp-image {
  display: block;
  position: relative;
}

.cmp-image__image {
  width: 100%;
  height: auto;
  display: block;
}

.cmp-image__title {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--image-caption-color, #666);
}

/* Lazy loading placeholder */
.cmp-image--loading {
  background: var(--image-placeholder-bg, #f0f0f0);
  min-height: 200px;
}`,

    text: `/* Text Component Base Styles */
.cmp-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-color, #333);
}

.cmp-text h1,
.cmp-text h2,
.cmp-text h3,
.cmp-text h4,
.cmp-text h5,
.cmp-text h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}

.cmp-text p {
  margin: 0 0 1em;
}

.cmp-text a {
  color: var(--text-link-color, #0070c9);
}

.cmp-text ul,
.cmp-text ol {
  margin: 0 0 1em;
  padding-left: 1.5em;
}

.cmp-text blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid var(--text-quote-border, #ddd);
  font-style: italic;
}`,

    navigation: `/* Navigation Component Base Styles */
.cmp-navigation {
  display: flex;
  align-items: center;
}

.cmp-navigation__group {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

.cmp-navigation__item {
  position: relative;
}

.cmp-navigation__item-link {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--nav-link-color, #333);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.cmp-navigation__item-link:hover,
.cmp-navigation__item--active > .cmp-navigation__item-link {
  color: var(--nav-link-active-color, #0070c9);
}

/* Dropdown */
.cmp-navigation__group--level-1 {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: var(--nav-dropdown-bg, #fff);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
}

.cmp-navigation__item:hover > .cmp-navigation__group--level-1 {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}`,

    footer: `/* Footer Component Base Styles */
.cmp-footer {
  background: var(--footer-bg, #1a1a1a);
  color: var(--footer-text, #fff);
  padding: 3rem 2rem 1.5rem;
}

.cmp-footer__container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.cmp-footer__column-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.cmp-footer__links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cmp-footer__link {
  display: block;
  padding: 0.25rem 0;
  color: var(--footer-link-color, rgba(255,255,255,0.7));
  text-decoration: none;
  transition: color 0.2s;
}

.cmp-footer__link:hover {
  color: var(--footer-link-hover, #fff);
}

.cmp-footer__bottom {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--footer-border, rgba(255,255,255,0.1));
  text-align: center;
  font-size: 0.875rem;
  color: var(--footer-copyright, rgba(255,255,255,0.5));
}`,
  };

  return (
    baseStyles[componentType] ||
    `/* ${componentType} Component Base Styles */
.cmp-${componentType} {
  /* Add component styles here */
}`
  );
}

/**
 * Generate component JavaScript
 */
function generateComponentJs(componentType: string): string {
  const jsTemplates: Record<string, string> = {
    navigation: `/* Navigation Component JS */
(function() {
  'use strict';

  const NAV_SELECTORS = {
    nav: '.cmp-navigation',
    item: '.cmp-navigation__item',
    toggle: '.cmp-navigation__toggle'
  };

  function initNavigation(nav) {
    const toggle = nav.querySelector(NAV_SELECTORS.toggle);
    if (toggle) {
      toggle.addEventListener('click', function() {
        nav.classList.toggle('cmp-navigation--open');
      });
    }

    // Keyboard navigation
    nav.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        nav.classList.remove('cmp-navigation--open');
      }
    });
  }

  // Initialize all navigation components
  document.querySelectorAll(NAV_SELECTORS.nav).forEach(initNavigation);

  // Watch for dynamically added navigations
  if (window.MutationObserver) {
    new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.matches(NAV_SELECTORS.nav)) {
              initNavigation(node);
            }
            node.querySelectorAll(NAV_SELECTORS.nav).forEach(initNavigation);
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
})();`,

    carousel: `/* Carousel Component JS */
(function() {
  'use strict';

  function initCarousel(carousel) {
    const slides = carousel.querySelectorAll('.cmp-carousel__item');
    const prevBtn = carousel.querySelector('.cmp-carousel__prev');
    const nextBtn = carousel.querySelector('.cmp-carousel__next');
    const indicators = carousel.querySelectorAll('.cmp-carousel__indicator');

    let currentIndex = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('cmp-carousel__item--active', i === index);
      });
      indicators.forEach((ind, i) => {
        ind.classList.toggle('cmp-carousel__indicator--active', i === index);
      });
      currentIndex = index;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide((currentIndex - 1 + slides.length) % slides.length);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide((currentIndex + 1) % slides.length);
      });
    }

    indicators.forEach((ind, i) => {
      ind.addEventListener('click', () => showSlide(i));
    });

    // Auto-play
    const autoplay = carousel.dataset.autoplay === 'true';
    const interval = parseInt(carousel.dataset.interval) || 5000;

    if (autoplay) {
      setInterval(() => {
        showSlide((currentIndex + 1) % slides.length);
      }, interval);
    }
  }

  document.querySelectorAll('.cmp-carousel').forEach(initCarousel);
})();`,

    accordion: `/* Accordion Component JS */
(function() {
  'use strict';

  function initAccordion(accordion) {
    const items = accordion.querySelectorAll('.cmp-accordion__item');
    const singleExpand = accordion.dataset.singleExpand === 'true';

    items.forEach(item => {
      const button = item.querySelector('.cmp-accordion__button');
      const panel = item.querySelector('.cmp-accordion__panel');

      if (button && panel) {
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';

          if (singleExpand) {
            items.forEach(otherItem => {
              const otherButton = otherItem.querySelector('.cmp-accordion__button');
              const otherPanel = otherItem.querySelector('.cmp-accordion__panel');
              if (otherButton && otherPanel && otherItem !== item) {
                otherButton.setAttribute('aria-expanded', 'false');
                otherPanel.hidden = true;
              }
            });
          }

          button.setAttribute('aria-expanded', !isExpanded);
          panel.hidden = isExpanded;
        });
      }
    });
  }

  document.querySelectorAll('.cmp-accordion').forEach(initAccordion);
})();`,

    tabs: `/* Tabs Component JS */
(function() {
  'use strict';

  function initTabs(tabContainer) {
    const tabs = tabContainer.querySelectorAll('.cmp-tabs__tab');
    const panels = tabContainer.querySelectorAll('.cmp-tabs__tabpanel');

    function activateTab(tab) {
      const tabId = tab.getAttribute('aria-controls');

      tabs.forEach(t => {
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        t.tabIndex = t === tab ? 0 : -1;
      });

      panels.forEach(p => {
        p.hidden = p.id !== tabId;
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));

      tab.addEventListener('keydown', (e) => {
        const tabList = Array.from(tabs);
        const currentIndex = tabList.indexOf(tab);
        let newIndex;

        switch(e.key) {
          case 'ArrowLeft':
            newIndex = (currentIndex - 1 + tabList.length) % tabList.length;
            break;
          case 'ArrowRight':
            newIndex = (currentIndex + 1) % tabList.length;
            break;
          case 'Home':
            newIndex = 0;
            break;
          case 'End':
            newIndex = tabList.length - 1;
            break;
          default:
            return;
        }

        e.preventDefault();
        tabList[newIndex].focus();
        activateTab(tabList[newIndex]);
      });
    });
  }

  document.querySelectorAll('.cmp-tabs').forEach(initTabs);
})();`,
  };

  return (
    jsTemplates[componentType] ||
    `/* ${componentType} Component JS */
(function() {
  'use strict';

  function init${componentType.charAt(0).toUpperCase() + componentType.slice(1)}(element) {
    // Component initialization
  }

  document.querySelectorAll('.cmp-${componentType}').forEach(init${componentType.charAt(0).toUpperCase() + componentType.slice(1)});
})();`
  );
}

/**
 * Generate a complete clientlib for a component
 */
export function generateComponentClientLib(componentType: string, config: Partial<ClientLibConfig> = {}): ClientLib {
  const clientLibConfig: ClientLibConfig = {
    name: config.name || `aem-component-factory.${componentType}`,
    categories: config.categories || [`aem-component-factory.${componentType}`],
    dependencies: config.dependencies || ['aem-component-factory.base'],
    embeds: config.embeds,
  };

  const files: ClientLibFile[] = [];

  // Add base CSS
  files.push({
    path: `css/${componentType}.css`,
    content: generateBaseComponentCss(componentType),
    type: 'css',
  });

  // Add style system CSS
  const styleGroups = getStyleGroupsForComponent(componentType);
  if (styleGroups.length > 0) {
    files.push({
      path: `css/${componentType}.styles.css`,
      content: generateStyleSystemCss(componentType),
      type: 'css',
    });
  }

  // Add JS if component needs it
  const jsComponents = ['navigation', 'carousel', 'accordion', 'tabs', 'modal'];
  if (jsComponents.includes(componentType)) {
    files.push({
      path: `js/${componentType}.js`,
      content: generateComponentJs(componentType),
      type: 'js',
    });
  }

  // Add css.txt and js.txt
  const cssFiles = files.filter((f) => f.type === 'css').map((f) => f.path);
  const jsFiles = files.filter((f) => f.type === 'js').map((f) => f.path);

  if (cssFiles.length > 0) {
    files.push({
      path: 'css.txt',
      content: '#base=css\n' + cssFiles.map((f) => f.replace('css/', '')).join('\n'),
      type: 'txt',
    });
  }

  if (jsFiles.length > 0) {
    files.push({
      path: 'js.txt',
      content: '#base=js\n' + jsFiles.map((f) => f.replace('js/', '')).join('\n'),
      type: 'txt',
    });
  }

  return { config: clientLibConfig, files };
}

/**
 * Generate clientlib .content.xml
 */
export function generateClientLibContentXml(config: ClientLibConfig): string {
  const categories = config.categories.map((c) => `"${c}"`).join(',');
  const dependencies = config.dependencies?.map((d) => `"${d}"`).join(',') || '';
  const embeds = config.embeds?.map((e) => `"${e}"`).join(',') || '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    categories="[${categories}]"${dependencies ? `\n    dependencies="[${dependencies}]"` : ''}${embeds ? `\n    embeds="[${embeds}]"` : ''}/>`;
}

/**
 * Generate base clientlib with CSS custom properties
 */
export function generateBaseClientLib(): ClientLib {
  const baseCss = `/* AEM Component Factory - Base Styles */
:root {
  /* Colors */
  --color-primary: #0070c9;
  --color-primary-dark: #005a9e;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-heading: var(--font-family-base);
  --font-size-base: 1rem;
  --line-height-base: 1.5;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;

  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-tooltip: 1080;
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Typography defaults */
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: #333;
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
`;

  return {
    config: {
      name: 'aem-component-factory.base',
      categories: ['aem-component-factory.base'],
    },
    files: [
      { path: 'css/base.css', content: baseCss, type: 'css' },
      { path: 'css.txt', content: '#base=css\nbase.css', type: 'txt' },
    ],
  };
}

/**
 * Generate all clientlibs for multiple components
 */
export function generateAllClientLibs(componentTypes: string[]): ClientLib[] {
  const libs: ClientLib[] = [generateBaseClientLib()];

  for (const type of componentTypes) {
    libs.push(generateComponentClientLib(type));
  }

  return libs;
}
