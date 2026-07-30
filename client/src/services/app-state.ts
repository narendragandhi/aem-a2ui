/**
 * Centralized Application State Management
 * Uses a simple observable pattern for reactive updates
 */

import { ContentSuggestion, Review, DamAsset, LiveUser, ChatMessage, CursorPosition } from '../lib/types.js';
import { logger } from './logger.js';

// View modes simplified from 4 to 2
export type ViewMode = 'create' | 'build';

// Content generation state
export interface GenerationState {
  loading: boolean;
  error: string | null;
  progress: number; // 0-100
  stage: 'idle' | 'analyzing' | 'generating' | 'scoring' | 'complete';
}

// AEM connection state
export interface AemState {
  connected: boolean;
  authorUrl: string;
  enabled: boolean;
}

// Collaboration state
export interface CollaborationState {
  connected: boolean;
  users: LiveUser[];
  cursors: CursorPosition[];
  chatMessages: ChatMessage[];
  fieldLocks: Array<{ field: string; sessionId: string; username: string }>;
}

// Main application state interface
export interface AppState {
  // UI State
  viewMode: ViewMode;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;

  // Content State
  prompt: string;
  suggestions: ContentSuggestion[];
  selectedSuggestion: ContentSuggestion | null;
  appliedContent: ContentSuggestion | null;
  history: ContentSuggestion[];

  // Page Builder State
  pageSections: PageSection[];
  currentSectionIndex: number;

  // Generation State
  generation: GenerationState;

  // AEM State
  aem: AemState;

  // Review State
  currentReview: Review | null;
  showCommentsPanel: boolean;

  // DAM State
  showDamBrowser: boolean;
  selectedDamAsset: DamAsset | null;

  // Collaboration State
  collaboration: CollaborationState;

  // UI Flags
  showOnboarding: boolean;
  showStreamingModal: boolean;
  demoMode: boolean;
}

export interface PageSection {
  id: string;
  type: string;
  content: ContentSuggestion | null;
  status: 'empty' | 'generating' | 'ready';
  prompt?: string;
}

// Initial state
const initialState: AppState = {
  viewMode: 'create',
  theme: 'light',
  sidebarCollapsed: false,

  prompt: '',
  suggestions: [],
  selectedSuggestion: null,
  appliedContent: null,
  history: [],

  pageSections: [],
  currentSectionIndex: 0,

  generation: {
    loading: false,
    error: null,
    progress: 0,
    stage: 'idle',
  },

  aem: {
    connected: false,
    authorUrl: '',
    enabled: true,
  },

  currentReview: null,
  showCommentsPanel: false,

  showDamBrowser: false,
  selectedDamAsset: null,

  collaboration: {
    connected: false,
    users: [],
    cursors: [],
    chatMessages: [],
    fieldLocks: [],
  },

  showOnboarding: false,
  showStreamingModal: false,
  demoMode: false,
};

type StateListener<T> = (value: T) => void;
type StateSelector<T> = (state: AppState) => T;

class AppStateManager {
  private state: AppState;
  private listeners: Map<string, Set<StateListener<unknown>>> = new Map();
  private globalListeners: Set<StateListener<AppState>> = new Set();

  constructor() {
    this.state = { ...initialState };
    this.loadPersistedState();
  }

  // Load persisted state from localStorage
  private loadPersistedState() {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.state.theme = savedTheme;
      }

      const savedHistory = localStorage.getItem('content-history');
      if (savedHistory) {
        this.state.history = JSON.parse(savedHistory);
      }

      const onboardingComplete = localStorage.getItem('aem-a2ui-onboarding-completed');
      this.state.showOnboarding = !onboardingComplete;
    } catch (e) {
      logger.warn('Failed to load persisted state', 'AppState', e);
    }
  }

  // Get current state
  getState(): AppState {
    return { ...this.state };
  }

  // Get a specific slice of state
  select<T>(selector: StateSelector<T>): T {
    return selector(this.state);
  }

  // Update state
  setState(updates: Partial<AppState>) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };

    logger.debug('State updated', 'AppState', { updates });

    // Notify global listeners
    this.globalListeners.forEach((listener) => listener(this.state));

    // Notify specific listeners
    Object.keys(updates).forEach((key) => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        const newValue = this.state[key as keyof AppState];
        keyListeners.forEach((listener) => listener(newValue));
      }
    });

    // Persist certain state changes
    this.persistState(prevState, this.state);
  }

  // Update nested state
  updateGeneration(updates: Partial<GenerationState>) {
    this.setState({
      generation: { ...this.state.generation, ...updates },
    });
  }

  updateAem(updates: Partial<AemState>) {
    this.setState({
      aem: { ...this.state.aem, ...updates },
    });
  }

  updateCollaboration(updates: Partial<CollaborationState>) {
    this.setState({
      collaboration: { ...this.state.collaboration, ...updates },
    });
  }

  // Persist state to localStorage
  private persistState(prev: AppState, next: AppState) {
    if (prev.theme !== next.theme) {
      localStorage.setItem('theme', next.theme);
    }
    if (prev.history !== next.history) {
      localStorage.setItem('content-history', JSON.stringify(next.history.slice(0, 50)));
    }
  }

  // Subscribe to all state changes
  subscribe(listener: StateListener<AppState>): () => void {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }

  // Subscribe to specific state key
  subscribeToKey<K extends keyof AppState>(key: K, listener: StateListener<AppState[K]>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener as StateListener<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener as StateListener<unknown>);
    };
  }

  // Reset state to initial
  reset() {
    this.state = { ...initialState };
    this.globalListeners.forEach((listener) => listener(this.state));
  }

  // Action: Start content generation
  startGeneration(prompt: string) {
    this.setState({
      prompt,
      suggestions: [],
      selectedSuggestion: null,
    });
    this.updateGeneration({
      loading: true,
      error: null,
      progress: 0,
      stage: 'analyzing',
    });
  }

  // Action: Update generation progress
  updateProgress(progress: number, stage: GenerationState['stage']) {
    this.updateGeneration({ progress, stage });
  }

  // Action: Complete generation
  completeGeneration(suggestions: ContentSuggestion[]) {
    const selected = suggestions[0] || null;
    this.setState({
      suggestions,
      selectedSuggestion: selected,
      appliedContent: selected,
    });
    this.updateGeneration({
      loading: false,
      progress: 100,
      stage: 'complete',
    });

    // Add to history
    if (selected) {
      const history = [selected, ...this.state.history.filter((h) => h.id !== selected.id)];
      this.setState({ history: history.slice(0, 50) });
    }
  }

  // Action: Generation failed
  failGeneration(error: string) {
    this.updateGeneration({
      loading: false,
      error,
      stage: 'idle',
    });
  }

  // Action: Select a suggestion
  selectSuggestion(suggestion: ContentSuggestion) {
    this.setState({
      selectedSuggestion: suggestion,
      appliedContent: suggestion,
    });
  }

  // Action: Update applied content
  updateContent(content: ContentSuggestion) {
    this.setState({ appliedContent: content });

    // Also update in suggestions if it exists
    const suggestions = this.state.suggestions.map((s) => (s.id === content.id ? content : s));
    this.setState({ suggestions });
  }

  // Action: Toggle theme
  toggleTheme() {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.setState({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  // Action: Toggle view mode
  setViewMode(mode: ViewMode) {
    this.setState({ viewMode: mode });
    if (mode === 'build') {
      this.setState({ pageSections: [] });
    }
  }

  // Action: Clear history
  clearHistory() {
    this.setState({ history: [] });
    localStorage.removeItem('content-history');
  }
}

// Export singleton instance
export const appState = new AppStateManager();

// Helper hook for Lit components
export function connectState<T>(
  element: HTMLElement,
  selector: StateSelector<T>,
  callback: (value: T) => void,
): () => void {
  // Initial call
  callback(appState.select(selector));

  // Subscribe to changes
  return appState.subscribe((state) => {
    callback(selector(state));
  });
}
