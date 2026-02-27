/**
 * Services Index
 * Central export point for all application services
 */

// Logging
export { logger, apiLogger, uiLogger, collaborationLogger, contentLogger } from './logger.js';

// Error Handling
export { errorHandler, withErrorHandling, withRetry } from './error-handler.js';
export type { AppError, ErrorCode } from './error-handler.js';

// API
export { api, apiWithRetry } from './api.js';
export type {
  TaskRequest,
  TaskResponse,
  RecommendationRequest,
  AemHealthResponse,
  DamBrowseResponse,
} from './api.js';

// State Management
export { appState, connectState } from './app-state.js';
export type {
  AppState,
  ViewMode,
  GenerationState,
  AemState,
  CollaborationState,
  PageSection,
} from './app-state.js';

// Keyboard Shortcuts
export { keyboardShortcuts } from './keyboard-shortcuts.js';
export type { Shortcut } from './keyboard-shortcuts.js';

// History (existing)
export { HistoryService } from './history-service.js';

// Collaboration (existing)
export { collaborationService } from './collaboration-service.js';
