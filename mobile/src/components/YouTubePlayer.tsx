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
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=https://www.youtube.com`;

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
            <iframe
              src={embedUrl}
              title={title || "SmartEvolve Masterclass"}
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

        {/* Quick fallback action bar */}
        <View style={styles.controlsBar}>
          <View style={styles.streamingMeta}>
            <View style={styles.liveDot} />
            <Text style={styles.streamingText}>Direct Player</Text>
          </View>
          <TouchableOpacity style={styles.externalBtn} onPress={handleOpenExternal}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444">
              <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </Svg>
            <Text style={styles.externalBtnText}>Open in YouTube App ↗</Text>
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

  // Robust HTML string preventing YouTube Error 153:
  // - strict-origin-when-cross-origin meta referrer tag
  // - Valid origin parameter matching https://www.youtube.com
  // - Omission of restrictive sandbox attribute which strips referer
  // - Omission of cross-origin DOM query scripts which trigger tamper detection
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="referrer" content="strict-origin-when-cross-origin">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background-color: #000000; }
          body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=https://www.youtube.com" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin">
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
              source={{
                html: htmlContent,
                baseUrl: "https://www.youtube.com",
                headers: {
                  Referer: "https://www.youtube.com",
                  Origin: "https://www.youtube.com",
                },
              }}
              originWhitelist={["*"]}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo={true}
              mixedContentMode="always"
              userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
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
                <Text style={styles.loadingText}>Connecting to SmartEvolve Player...</Text>
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
              <Text style={styles.watchBadgeText}>Tap to Play in YouTube App ↗</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Action footer with direct YouTube launch fallback */}
      <View style={styles.controlsBar}>
        <View style={styles.streamingMeta}>
          <View style={styles.liveDot} />
          <Text style={styles.streamingText}>In-App Masterclass Player</Text>
        </View>
        <TouchableOpacity style={styles.externalBtn} onPress={handleOpenExternal}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444">
            <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </Svg>
          <Text style={styles.externalBtnText}>Watch in YouTube App ↗</Text>
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
    backgroundColor: "rgba(239, 68, 68, 0.92)",
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
    paddingVertical: 8,
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
