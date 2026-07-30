/**
 * Centralized API Service
 * Handles all HTTP communication with the backend agent
 */

import { ContentSuggestion, DamAsset, Review, PageRecommendation } from '../lib/types.js';
import { logger, apiLogger } from './logger.js';
import { errorHandler, withRetry, AppError } from './error-handler.js';

export interface TaskRequest {
  message: {
    role: 'user';
    parts: Array<{ text: string }>;
  };
}

export interface TaskResponse {
  id: string;
  status: string;
  messages: unknown[];
  artifacts: unknown[];
}

export interface RecommendationRequest {
  description: string;
}

export interface AemHealthResponse {
  connected: boolean;
  authorUrl?: string;
  publishUrl?: string;
  version?: string;
}

export interface DamBrowseResponse {
  assets: DamAsset[];
  folders: Array<{ name: string; path: string }>;
  total: number;
}

class ApiService {
  private baseUrl: string;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.baseUrl =
      (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_JAVA_AGENT_URL) ||
      (import.meta as Record<string, any>).env?.VITE_JAVA_AGENT_URL ||
      'http://localhost:10003';
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    apiLogger.info(`Base URL set to: ${url}`);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Cancel a pending request
  cancel(requestId: string) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
      apiLogger.debug(`Request cancelled: ${requestId}`);
    }
  }

  // Cancel all pending requests
  cancelAll() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
    apiLogger.debug('All requests cancelled');
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}, requestId?: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();

    if (requestId) {
      this.abortControllers.set(requestId, controller);
    }

    const startTime = performance.now();

    try {
      apiLogger.debug(`Request: ${options.method || 'GET'} ${endpoint}`);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
      });

      const duration = Math.round(performance.now() - startTime);
      apiLogger.debug(`Response: ${response.status} (${duration}ms)`);

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    } finally {
      if (requestId) {
        this.abortControllers.delete(requestId);
      }
    }
  }

  // Content Generation
  async generateContent(prompt: string): Promise<TaskResponse> {
    return this.fetch<TaskResponse>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          message: {
            role: 'user',
            parts: [{ text: prompt }],
          },
        } as TaskRequest),
      },
      'generate-content',
    );
  }

  // Advanced Generation (with component type)
  async generateAdvancedContent(
    prompt: string,
    componentType: string,
    options?: {
      tone?: string;
      imageStyle?: string;
    },
  ): Promise<TaskResponse> {
    const fullPrompt = options
      ? `[${componentType}] ${prompt} (tone: ${options.tone || 'professional'}, style: ${options.imageStyle || 'photography'})`
      : `[${componentType}] ${prompt}`;

    return this.fetch<TaskResponse>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          message: {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        }),
      },
      'generate-advanced',
    );
  }

  // Streaming Generation
  createStreamingConnection(
    prompt: string,
    componentType: string,
    onEvent: (event: string, data: unknown) => void,
    onError: (error: AppError) => void,
  ): EventSource {
    const params = new URLSearchParams({
      input: prompt,
      componentType,
    });

    const eventSource = new EventSource(`${this.baseUrl}/stream/generate?${params}`);

    eventSource.onopen = () => {
      apiLogger.debug('SSE connection opened');
    };

    eventSource.onerror = (e) => {
      apiLogger.error('SSE error', e);
      const error = errorHandler.parse(new Error('Streaming connection failed'), 'SSE');
      onError(error);
    };

    // Handle different event types
    const eventTypes = [
      'RUN_STARTED',
      'TEXT_MESSAGE_START',
      'TEXT_MESSAGE_DELTA',
      'TEXT_MESSAGE_END',
      'STATE_DELTA',
      'RUN_FINISHED',
      'RUN_ERROR',
    ];

    eventTypes.forEach((type) => {
      eventSource.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent(type, data);
        } catch {
          onEvent(type, e.data);
        }
      });
    });

    return eventSource;
  }

  // AI Recommendations
  async getRecommendation(description: string): Promise<PageRecommendation> {
    return this.fetch<PageRecommendation>(
      '/recommend',
      {
        method: 'POST',
        body: JSON.stringify({ description }),
      },
      'recommendation',
    );
  }

  // AEM Health Check
  async checkAemHealth(): Promise<AemHealthResponse> {
    try {
      return await this.fetch<AemHealthResponse>('/aem/health');
    } catch {
      return { connected: false };
    }
  }

  // AEM Configuration
  async getAemConfig(): Promise<Record<string, unknown>> {
    return this.fetch('/aem/config');
  }

  // Save to AEM
  async saveToAem(content: ContentSuggestion, path: string): Promise<{ success: boolean; path: string }> {
    return this.fetch('/aem/content', {
      method: 'POST',
      body: JSON.stringify({ content, path }),
    });
  }

  // Content Versioning
  async recordContentVersion(
    contentId: string,
    content: ContentSuggestion,
    createdBy: string,
    changeNote: string,
  ): Promise<{ id: string }> {
    return this.fetch(`/content/${contentId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ content, createdBy, changeNote }),
    });
  }

  // DAM Operations
  async browseDam(folder: string = '/content/dam'): Promise<DamBrowseResponse> {
    const params = new URLSearchParams({ folder });
    return this.fetch(`/dam/browse?${params}`);
  }

  async searchDam(query: string, type?: string): Promise<DamBrowseResponse> {
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    return this.fetch(`/dam/search?${params}`);
  }

  async getAssetDetails(path: string): Promise<DamAsset> {
    const params = new URLSearchParams({ path });
    return this.fetch(`/dam/asset?${params}`);
  }

  // Review Operations
  async createReview(contentId: string): Promise<Review> {
    return this.fetch('/reviews', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
    });
  }

  async getReview(reviewId: string): Promise<Review> {
    return this.fetch(`/reviews/${reviewId}`);
  }

  async approveReview(reviewId: string, comment?: string): Promise<Review> {
    return this.fetch(`/reviews/${reviewId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async rejectReview(reviewId: string, reason: string): Promise<Review> {
    return this.fetch(`/reviews/${reviewId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async addComment(reviewId: string, comment: string, field?: string): Promise<Review> {
    return this.fetch(`/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, field }),
    });
  }

  // Workflow Operations
  async getWorkflowModels(): Promise<Array<{ id: string; name: string; description: string }>> {
    return this.fetch('/workflows/models');
  }

  async submitToWorkflow(contentId: string, workflowModel: string): Promise<{ workflowId: string }> {
    return this.fetch('/workflows/submit', {
      method: 'POST',
      body: JSON.stringify({ contentId, workflowModel }),
    });
  }

  async getWorkflowStatus(workflowId: string): Promise<{ status: string; step: string }> {
    return this.fetch(`/workflows/${workflowId}/status`);
  }

  // Brand Operations
  async getBrands(): Promise<Array<{ id: string; name: string }>> {
    return this.fetch('/brands');
  }

  async getActiveBrand(): Promise<Record<string, unknown>> {
    return this.fetch('/brands/active');
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.fetch('/actuator/health');
  }
}

// Export singleton
export const api = new ApiService();

// Helper for retryable API calls
export async function apiWithRetry<T>(operation: () => Promise<T>, context?: string): Promise<T> {
  return withRetry(operation, { context, maxRetries: 3, delay: 1000 });
}
