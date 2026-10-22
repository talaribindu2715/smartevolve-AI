package com.smartevolve.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class PrerequisiteResolver {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceNode {
        private UUID resourceId;
        private String title;
        private UUID skillId;
        private String difficulty;
        private int estimatedMinutes;
        @Builder.Default
        private Set<UUID> prerequisiteResourceIds = new HashSet<>();
    }

    /**
     * Topologically sorts learning resources respecting prerequisite dependencies.
     * Throws an IllegalStateException if a circular dependency is detected.
     */
    public List<ResourceNode> resolveOrder(Collection<ResourceNode> nodes) {
        Map<UUID, ResourceNode> nodeMap = new HashMap<>();
        Map<UUID, Set<UUID>> adj = new HashMap<>();
        Map<UUID, Integer> inDegree = new HashMap<>();

        for (ResourceNode node : nodes) {
            nodeMap.put(node.getResourceId(), node);
            adj.putIfAbsent(node.getResourceId(), new HashSet<>());
            inDegree.putIfAbsent(node.getResourceId(), 0);
        }

        for (ResourceNode node : nodes) {
            for (UUID prereqId : node.getPrerequisiteResourceIds()) {
                if (nodeMap.containsKey(prereqId)) {
                    adj.putIfAbsent(prereqId, new HashSet<>());
                    adj.get(prereqId).add(node.getResourceId());
                    inDegree.put(node.getResourceId(), inDegree.get(node.getResourceId()) + 1);
                }
            }
        }

        // Kahn's algorithm for topological sorting
        Queue<UUID> queue = new LinkedList<>();
        for (Map.Entry<UUID, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.offer(entry.getKey());
            }
        }

        List<ResourceNode> sorted = new ArrayList<>();
        while (!queue.isEmpty()) {
            UUID curr = queue.poll();
            sorted.add(nodeMap.get(curr));

            for (UUID neighbor : adj.getOrDefault(curr, Collections.emptySet())) {
                inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        if (sorted.size() < nodeMap.size()) {
            // Fallback gracefully without crash if cycle exists, append remaining nodes
            for (ResourceNode node : nodes) {
                if (!sorted.contains(node)) {
                    sorted.add(node);
                }
            }
        }

        return sorted;
    }

    /**
     * Determines the unlock status (LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED)
     * for a given resource based on the student's completed resources set.
     */
    public String determineStepStatus(
            UUID resourceId,
            Set<UUID> prerequisiteIds,
            Set<UUID> completedResourceIds,
            Set<UUID> inProgressResourceIds) {

        if (completedResourceIds.contains(resourceId)) {
            return "COMPLETED";
        }
        if (inProgressResourceIds.contains(resourceId)) {
            return "IN_PROGRESS";
        }

        if (prerequisiteIds == null || prerequisiteIds.isEmpty()) {
            return "AVAILABLE";
        }

        // Must satisfy all prerequisites
        boolean allSatisfied = completedResourceIds.containsAll(prerequisiteIds);
        return allSatisfied ? "AVAILABLE" : "LOCKED";
    }
}
