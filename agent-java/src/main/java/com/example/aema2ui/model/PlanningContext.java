package com.example.aema2ui.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Intermediate state for the GOAP content generation planner.
 * Carries parsed intent, component type, and context through the planning pipeline.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanningContext {

    private String rawInput;
    private String componentType;
    private String targetAudience;
    private String brandStyle;
    private String toneOfVoice;
    private String damSearchQuery;
    private boolean damSearchRequired;
}
