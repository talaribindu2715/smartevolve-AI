package com.smartevolve.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class PrerequisiteResolverTest {

    private PrerequisiteResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new PrerequisiteResolver();
    }

    @Test
    @DisplayName("Should topologically sort resources so prerequisite comes before dependent module")
    void shouldSortInTopologicalOrder() {
        UUID resA = UUID.randomUUID(); // Python Basics (prerequisite)
        UUID resB = UUID.randomUUID(); // Advanced Python OOP (depends on A)
        UUID resC = UUID.randomUUID(); // Fast Data Processing with Pandas (depends on B)

        PrerequisiteResolver.ResourceNode nodeA = PrerequisiteResolver.ResourceNode.builder()
                .resourceId(resA).title("Python Basics").prerequisiteResourceIds(Collections.emptySet()).build();

        PrerequisiteResolver.ResourceNode nodeB = PrerequisiteResolver.ResourceNode.builder()
                .resourceId(resB).title("Advanced OOP").prerequisiteResourceIds(Set.of(resA)).build();

        PrerequisiteResolver.ResourceNode nodeC = PrerequisiteResolver.ResourceNode.builder()
                .resourceId(resC).title("Pandas").prerequisiteResourceIds(Set.of(resB)).build();

        List<PrerequisiteResolver.ResourceNode> unsorted = List.of(nodeC, nodeB, nodeA);
        List<PrerequisiteResolver.ResourceNode> sorted = resolver.resolveOrder(unsorted);

        assertEquals(3, sorted.size());
        assertEquals(resA, sorted.get(0).getResourceId(), "Foundational prerequisite A must come first");
        assertEquals(resB, sorted.get(1).getResourceId(), "Intermediate prerequisite B must come second");
        assertEquals(resC, sorted.get(2).getResourceId(), "Dependent resource C must come last");
    }

    @Test
    @DisplayName("Should unlock resource only when all its prerequisites are completed")
    void shouldDetermineStepUnlockStatus() {
        UUID prereq1 = UUID.randomUUID();
        UUID prereq2 = UUID.randomUUID();
        UUID targetRes = UUID.randomUUID();

        Set<UUID> prereqs = Set.of(prereq1, prereq2);

        // Case 1: Neither completed -> LOCKED
        String status1 = resolver.determineStepStatus(targetRes, prereqs, Collections.emptySet(), Collections.emptySet());
        assertEquals("LOCKED", status1);

        // Case 2: Only 1 completed -> LOCKED
        String status2 = resolver.determineStepStatus(targetRes, prereqs, Set.of(prereq1), Collections.emptySet());
        assertEquals("LOCKED", status2);

        // Case 3: Both completed -> AVAILABLE
        String status3 = resolver.determineStepStatus(targetRes, prereqs, Set.of(prereq1, prereq2), Collections.emptySet());
        assertEquals("AVAILABLE", status3);

        // Case 4: Target resource itself is already completed -> COMPLETED
        String status4 = resolver.determineStepStatus(targetRes, prereqs, Set.of(prereq1, prereq2, targetRes), Collections.emptySet());
        assertEquals("COMPLETED", status4);
    }
}
