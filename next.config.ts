import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "vieraboschkova.github.io",
                pathname: "/**",
            },
        ],
    },
}

export default nextConfig
