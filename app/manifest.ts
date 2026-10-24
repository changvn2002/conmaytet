import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

/**
 * Web App Manifest — cho phép cài app lên màn hình chính và chạy standalone
 * như app thật. Icon PNG lấy từ bộ asset REDESIGN-V4, raster hoá từ logo
 * SVG chính thức (artwork không sửa, xem BRAND.md). Màu manifest theo
 * tokens.json (design/tokens.conmaytet-v4.json): theme = seed Carbon
 * Green 60, background = canvas trắng — kiểm bằng `pnpm tokens:verify`.
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
    // Canvas trắng #FFFFFF (nền chờ khi mở app đã cài) + seed Green 60 #198038 cho theme.
    background_color: '#FFFFFF',
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
