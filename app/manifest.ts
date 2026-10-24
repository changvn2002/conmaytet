import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

/**
 * Web App Manifest — cho phép cài app lên màn hình chính và chạy standalone
 * như app thật. Icon PNG lấy từ bộ asset hệ lens-04, raster hoá từ
 * artwork SVG chính thức (xem BRAND.md). Màu manifest theo tokens.json
 * (design/tokens.conmaytet-v4.json): theme = seed #198038, background
 * = canvas #F6F7F6 — kiểm bằng `pnpm tokens:verify`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Còn Mấy Cái Tết',
    description: SITE_DESCRIPTION,
    lang: 'vi',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Canvas #F6F7F6 (nền chờ khi mở app đã cài) + seed #198038 cho theme.
    background_color: '#F6F7F6',
    theme_color: '#198038',
    categories: ['lifestyle', 'utilities'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
