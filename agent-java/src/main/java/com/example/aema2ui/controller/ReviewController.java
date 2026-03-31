package com.example.aema2ui.controller;

import com.example.aema2ui.model.*;
import com.example.aema2ui.service.ReviewService;
import com.example.aema2ui.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing content reviews and collaborative feedback.
 */
@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final TelemetryService telemetryService;

    public ReviewController(ReviewService reviewService, TelemetryService telemetryService) {
        this.reviewService = reviewService;
        this.telemetryService = telemetryService;
    }

    /**
     * Create a new review.
     * POST /reviews
     */
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody CreateReviewRequest request) {
        Review review = reviewService.createReview(
                request.getContentId(),
                request.getContent(),
                request.getReviewers(),
                request.getCreatedBy()
        );
        return ResponseEntity.ok(review);
    }

    /**
     * Get a review by ID.
     * GET /reviews/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Review> getReview(@PathVariable String id) {
        return reviewService.getReview(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all reviews.
     * GET /reviews
     */
    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews(
            @RequestParam(required = false) String contentId) {
        List<Review> reviews;
        if (contentId != null && !contentId.isEmpty()) {
            reviews = reviewService.getReviewsByContentId(contentId);
        } else {
            reviews = reviewService.getAllReviews();
        }
        return ResponseEntity.ok(reviews);
    }

    /**
     * Add a comment to a review.
     * POST /reviews/{id}/comments
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<Review> addComment(
            @PathVariable String id,
            @RequestBody AddCommentRequest request) {
        Review review = reviewService.addComment(
                id,
                request.getAuthor(),
                request.getAuthorName(),
                request.getContent(),
                request.getField()
        );
        return ResponseEntity.ok(review);
    }

    /**
     * Resolve a comment.
     * PATCH /reviews/{id}/comments/{commentId}/resolve
     */
    @PatchMapping("/{id}/comments/{commentId}/resolve")
    public ResponseEntity<Review> resolveComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody Map<String, String> request) {
        String resolvedBy = request.getOrDefault("resolvedBy", "anonymous");
        Review review = reviewService.resolveComment(id, commentId, resolvedBy);
        return ResponseEntity.ok(review);
    }

    /**
     * Unresolve a comment.
     * PATCH /reviews/{id}/comments/{commentId}/unresolve
     */
    @PatchMapping("/{id}/comments/{commentId}/unresolve")
    public ResponseEntity<Review> unresolveComment(
            @PathVariable String id,
            @PathVariable String commentId) {
        Review review = reviewService.unresolveComment(id, commentId);
        return ResponseEntity.ok(review);
    }

    /**
     * Approve a review.
     * POST /reviews/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Review> approve(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String approvedBy = request.getOrDefault("approvedBy", "anonymous");
        Review review = reviewService.approve(id, approvedBy);
        return ResponseEntity.ok(review);
    }

    /**
     * Reject a review.
     * POST /reviews/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Review> reject(
            @PathVariable String id,
            @RequestBody RejectRequest request) {
        Review review = reviewService.reject(id, request.getRejectedBy(), request.getReason());
        return ResponseEntity.ok(review);
    }

    /**
     * Request changes on a review.
     * POST /reviews/{id}/request-changes
     */
    @PostMapping("/{id}/request-changes")
    public ResponseEntity<Review> requestChanges(
            @PathVariable String id,
            @RequestBody RequestChangesRequest request) {
        Review review = reviewService.requestChanges(id, request.getRequestedBy(), request.getReason());
        return ResponseEntity.ok(review);
    }

    /**
     * Update content in a review.
     * PUT /reviews/{id}/content
     */
    @PutMapping("/{id}/content")
    public ResponseEntity<Review> updateContent(
            @PathVariable String id,
            @RequestBody UpdateContentRequest request) {
        Review review = reviewService.updateContent(
                id,
                request.getContent(),
                request.getUpdatedBy(),
                request.getChangeNote()
        );
        return ResponseEntity.ok(review);
    }

    /**
     * Get version history for content.
     * GET /content/{contentId}/versions
     */
    @GetMapping("/content/{contentId}/versions")
    public ResponseEntity<List<ContentVersion>> getVersionHistory(@PathVariable String contentId) {
        List<ContentVersion> versions = reviewService.getVersionHistory(contentId);
        return ResponseEntity.ok(versions);
    }

    /**
     * Get a specific version.
     * GET /content/{contentId}/versions/{version}
     */
    @GetMapping("/content/{contentId}/versions/{version}")
    public ResponseEntity<ContentVersion> getVersion(
            @PathVariable String contentId,
            @PathVariable int version) {
        return reviewService.getVersion(contentId, version)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Record a new version for content (outside review workflow).
     * POST /content/{contentId}/versions
     */
    @PostMapping("/content/{contentId}/versions")
    public ResponseEntity<ContentVersion> recordVersion(
            @PathVariable String contentId,
            @RequestBody RecordVersionRequest request) {
        ContentVersion version = reviewService.recordVersion(
                contentId,
                request.getContent(),
                request.getCreatedBy(),
                request.getChangeNote()
        );
        telemetryService.record("content.version.recorded", Map.of(
            "contentId", contentId,
            "version", version.getVersion()
        ));
        return ResponseEntity.ok(version);
    }

    /**
     * Restore a version and create a new version with restored content.
     * POST /content/{contentId}/versions/restore
     */
    @PostMapping("/content/{contentId}/versions/restore")
    public ResponseEntity<ContentSuggestion> restoreVersion(
            @PathVariable String contentId,
            @RequestBody RestoreVersionRequest request) {
        return reviewService.getVersion(contentId, request.getVersion())
                .map(version -> {
                    reviewService.recordVersion(
                            contentId,
                            version.getContent(),
                            request.getUpdatedBy(),
                            request.getChangeNote()
                    );
                    telemetryService.record("content.version.restored", Map.of(
                        "contentId", contentId,
                        "version", request.getVersion()
                    ));
                    return ResponseEntity.ok(version.getContent());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Mark reviewer as having reviewed.
     * POST /reviews/{id}/reviewers/{reviewerId}/mark-reviewed
     */
    @PostMapping("/{id}/reviewers/{reviewerId}/mark-reviewed")
    public ResponseEntity<Review> markReviewed(
            @PathVariable String id,
            @PathVariable String reviewerId) {
        Review review = reviewService.markReviewed(id, reviewerId);
        return ResponseEntity.ok(review);
    }

    // Request DTOs

    @lombok.Data
    public static class CreateReviewRequest {
        private String contentId;
        private ContentSuggestion content;
        private List<Reviewer> reviewers;
        private String createdBy;
    }

    @lombok.Data
    public static class AddCommentRequest {
        private String author;
        private String authorName;
        private String content;
        private String field;
    }

    @lombok.Data
    public static class RejectRequest {
        private String rejectedBy;
        private String reason;
    }

    @lombok.Data
    public static class RequestChangesRequest {
        private String requestedBy;
        private String reason;
    }

    @lombok.Data
    public static class UpdateContentRequest {
        private ContentSuggestion content;
        private String updatedBy;
        private String changeNote;
    }

    @lombok.Data
    public static class RecordVersionRequest {
        private ContentSuggestion content;
        private String createdBy;
        private String changeNote;
    }

    @lombok.Data
    public static class RestoreVersionRequest {
        private int version;
        private String updatedBy;
        private String changeNote;
    }
}
