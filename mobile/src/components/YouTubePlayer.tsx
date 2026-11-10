import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const [isLoadedStorage, setIsLoadedStorage] = useState<boolean>(false);
  const [resumedTimeDisplay, setResumedTimeDisplay] = useState<number | null>(null);
  const [playerKey, setPlayerKey] = useState<number>(1);
  const lastSavedTimeRef = useRef<number>(0);

  const fallbackThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (Platform.OS === "web") {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "setPlaybackRate",
            args: [speed],
          }),
          "*"
        );
      } catch (_) {}
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.player && window.player.setPlaybackRate) {
          window.player.setPlaybackRate(${speed});
        }
        true;
      `);
    }
  };

  const handleSeekRelative = (delta: number) => {
    if (Platform.OS === "web") {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "seekTo",
            args: [(lastSavedTimeRef.current || startSeconds || 0) + delta, true],
          }),
          "*"
        );
      } catch (_) {}
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.player && window.player.getCurrentTime && window.player.seekTo) {
          var curr = window.player.getCurrentTime();
          window.player.seekTo(Math.max(0, curr + (${delta})), true);
        }
        true;
      `);
    }
  };

  // 1. Load saved playback position from AsyncStorage
  useEffect(() => {
    let isMounted = true;
    if (!videoId) {
      setIsLoadedStorage(true);
      return;
    }

    AsyncStorage.getItem(`smartevolve_video_resume_${videoId}`)
      .then((val) => {
        if (!isMounted) return;
        if (val) {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed) && parsed > 3) {
            setStartSeconds(parsed);
            setResumedTimeDisplay(parsed);
            lastSavedTimeRef.current = parsed;
          } else {
            setStartSeconds(0);
            setResumedTimeDisplay(null);
            lastSavedTimeRef.current = 0;
          }
        } else {
          setStartSeconds(0);
          setResumedTimeDisplay(null);
          lastSavedTimeRef.current = 0;
        }
        setIsLoadedStorage(true);
      })
      .catch(() => {
        if (isMounted) setIsLoadedStorage(true);
      });

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  // 2. Position saving helpers
  const savePosition = (timeInSeconds: number) => {
    const sec = Math.floor(timeInSeconds);
    if (sec > 3 && Math.abs(sec - lastSavedTimeRef.current) >= 2) {
      lastSavedTimeRef.current = sec;
      AsyncStorage.setItem(`smartevolve_video_resume_${videoId}`, String(sec)).catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    lastSavedTimeRef.current = 0;
    setResumedTimeDisplay(null);
    AsyncStorage.removeItem(`smartevolve_video_resume_${videoId}`).catch(() => {});
    onEnded?.();
  };

  const handleResetToStart = async () => {
    lastSavedTimeRef.current = 0;
    setStartSeconds(0);
    setResumedTimeDisplay(null);
    await AsyncStorage.removeItem(`smartevolve_video_resume_${videoId}`).catch(() => {});
    setPlayerKey((k) => k + 1);
  };

  // 3. Web message listener for YouTube Iframe API
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleWebMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        if (data && data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            savePosition(data.info.currentTime);
          }
          if (data.info.playerState === 0) {
            handleVideoEnded();
          } else if (data.info.playerState === 2) {
            // Paused: explicitly persist current time immediately
            if (typeof data.info.currentTime === "number" && data.info.currentTime > 3) {
              const sec = Math.floor(data.info.currentTime);
              lastSavedTimeRef.current = sec;
              AsyncStorage.setItem(`smartevolve_video_resume_${videoId}`, String(sec)).catch(() => {});
            }
          }
        }
      } catch (_) {}
    };

    window.addEventListener("message", handleWebMessage);

    // Persist position on tab close / reload
    const handleBeforeUnload = () => {
      if (lastSavedTimeRef.current > 3 && videoId) {
        try {
          localStorage.setItem(`smartevolve_video_resume_${videoId}`, String(lastSavedTimeRef.current));
        } catch (_) {}
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("message", handleWebMessage);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [videoId]);

  // 4. Mobile AppState listener (save timestamp if app is minimized or backgrounded)
  useEffect(() => {
    if (Platform.OS === "web") return;

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState.match(/inactive|background/)) {
        if (lastSavedTimeRef.current > 3 && videoId) {
          AsyncStorage.setItem(
            `smartevolve_video_resume_${videoId}`,
            String(lastSavedTimeRef.current)
          ).catch(() => {});
        }
      }
    });

    return () => {
      sub.remove();
    };
  }, [videoId]);

  const handleOpenExternal = async () => {
    const resumeSeconds = lastSavedTimeRef.current || startSeconds || 0;
    const timeParam = resumeSeconds > 3 ? `&t=${resumeSeconds}s` : "";
    const appUri = `vnd.youtube:${videoId}${resumeSeconds > 3 ? `?t=${resumeSeconds}` : ""}`;
    const webUri = `https://www.youtube.com/watch?v=${videoId}${timeParam}`;
    try {
      const supported = await Linking.canOpenURL(appUri);
      if (supported) {
        await Linking.openURL(appUri);
        return;
      }
    } catch (_) {}
    Linking.openURL(webUri).catch((err) => {
      console.warn("Could not open YouTube link:", err);
    });
  };

  // Quick Player Controls Bar (Speed, Seek, and External)
  const renderQuickControls = () => (
    <View style={styles.quickBar}>
      <View style={styles.speedRow}>
        <Text style={styles.controlLabel}>⚡ Speed:</Text>
        {[1, 1.25, 1.5, 1.75, 2].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.speedPill, playbackSpeed === s && styles.speedPillActive]}
            onPress={() => handleSetSpeed(s)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.speedPillText,
                playbackSpeed === s && styles.speedPillTextActive,
              ]}
            >
              {s}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.seekRow}>
        <TouchableOpacity
          style={styles.seekBtn}
          onPress={() => handleSeekRelative(-10)}
          activeOpacity={0.7}
        >
          <Text style={styles.seekBtnText}>⏪ -10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.seekBtn}
          onPress={() => handleSeekRelative(10)}
          activeOpacity={0.7}
        >
          <Text style={styles.seekBtnText}>+10s ⏩</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.externalAppBtn}
          onPress={handleOpenExternal}
          activeOpacity={0.7}
        >
          <Text style={styles.externalAppBtnText}>📺 YouTube App ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Web Platform
  if (Platform.OS === "web") {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.youtube.com";
    const webEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&start=${startSeconds}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.playerFrame}>
          {!isLoadedStorage ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : !isPlaying ? (
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
                <Text style={styles.watchBadgeText}>
                  {startSeconds > 3 ? `Resume Masterclass from ${formatTime(startSeconds)}` : "Click to Watch Masterclass"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <iframe
              ref={iframeRef}
              key={`web-player-${videoId}-${playerKey}`}
              src={webEmbedUrl}
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
        {renderQuickControls()}
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

  const nativeHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background-color: #000000;
      overflow: hidden;
      touch-action: pan-y manipulation;
      -webkit-overflow-scrolling: touch;
    }
    #player {
      width: 100%;
      height: 100%;
      border: 0;
    }
    /* Ensure YouTube popup menus can scroll vertically smoothly */
    .ytp-popup, .ytp-panel-menu, .ytp-settings-menu, .ytp-panel {
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
      max-height: 100% !important;
    }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    var timer = null;

    function postMsg(type, currentTime, state) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          currentTime: currentTime,
          playerState: state
        }));
      }
    }

    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        videoId: '${videoId}',
        playerVars: {
          autoplay: 1,
          start: ${startSeconds},
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          fs: 1,
          iv_load_policy: 3
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      window.player = player;
    }

    function onPlayerReady(event) {
      window.player = player;
      if (${startSeconds} > 0 && player.seekTo) {
        player.seekTo(${startSeconds}, true);
      }
      player.playVideo();
    }

    function onPlayerStateChange(event) {
      // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
      if (event.data === 1) {
        if (!timer) {
          timer = setInterval(function() {
            if (player && player.getCurrentTime) {
              postMsg('TIME_UPDATE', Math.floor(player.getCurrentTime()), 1);
            }
          }, 2000);
        }
      } else {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        if (player && player.getCurrentTime) {
          postMsg(event.data === 0 ? 'VIDEO_ENDED' : 'TIME_UPDATE', Math.floor(player.getCurrentTime()), event.data);
        }
      }
    }
  </script>
</body>
</html>`;
  }, [videoId, startSeconds, playerKey]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.playerFrame}>
        {NativeWebView && !hasError && isLoadedStorage ? (
          <>
            <NativeWebView
              ref={webViewRef}
              key={`native-player-${videoId}-${playerKey}`}
              source={{
                html: nativeHtml,
                baseUrl: "https://com.smartevolve.ai",
              }}
              userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
              originWhitelist={["*"]}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo={true}
              mixedContentMode="always"
              nestedScrollEnabled={true}
              scrollEnabled={true}
              overScrollMode="never"
              showsVerticalScrollIndicator={false}
              setBuiltInZoomControls={false}
              androidHardwareAccelerationDisabled={false}
              onMessage={(event: any) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === "TIME_UPDATE" && typeof data.currentTime === "number") {
                    savePosition(data.currentTime);
                  } else if (data.type === "VIDEO_ENDED") {
                    handleVideoEnded();
                  }
                } catch (_) {}
              }}
              onShouldStartLoadWithRequest={(request: any) => {
                if (
                  request.url.startsWith("https://www.youtube.com/embed") ||
                  request.url.startsWith("https://www.youtube-nocookie.com/embed") ||
                  request.url.startsWith("about:blank") ||
                  request.url.startsWith("https://com.smartevolve.ai")
                ) {
                  return true;
                }
                if (request.url.includes("youtube.com") || request.url.includes("youtu.be")) {
                  handleOpenExternal();
                  return false;
                }
                return true;
              }}
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
              <Text style={styles.watchBadgeText}>
                {startSeconds > 3 ? `Resume in YouTube App from ${formatTime(startSeconds)} ↗` : "Tap to Play in YouTube App ↗"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      {renderQuickControls()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 880,
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  playerFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 480,
    backgroundColor: "#000000",
    position: "relative",
    alignSelf: "center",
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
  quickBar: {
    backgroundColor: "#0D1117",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  speedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  controlLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 2,
  },
  speedPill: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  speedPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  speedPillText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  speedPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  seekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seekBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  seekBtnText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
  },
  externalAppBtn: {
    backgroundColor: "rgba(99, 102, 241, 0.18)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.4)",
  },
  externalAppBtnText: {
    color: "#A5B4FC",
    fontSize: 11,
    fontWeight: "700",
  },
});
