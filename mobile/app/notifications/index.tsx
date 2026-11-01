import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { AppNotification } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationPress = (n: AppNotification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    if (n.actionUrl) {
      router.push(n.actionUrl as any);
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "ACHIEVEMENT":
      case "MILESTONE":
        return "blockchain";
      case "FEEDBACK":
        return "info";
      case "ASSESSMENT":
        return "warning";
      default:
        return "primary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ACHIEVEMENT":
      case "MILESTONE":
        return "🏆";
      case "FEEDBACK":
        return "👨‍🏫";
      case "ASSESSMENT":
        return "📝";
      default:
        return "🔔";
    }
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.responsiveWrapper}>
        {/* Header Action Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Notification Center</Text>
            <Text style={styles.pageSub}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                : "All caught up! No unread notifications."}
            </Text>
          </View>
          {unreadCount > 0 && (
            <Button
              title="Mark All Read"
              onPress={() => markAllReadMutation.mutate()}
              size="sm"
              variant="outline"
              loading={markAllReadMutation.isPending}
            />
          )}
        </View>

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching updates...</Text>
          </View>
        ) : notifications && notifications.length > 0 ? (
          <View style={styles.listContainer}>
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(n)}
              >
                <Card
                  style={[
                    styles.notificationCard,
                    !n.read && styles.unreadCard,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconTypeRow}>
                      <Text style={styles.typeEmoji}>{getTypeIcon(n.type)}</Text>
                      <Badge
                        label={n.type}
                        variant={getTypeBadgeVariant(n.type)}
                      />
                    </View>
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.cardMessage}>{n.message}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.timestampText}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    {n.actionUrl && (
                      <Text style={styles.viewLinkText}>View Action →</Text>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </Svg>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              Milestone achievements, mentor feedback, and credential alerts will show up here.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  pageSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  listContainer: {
    gap: spacing.md,
  },
  notificationCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  iconTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  typeEmoji: {
    fontSize: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: spacing.xs,
  },
  timestampText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  viewLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 18,
  },
});
