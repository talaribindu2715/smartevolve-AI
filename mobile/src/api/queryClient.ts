import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 3, // Auto-retry up to 3 times while Render cloud spins up
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000), // 2s, 4s, 8s backoff
    },
  },
});
