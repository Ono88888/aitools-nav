/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出 → Cloudflare Pages 直接部署静态文件
  output: 'export',
  trailingSlash: true,
  images: {
    // SSG 模式下使用 unoptimized，Cloudflare 不支持 Next.js Image Optimization
    unoptimized: true,
  },
  // 生产环境去掉 console.log
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
