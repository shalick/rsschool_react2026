import { QueryClient } from '@tanstack/react-query';

const parseCacheTtlMs = (): number => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawValue = (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env?.VITE_QUERY_CACHE_TTL_MS) ?? process.env.VITE_QUERY_CACHE_TTL_MS;
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
