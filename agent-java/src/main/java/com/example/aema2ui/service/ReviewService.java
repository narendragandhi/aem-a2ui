package com.example.aema2ui.service;

import com.example.aema2ui.model.*;
import com.example.aema2ui.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing content reviews and collaborative feedback.
 */
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * Create a new review for content.
     */
    public Review createReview(String contentId, ContentSuggestion content, List<Reviewer> reviewers, String createdBy) {
        Review review = Review.builder()
                .id(UUID.randomUUID().toString())
                .contentId(contentId)
                .content(content)
                .status(ReviewStatus.PENDING_REVIEW)
                .reviewers(reviewers)
                .createdBy(createdBy)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .version(1)
                .build();

        // Save initial version
        saveContentVersion(contentId, content, createdBy, "Initial version for review");

        return reviewRepository.save(review);
    }

    /**
     * Get a review by ID.
     */
    public Optional<Review> getReview(String reviewId) {
        return reviewRepository.findById(reviewId);
    }

    /**
     * Get all reviews for a content item.
     */
    public List<Review> getReviewsByContentId(String contentId) {
        return reviewRepository.findByContentId(contentId);
    }

    /**
     * Get all reviews.
     */
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    /**
     * Add a comment to a review.
     */
    public Review addComment(String reviewId, String author, String authorName, String commentContent, String field) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        ReviewComment comment = ReviewComment.builder()
                .id(UUID.randomUUID().toString())
                .author(author)
                .authorName(authorName)
                .content(commentContent)
                .field(field)
                .timestamp(Instant.now())
                .resolved(false)
                .build();

        review.getComments().add(comment);
        review.setUpdatedAt(Instant.now());

        // If not already in review, transition to in review
        if (review.getStatus() == ReviewStatus.PENDING_REVIEW) {
            review.setStatus(ReviewStatus.IN_REVIEW);
        }

        return reviewRepository.save(review);
    }

    /**
     * Resolve a comment.
     */
    public Review resolveComment(String reviewId, String commentId, String resolvedBy) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .ifPresent(comment -> {
                    comment.setResolved(true);
                    comment.setResolvedBy(resolvedBy);
                    comment.setResolvedAt(Instant.now());
                });

        review.setUpdatedAt(Instant.now());
        return reviewRepository.save(review);
    }

    /**
     * Unresolve a comment.
     */
    public Review unresolveComment(String reviewId, String commentId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .ifPresent(comment -> {
                    comment.setResolved(false);
                    comment.setResolvedBy(null);
                    comment.setResolvedAt(null);
                });

        review.setUpdatedAt(Instant.now());
        return reviewRepository.save(review);
    }

    /**
     * Approve a review.
     */
    public Review approve(String reviewId, String approvedBy) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.setStatus(ReviewStatus.APPROVED);
        review.setApprovedBy(approvedBy);
        review.setApprovedAt(Instant.now());
        review.setUpdatedAt(Instant.now());

        return reviewRepository.save(review);
    }

    /**
     * Reject a review.
     */
    public Review reject(String reviewId, String rejectedBy, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.setStatus(ReviewStatus.REJECTED);
        review.setRejectedBy(rejectedBy);
        review.setRejectedAt(Instant.now());
        review.setRejectionReason(reason);
        review.setUpdatedAt(Instant.now());

        return reviewRepository.save(review);
    }

    /**
     * Request changes on a review.
     */
    public Review requestChanges(String reviewId, String requestedBy, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.setStatus(ReviewStatus.CHANGES_REQUESTED);
        review.setRejectionReason(reason);
        review.setUpdatedAt(Instant.now());

        return reviewRepository.save(review);
    }

    /**
     * Update content in a review (creates new version).
     */
    public Review updateContent(String reviewId, ContentSuggestion newContent, String updatedBy, String changeNote) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        // Save new version
        int newVersion = reviewRepository.getNextVersionNumber(review.getContentId());
        saveContentVersion(review.getContentId(), newContent, updatedBy, changeNote);

        review.setContent(newContent);
        review.setVersion(newVersion);
        review.setUpdatedAt(Instant.now());

        // If changes were requested, move back to pending
        if (review.getStatus() == ReviewStatus.CHANGES_REQUESTED) {
            review.setStatus(ReviewStatus.PENDING_REVIEW);
        }

        return reviewRepository.save(review);
    }

    /**
     * Save a content version.
     */
    private ContentVersion saveContentVersion(String contentId, ContentSuggestion content, String createdBy, String changeNote) {
        int version = reviewRepository.getNextVersionNumber(contentId);

        ContentVersion contentVersion = ContentVersion.builder()
                .id(UUID.randomUUID().toString())
                .contentId(contentId)
                .version(version)
                .content(content)
                .createdBy(createdBy)
                .createdAt(Instant.now())
                .changeNote(changeNote)
                .build();

        return reviewRepository.saveVersion(contentVersion);
    }

    /**
     * Record a new content version outside of a review.
     */
    public ContentVersion recordVersion(String contentId, ContentSuggestion content, String createdBy, String changeNote) {
        return saveContentVersion(contentId, content, createdBy, changeNote);
    }

    /**
     * Get version history for content.
     */
    public List<ContentVersion> getVersionHistory(String contentId) {
        return reviewRepository.findVersionsByContentId(contentId);
    }

    /**
     * Get a specific version.
     */
    public Optional<ContentVersion> getVersion(String contentId, int version) {
        return reviewRepository.findVersionByContentIdAndVersion(contentId, version);
    }

    /**
     * Mark a reviewer as having reviewed.
     */
    public Review markReviewed(String reviewId, String reviewerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        review.getReviewers().stream()
                .filter(r -> r.getId().equals(reviewerId))
                .findFirst()
                .ifPresent(reviewer -> reviewer.setHasReviewed(true));

        review.setUpdatedAt(Instant.now());
        return reviewRepository.save(review);
    }
}
