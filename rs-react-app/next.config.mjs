const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is run separately via `npm run lint`; skip during next build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
