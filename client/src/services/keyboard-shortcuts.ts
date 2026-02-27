/**
 * Keyboard Shortcuts Service
 * Provides keyboard navigation and shortcuts for power users
 */

import { logger } from './logger.js';

export interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: () => void;
  category?: string;
  enabled?: boolean;
}

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, Shortcut> = new Map();
  private enabled = true;
  private helpModalOpen = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.init();
  }

  private init() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.registerDefaultShortcuts();
  }

  private registerDefaultShortcuts() {
    // Help
    this.register({
      id: 'help',
      key: '?',
      modifiers: ['shift'],
      description: 'Show keyboard shortcuts',
      category: 'General',
      action: () => this.showHelp(),
    });

    // Focus search/input
    this.register({
      id: 'focus-input',
      key: '/',
      description: 'Focus content input',
      category: 'Navigation',
      action: () => this.focusInput(),
    });

    // Generate content
    this.register({
      id: 'generate',
      key: 'Enter',
      modifiers: ['ctrl'],
      description: 'Generate content',
      category: 'Actions',
      action: () => this.dispatchAction('generate'),
    });

    // Copy content
    this.register({
      id: 'copy-json',
      key: 'c',
      modifiers: ['ctrl', 'shift'],
      description: 'Copy content as JSON',
      category: 'Actions',
      action: () => this.dispatchAction('copy-json'),
    });

    // Copy as HTML
    this.register({
      id: 'copy-html',
      key: 'h',
      modifiers: ['ctrl', 'shift'],
      description: 'Copy content as HTML',
      category: 'Actions',
      action: () => this.dispatchAction('copy-html'),
    });

    // Toggle theme
    this.register({
      id: 'toggle-theme',
      key: 'd',
      modifiers: ['ctrl', 'shift'],
      description: 'Toggle dark/light mode',
      category: 'View',
      action: () => this.dispatchAction('toggle-theme'),
    });

    // Switch to Create mode
    this.register({
      id: 'mode-create',
      key: '1',
      modifiers: ['ctrl'],
      description: 'Switch to Create mode',
      category: 'Navigation',
      action: () => this.dispatchAction('mode-create'),
    });

    // Switch to Build mode
    this.register({
      id: 'mode-build',
      key: '2',
      modifiers: ['ctrl'],
      description: 'Switch to Build mode',
      category: 'Navigation',
      action: () => this.dispatchAction('mode-build'),
    });

    // Navigate suggestions
    this.register({
      id: 'next-suggestion',
      key: 'ArrowDown',
      modifiers: ['alt'],
      description: 'Next suggestion',
      category: 'Navigation',
      action: () => this.dispatchAction('next-suggestion'),
    });

    this.register({
      id: 'prev-suggestion',
      key: 'ArrowUp',
      modifiers: ['alt'],
      description: 'Previous suggestion',
      category: 'Navigation',
      action: () => this.dispatchAction('prev-suggestion'),
    });

    // Apply suggestion
    this.register({
      id: 'apply-suggestion',
      key: 'Enter',
      modifiers: ['alt'],
      description: 'Apply selected suggestion',
      category: 'Actions',
      action: () => this.dispatchAction('apply-suggestion'),
    });

    // Escape - close modals
    this.register({
      id: 'escape',
      key: 'Escape',
      description: 'Close modal/panel',
      category: 'General',
      action: () => this.dispatchAction('escape'),
    });

    // Undo (for future implementation)
    this.register({
      id: 'undo',
      key: 'z',
      modifiers: ['ctrl'],
      description: 'Undo last change',
      category: 'Edit',
      action: () => this.dispatchAction('undo'),
    });

    // Redo
    this.register({
      id: 'redo',
      key: 'z',
      modifiers: ['ctrl', 'shift'],
      description: 'Redo last change',
      category: 'Edit',
      action: () => this.dispatchAction('redo'),
    });

    // Save to AEM
    this.register({
      id: 'save-aem',
      key: 's',
      modifiers: ['ctrl', 'shift'],
      description: 'Save to AEM',
      category: 'Actions',
      action: () => this.dispatchAction('save-aem'),
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return;

    // Skip if in input field (unless it's a global shortcut)
    const target = event.target as HTMLElement;
    const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Generate shortcut key
    const key = this.getShortcutKey(event);

    // Find matching shortcut
    const shortcut = this.shortcuts.get(key);
    if (!shortcut || shortcut.enabled === false) return;

    // Skip input-blocking shortcuts when in input
    if (isInInput && !['escape', 'generate'].includes(shortcut.description.toLowerCase())) {
      // Allow certain shortcuts even in input
      if (!event.ctrlKey && !event.metaKey) return;
    }

    // Execute shortcut
    event.preventDefault();
    event.stopPropagation();

    logger.debug(`Shortcut triggered: ${shortcut.description}`, 'Keyboard');
    shortcut.action();
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');

    parts.push(event.key.toLowerCase());

    return parts.join('+');
  }

  private configToKey(config: ShortcutConfig): string {
    const parts: string[] = [];

    if (config.ctrl || config.meta) parts.push('ctrl');
    if (config.alt) parts.push('alt');
    if (config.shift) parts.push('shift');

    parts.push(config.key.toLowerCase());

    return parts.join('+');
  }

  register(options: {
    id: string;
    key: string;
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
    description: string;
    category?: string;
    action: () => void;
    enabled?: boolean;
  }) {
    const config: ShortcutConfig = {
      key: options.key,
      ctrl: options.modifiers?.includes('ctrl') || options.modifiers?.includes('meta'),
      alt: options.modifiers?.includes('alt'),
      shift: options.modifiers?.includes('shift'),
    };

    const shortcutKey = this.configToKey(config);

    this.shortcuts.set(shortcutKey, {
      key: options.key,
      modifiers: options.modifiers,
      description: options.description,
      category: options.category,
      action: options.action,
      enabled: options.enabled ?? true,
    });
  }

  unregister(id: string) {
    // Find and remove by iterating
    for (const [key, shortcut] of this.shortcuts) {
      if (shortcut.description === id) {
        this.shortcuts.delete(key);
        break;
      }
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  private focusInput() {
    const input = document.querySelector('assistant-input input, assistant-input textarea') as HTMLElement;
    if (input) {
      input.focus();
    }
  }

  private dispatchAction(action: string) {
    document.dispatchEvent(
      new CustomEvent('keyboard-shortcut', {
        detail: { action },
        bubbles: true,
      })
    );
  }

  private showHelp() {
    this.helpModalOpen = !this.helpModalOpen;
    document.dispatchEvent(
      new CustomEvent('show-shortcuts-help', {
        detail: { open: this.helpModalOpen },
        bubbles: true,
      })
    );
  }

  // Get all shortcuts grouped by category
  getShortcutsGrouped(): Map<string, Shortcut[]> {
    const grouped = new Map<string, Shortcut[]>();

    for (const shortcut of this.shortcuts.values()) {
      const category = shortcut.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(shortcut);
    }

    return grouped;
  }

  // Format shortcut for display
  formatShortcut(shortcut: Shortcut): string {
    const parts: string[] = [];

    if (shortcut.modifiers?.includes('ctrl') || shortcut.modifiers?.includes('meta')) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.modifiers?.includes('alt')) {
      parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.modifiers?.includes('shift')) {
      parts.push('⇧');
    }

    // Format key nicely
    let keyDisplay = shortcut.key;
    if (keyDisplay === 'ArrowUp') keyDisplay = '↑';
    if (keyDisplay === 'ArrowDown') keyDisplay = '↓';
    if (keyDisplay === 'ArrowLeft') keyDisplay = '←';
    if (keyDisplay === 'ArrowRight') keyDisplay = '→';
    if (keyDisplay === 'Enter') keyDisplay = '↵';
    if (keyDisplay === 'Escape') keyDisplay = 'Esc';

    parts.push(keyDisplay.toUpperCase());

    return parts.join(' + ');
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

// Export singleton
export const keyboardShortcuts = new KeyboardShortcutsService();
