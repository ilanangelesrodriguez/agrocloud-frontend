/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/lotes/:id(\\d+)", destination: "/lots/:id", permanent: true },
      { source: "/notificaciones", destination: "/notifications", permanent: true },
      { source: "/suscripcion", destination: "/settings/subscription", permanent: true },
    ];
  },
  transpilePackages: ["@agrocloud/ui", "@agrocloud/api-client"],
};

export default nextConfig;
