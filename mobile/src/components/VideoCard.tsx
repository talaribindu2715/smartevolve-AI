import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
import { YouTubeVideo } from "../types";
import { Badge } from "./Badge";
import { colors, radius, spacing } from "../theme/colors";

interface VideoCardProps {
  video: YouTubeVideo;
  onPress: (video: YouTubeVideo) => void;
  layout?: "vertical" | "horizontal";
  style?: any;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPress,
  layout = "vertical",
  style,
}) => {
  const isCompleted = video.watchStatus === "COMPLETED";
  const isInProgress = video.watchStatus === "IN_PROGRESS";
  const thumbnail = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;

  if (layout === "horizontal") {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress(video)}
        style={[styles.horizontalCard, style]}
      >
        <View style={styles.horizontalThumbWrap}>
          <Image source={{ uri: thumbnail }} style={styles.horizontalThumb} resizeMode="cover" />
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{video.duration || `${video.estimatedMinutes}m`}</Text>
          </View>
          {video.progressPercentage > 0 && (
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, video.progressPercentage)}%` },
                  isCompleted && styles.progressBarDone,
                ]}
              />
            </View>
          )}
        </View>

        <View style={styles.horizontalContent}>
          <View style={styles.topBadgesRow}>
            <Badge label={video.difficulty} variant="primary" />
            {isCompleted && <Badge label="DONE" variant="success" />}
            {isInProgress && <Badge label="IN PROGRESS" variant="warning" />}
          </View>

          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {video.title}
          </Text>

          <Text style={styles.channelName} numberOfLines={1}>
            📺 {video.channelTitle}
          </Text>

          <View style={styles.bottomMetaRow}>
            {video.skillName && (
              <Text style={styles.skillTag} numberOfLines={1}>
                {video.skillName}
              </Text>
            )}
            {video.viewCount && (
              <Text style={styles.viewsText}>• {video.viewCount}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default Vertical Layout
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(video)}
      style={[styles.verticalCard, style]}
    >
      <View style={styles.thumbWrap}>
        <Image source={{ uri: thumbnail }} style={styles.thumbImg} resizeMode="cover" />
        <View style={styles.thumbDarkGradient} />

        {/* Top Badges */}
        <View style={styles.overlayTopRow}>
          <Badge label={video.difficulty} variant="primary" />
          {isCompleted ? (
            <Badge label="COMPLETED" variant="success" />
          ) : isInProgress ? (
            <Badge label="WATCHING" variant="warning" />
          ) : null}
        </View>

        {/* Play Icon Circle */}
        <View style={styles.centerPlayBtn}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill={colors.textPrimary}>
            <Polygon points="5 3 19 12 5 21 5 3" />
          </Svg>
        </View>

        {/* Duration Chip */}
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>{video.duration || `${video.estimatedMinutes}m`}</Text>
        </View>

        {/* Progress Bar Underneath Thumbnail */}
        {video.progressPercentage > 0 && (
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, video.progressPercentage)}%` },
                isCompleted && styles.progressBarDone,
              ]}
            />
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={styles.bodyWrap}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {video.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.channelName} numberOfLines={1}>
            {video.channelTitle}
          </Text>
          {video.viewCount && (
            <Text style={styles.viewsText}>• {video.viewCount}</Text>
          )}
        </View>

        {video.skillName && (
          <View style={styles.skillPill}>
            <Text style={styles.skillPillText}>{video.skillName}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  verticalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  thumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  thumbDarkGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 15, 25, 0.35)",
  },
  overlayTopRow: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  centerPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239, 68, 68, 0.9)", // YouTube brand red
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  durationPill: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  durationText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
  },
  progressBarTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#EF4444",
  },
  progressBarDone: {
    backgroundColor: colors.success,
  },
  bodyWrap: {
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs + 2,
  },
  channelName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  viewsText: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  skillPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginTop: 2,
  },
  skillPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },

  // Horizontal Layout
  horizontalCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  horizontalThumbWrap: {
    width: 140,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  horizontalThumb: {
    width: "100%",
    height: "100%",
  },
  horizontalContent: {
    flex: 1,
    padding: spacing.sm + 2,
    justifyContent: "space-between",
  },
  topBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  horizontalTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
  },
  bottomMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  skillTag: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "500",
  },
});
