# Workflow Feature Implementation Plan

## Overview

Add **AEM Workflow Integration** and **Collaborative Review** capabilities to the AEM A2UI.

---

## Feature 1: AEM Workflow Integration

### Goal
Connect generated content to AEM's native workflow engine for publish/approval workflows.

### Components to Create

#### Backend (Java)

**1. WorkflowService.java** (new)
```
Location: agent-java/src/main/java/com/example/aema2ui/service/WorkflowService.java
```
- `submitToWorkflow(contentId, workflowModel, metadata)` - Submit content to AEM workflow
- `getWorkflowStatus(workflowInstanceId)` - Check workflow state
- `getAvailableWorkflows()` - List workflow models (Publish, Review & Approve, etc.)
- `cancelWorkflow(workflowInstanceId)` - Cancel pending workflow

**2. WorkflowController.java** (new)
```
Location: agent-java/src/main/java/com/example/aema2ui/controller/WorkflowController.java
```
Endpoints:
- `POST /workflows/submit` - Submit content to workflow
- `GET /workflows/{id}/status` - Get workflow status
- `GET /workflows/models` - List available workflow models
- `DELETE /workflows/{id}` - Cancel workflow

**3. Data Models** (new)
```
Location: agent-java/src/main/java/com/example/aema2ui/model/
```
- `WorkflowSubmission.java` - Request to submit content
- `WorkflowStatus.java` - Workflow state (RUNNING, COMPLETED, SUSPENDED, ABORTED)
- `WorkflowModel.java` - Available workflow templates

#### Frontend (TypeScript/Lit)

**4. workflow-panel.ts** (new component)
```
Location: client/src/components/workflow-panel.ts
```
Features:
- Workflow model selector dropdown
- Submit to Workflow button
- Status indicator (Draft, In Workflow, Published)
- Workflow history timeline

**5. Types Extension**
```
Location: client/src/lib/types.ts
```
Add:
```typescript
interface WorkflowSubmission {
  contentId: string;
  workflowModel: string;
  metadata?: Record<string, any>;
}

interface WorkflowStatus {
  id: string;
  status: 'RUNNING' | 'COMPLETED' | 'SUSPENDED' | 'ABORTED';
  currentStep?: string;
  startedAt: string;
  completedAt?: string;
}

type WorkflowModel = 'publish' | 'review-approve' | 'translation' | 'custom';
```

### Integration Points
- Add `<workflow-panel>` to `aem-assistant.ts` (right panel, below preview)
- Wire events: `submit-to-workflow`, `workflow-status-changed`
- Update `ContentSuggestion` with `workflowStatus?: WorkflowStatus`

---

## Feature 2: Collaborative Review

### Goal
Enable multi-user review with comments, annotations, and version tracking.

### Components to Create

#### Backend (Java)

**1. ReviewService.java** (new)
```
Location: agent-java/src/main/java/com/example/aema2ui/service/ReviewService.java
```
- `createReview(contentId, reviewers)` - Start review process
- `addComment(reviewId, comment)` - Add comment to content
- `resolveComment(commentId)` - Mark comment resolved
- `updateStatus(reviewId, status)` - Approve/Reject/Request Changes
- `getReviewHistory(contentId)` - Get all reviews for content
- `getVersionHistory(contentId)` - Track content versions

**2. ReviewController.java** (new)
```
Location: agent-java/src/main/java/com/example/aema2ui/controller/ReviewController.java
```
Endpoints:
- `POST /reviews` - Create new review
- `GET /reviews/{id}` - Get review details
- `POST /reviews/{id}/comments` - Add comment
- `PATCH /reviews/{id}/comments/{commentId}` - Resolve comment
- `POST /reviews/{id}/approve` - Approve content
- `POST /reviews/{id}/reject` - Reject content
- `GET /content/{id}/versions` - Get version history

**3. Data Models** (new)
```
Location: agent-java/src/main/java/com/example/aema2ui/model/
```
- `Review.java` - Review entity with status, reviewers, comments
- `ReviewComment.java` - Comment with author, timestamp, field reference
- `ReviewStatus.java` - Enum (PENDING, IN_REVIEW, APPROVED, REJECTED, CHANGES_REQUESTED)
- `ContentVersion.java` - Version snapshot with timestamp

**4. In-Memory Store** (for demo)
```
Location: agent-java/src/main/java/com/example/aema2ui/repository/ReviewRepository.java
```
- Simple HashMap-based storage (can migrate to JPA later)

#### Frontend (TypeScript/Lit)

**5. review-panel.ts** (new component)
```
Location: client/src/components/review-panel.ts
```
Features:
- Review status badge (Draft, Pending Review, Approved, Rejected)
- Reviewer avatars with assignment
- Approve/Reject/Request Changes buttons
- Status history timeline

**6. review-comments.ts** (new component)
```
Location: client/src/components/review-comments.ts
```
Features:
- Comment thread display
- Add comment form
- Field-specific comments (click on title/description to comment)
- Resolve/unresolve toggle
- Author attribution with timestamp

**7. version-history.ts** (new component)
```
Location: client/src/components/version-history.ts
```
Features:
- Version timeline
- Compare versions side-by-side
- Restore previous version

**8. Types Extension**
```
Location: client/src/lib/types.ts
```
Add:
```typescript
interface Review {
  id: string;
  contentId: string;
  status: ReviewStatus;
  reviewers: Reviewer[];
  comments: ReviewComment[];
  createdAt: string;
  updatedAt: string;
}

type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested';

interface ReviewComment {
  id: string;
  author: string;
  content: string;
  field?: string;
  timestamp: string;
  resolved: boolean;
}

interface Reviewer {
  id: string;
  name: string;
  avatar?: string;
  role: 'reviewer' | 'approver';
}

interface ContentVersion {
  id: string;
  version: number;
  content: ContentSuggestion;
  createdAt: string;
  createdBy: string;
  changeNote?: string;
}
```

### Integration Points
- Add `<review-panel>` to `aem-assistant.ts` (collapsible panel below brand-panel)
- Add `<review-comments>` as overlay on `assistant-preview.ts`
- Wire events: `review-started`, `comment-added`, `review-action`, `version-restored`
- Update preview to show comment indicators on fields

---

## Implementation Order

### Phase 1: Core Review Infrastructure
1. Create `Review` and `ReviewComment` data models (backend)
2. Create `ReviewService.java` with in-memory storage
3. Create `ReviewController.java` with REST endpoints
4. Create `review-panel.ts` component (frontend)
5. Integrate into `aem-assistant.ts`

### Phase 2: Comments System
6. Create `review-comments.ts` component
7. Add field-level comment support in `assistant-preview.ts`
8. Wire comment events and API calls

### Phase 3: Version History
9. Create `ContentVersion` model and storage
10. Create `version-history.ts` component
11. Add version comparison UI

### Phase 4: AEM Workflow Integration
12. Create `WorkflowService.java` (mock AEM API initially)
13. Create `WorkflowController.java`
14. Create `workflow-panel.ts` component
15. Integrate workflow submission from review approval

### Phase 5: Polish & Testing
16. Add loading states and error handling
17. Add Spectrum styling consistency
18. Write unit tests for services
19. Update CLAUDE.md documentation

---

## File Summary

### New Files (Backend - 8 files)
```
agent-java/src/main/java/com/example/aema2ui/
├── controller/
│   ├── ReviewController.java
│   └── WorkflowController.java
├── service/
│   ├── ReviewService.java
│   └── WorkflowService.java
├── model/
│   ├── Review.java
│   ├── ReviewComment.java
│   ├── ContentVersion.java
│   └── WorkflowSubmission.java
└── repository/
    └── ReviewRepository.java
```

### New Files (Frontend - 4 files)
```
client/src/components/
├── review-panel.ts
├── review-comments.ts
├── version-history.ts
└── workflow-panel.ts
```

### Modified Files
```
client/src/lib/types.ts          # Add Review, Workflow types
client/src/aem-assistant.ts      # Integrate new panels
client/src/components/assistant-preview.ts  # Add comment indicators
CLAUDE.md                        # Document new features
```

---

## API Contract

### Review Endpoints
```
POST   /reviews                    # Create review
GET    /reviews/{id}               # Get review
POST   /reviews/{id}/comments      # Add comment
PATCH  /reviews/{id}/comments/{cid} # Update comment
POST   /reviews/{id}/approve       # Approve
POST   /reviews/{id}/reject        # Reject
GET    /content/{id}/versions      # Version history
```

### Workflow Endpoints
```
POST   /workflows/submit           # Submit to workflow
GET    /workflows/{id}/status      # Get status
GET    /workflows/models           # List models
DELETE /workflows/{id}             # Cancel
```

---

## Success Criteria

1. User can submit content for review with assigned reviewers
2. Reviewers can add comments on specific fields
3. Content can be approved/rejected with status tracking
4. Version history shows all content changes
5. Approved content can be submitted to AEM workflow
6. Workflow status is visible in UI
7. All interactions use Adobe Spectrum design system
