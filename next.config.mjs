import withSerwistInit from "@serwist/next";

const revision = crypto.randomUUID();

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  additionalPrecacheEntries: [{ url: "/~offline", revision: revision }],
});

export default withSerwist({ ...nextConfig });
