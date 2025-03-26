import withSerwistInit from "@serwist/next"

const revision = crypto.randomUUID()

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ revision, url: "/~offline" }],
  cacheOnNavigation: true,
  swDest: "public/sw.js",
  swSrc: "src/lib/sw.ts",
})

export default withSerwist({ ...nextConfig })
