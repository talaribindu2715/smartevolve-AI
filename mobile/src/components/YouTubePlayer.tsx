import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from "react-native";
import Svg, { Path, Polygon } from "react-native-svg";
import { colors, radius, spacing } from "../theme/colors";

interface YouTubePlayerProps {
  videoIdOrUrl: string;
  title?: string;
  thumbnailUrl?: string;
  height?: number;
  autoPlay?: boolean;
  onEnded?: () => void;
  style?: any;
}

export const extractYouTubeVideoId = (input: string): string => {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes("?")) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : trimmed;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoIdOrUrl,
  title,
  thumbnailUrl,
  height,
  autoPlay = false,
  onEnded,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const videoId = useMemo(() => extractYouTubeVideoId(videoIdOrUrl), [videoIdOrUrl]);
  const fallbackThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;

  const handleOpenExternal = () => {
    Linking.openURL(youtubeUrl).catch((err) => {
      console.warn("Could not open YouTube link:", err);
    });
  };

  // For Web platform
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.playerFrame}>
          {!isPlaying ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.thumbnailPoster}
              onPress={() => setIsPlaying(true)}
            >
              <Image source={{ uri: fallbackThumbnail }} style={styles.thumbnailImg} resizeMode="cover" />
              <View style={styles.posterOverlay} />
              <View style={styles.playButtonCircle}>
                <Svg width="28" height="28" viewBox="0 0 24 24" fill={colors.textPrimary}>
                  <Polygon points="5 3 19 12 5 21 5 3" />
                </Svg>
              </View>
              <View style={styles.watchBadge}>
                <Text style={styles.watchBadgeText}>Click to Watch Masterclass</Text>
              </View>
            </TouchableOpacity>
          ) : (
            // Standard iframe for web
            <iframe
              src={embedUrl}
              title={title || "YouTube Video"}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: radius.md,
                backgroundColor: "#000",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </View>

        {/* Video Player Meta & Controls */}
        <View style={styles.controlsBar}>
          <View style={styles.streamingMeta}>
            <View style={styles.liveDot} />
            <Text style={styles.streamingText}>YouTube HD Interactive Stream</Text>
          </View>
          <TouchableOpacity onPress={handleOpenExternal} style={styles.externalBtn}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2.5">
              <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <Path d="M15 3h6v6" />
              <Path d="M10 14L21 3" />
            </Svg>
            <Text style={styles.externalBtnText}>Open YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Native Android and iOS using react-native-webview
  let NativeWebView: any = null;
  try {
    NativeWebView = require("react-native-webview").WebView;
  } catch (e) {
    console.warn("react-native-webview is not available:", e);
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000; }
          body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.playerFrame}>
        {NativeWebView && !hasError ? (
          <>
            <NativeWebView
              source={{ html: htmlContent }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Connecting to YouTube...</Text>
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.thumbnailPoster}
            activeOpacity={0.85}
            onPress={handleOpenExternal}
          >
            <Image source={{ uri: fallbackThumbnail }} style={styles.thumbnailImg} resizeMode="cover" />
            <View style={styles.posterOverlay} />
            <View style={styles.playButtonCircle}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill={colors.textPrimary}>
                <Polygon points="5 3 19 12 5 21 5 3" />
              </Svg>
            </View>
            <View style={styles.watchBadge}>
              <Text style={styles.watchBadgeText}>Tap to Watch on YouTube</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Meta Footer */}
      <View style={styles.controlsBar}>
        <View style={styles.streamingMeta}>
          <View style={styles.liveDot} />
          <Text style={styles.streamingText}>YouTube HD Educational Stream</Text>
        </View>
        <TouchableOpacity onPress={handleOpenExternal} style={styles.externalBtn}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2.5">
            <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <Path d="M15 3h6v6" />
            <Path d="M10 14L21 3" />
          </Svg>
          <Text style={styles.externalBtnText}>Open YouTube App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  playerFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  thumbnailPoster: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbnailImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 15, 25, 0.45)",
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.92)", // YouTube brand red
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  watchBadge: {
    marginTop: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  watchBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 15, 25, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  streamingMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs + 2,
  },
  streamingText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  externalBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  externalBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});
