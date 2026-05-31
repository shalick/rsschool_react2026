import { QueryClient } from '@tanstack/react-query';

const parseCacheTtlMs = (): number => {
  const rawValue = import.meta.env.VITE_QUERY_CACHE_TTL_MS;
  const parsed = Number(rawValue);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return 300_000;
};

export const queryCacheTime = parseCacheTtlMs();
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: queryCacheTime,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
