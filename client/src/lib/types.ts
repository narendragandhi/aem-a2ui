export interface ContentSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
  imageAlt?: string;
  componentType: string;
  price?: string;
  visualScore?: number;
  selectedAssetId?: string;
  // SEO related properties
  seo?: SeoSuggestions;
  seoScore?: number;
  // Additional component-specific properties
  cta?: { text: string; url: string };
  items?: any[];
  quote?: string;
  author?: string;
  images?: string[];
}

export interface SeoSuggestions {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  schemaType?: string;
  readabilityScore?: number;
  keywordDensity?: { keyword: string; density: number }[];
  issues?: string[];
}

export interface ImageAsset {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  tags: string[];
  category: AssetCategory;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string;
  size?: number;
  brandAligned?: boolean;
  description?: string;
  createdAt?: string;
}

export type AssetCategory =
  | 'hero'
  | 'product'
  | 'lifestyle'
  | 'abstract'
  | 'team'
  | 'office'
  | 'technology'
  | 'nature'
  | 'illustration';

export interface AssetFilter {
  search?: string;
  category?: AssetCategory | 'all';
  tags?: string[];
  brandAligned?: boolean;
}

// Review & Collaboration Types

export type ReviewStatusType =
  | 'draft'
  | 'pending_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export interface ReviewComment {
  id: string;
  author: string;
  authorName: string;
  content: string;
  field?: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type ReviewerRole = 'reviewer' | 'approver';

export interface Reviewer {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: ReviewerRole;
  hasReviewed: boolean;
}

export interface Review {
  id: string;
  contentId: string;
  content: ContentSuggestion;
  status: ReviewStatusType;
  reviewers: Reviewer[];
  comments: ReviewComment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  version: number;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: ContentSuggestion;
  createdBy: string;
  createdAt: string;
  changeNote?: string;
}

// Workflow Types

export type WorkflowStatusType = 'RUNNING' | 'COMPLETED' | 'SUSPENDED' | 'ABORTED';

export interface WorkflowModel {
  id: string;
  name: string;
  description: string;
  path: string;
  requiresApproval: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  assignee?: string;
  startedAt?: string;
  completedAt?: string;
  comment?: string;
}

export interface WorkflowInstance {
  id: string;
  workflowModelId: string;
  workflowModelName: string;
  contentId: string;
  contentPath: string;
  status: WorkflowStatusType;
  currentStep: string;
  currentStepIndex: number;
  steps: WorkflowStep[];
  initiatedBy: string;
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// DAM Asset Types (for AEM integration)

export type DamAssetType = 'image' | 'video' | 'document' | 'audio' | 'folder' | 'file';

export interface DamAsset {
  path: string;
  name: string;
  title?: string;
  type: DamAssetType;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  originalUrl?: string;
  lastModified?: string;
  created?: string;
  createdBy?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  folder: boolean;
  children?: DamAsset[];
}

// AEM Connection Status

export interface AemHealth {
  enabled: boolean;
  connected: boolean;
  authorUrl: string;
  status: string;
  message?: string;
}

export interface AemConfig {
  enabled: boolean;
  authorUrl: string;
  contentRoot: string;
  damRoot: string;
  connected: boolean;
}

// Agent Recommendation Types (A2UI feature)

export interface SectionRecommendation {
  componentType: string;
  displayName: string;
  icon: string;
  reason: string;
  suggestedPrompt: string;
  position: number;
  required: boolean;
}

export interface PageRecommendation {
  pageType: string;
  reasoning: string;
  confidence: number;
  sections: SectionRecommendation[];
  alternatives: string[];
}

// Collaboration Types

export interface LiveUser {
  sessionId: string;
  username: string;
  color: string;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  currentField?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  username: string;
  content: string;
  timestamp: string;
  type?: 'message' | 'system' | 'action';
}

export interface CursorPosition {
  sessionId: string;
  username: string;
  color: string;
  x: number;
  y: number;
  field?: string;
  timestamp?: string;
}

export interface FieldLock {
  field: string;
  sessionId: string;
  username: string;
  lockedAt: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'review';
  title: string;
  message: string;
  fromUser?: string;
  timestamp: string;
  read?: boolean;
}
