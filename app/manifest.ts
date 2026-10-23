import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

/**
 * Web App Manifest — cho phép cài app lên màn hình chính và chạy standalone
 * như app thật. Icon PNG lấy từ bộ asset redesign-v2, raster hoá từ logo
 * SVG chính thức (artwork không sửa, xem BRAND.md).
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
    // Giấy ấm #FBF7EC (nền chờ khi mở app đã cài) + xanh thông #1F4D3A cho theme.
    background_color: '#FBF7EC',
    theme_color: '#1F4D3A',
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
