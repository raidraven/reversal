/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        // 旧Vercelサブドメインからのアクセスを独自ドメインへ301リダイレクト
        source: "/:path*",
        has: [{ type: "host", value: "reversal-plum.vercel.app" }],
        destination: "https://th-reversal.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // 全ルート共通のセキュリティヘッダー
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
