/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true, // Disable Next.js Image Optimization for static export
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.alias['fs'] = false;
            config.resolve.alias['path'] = false;
            config.resolve.alias['os'] = false;
            config.resolve.alias['encoding'] = false;
        }
        return config;
    },
};

export default nextConfig;
