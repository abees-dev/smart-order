import { QueryClient } from "@tanstack/react-query";

// Configure React Query with 10-minute cache
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes (600000 ms)
      staleTime: 10 * 60 * 1000, // 10 minutes
      // Keep data in cache for 15 minutes after becoming unused
      gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (can be disabled if not needed)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Mutation retry delay
      retryDelay: 1000,
    },
  },
});

// Export types for convenience
export type {
  UseQueryResult,
  UseMutationResult,
  QueryKey,
} from "@tanstack/react-query";
