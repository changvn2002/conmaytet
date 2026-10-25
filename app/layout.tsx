import type { Metadata, Viewport } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import RegisterSW from '@/components/conmaytet/register-sw';
import './globals.css';

import '@fontsource/baloo-2/800.css';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';

export const viewport: Viewport = {
  // Seed Carbon Green 60 (tokens.json) — thanh trạng thái/trình duyệt trên mobile.
  themeColor: '#198038',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: '4vR-FfACE45r_MqkVxeYtSg9ZY_VjsLS137PyDewq5E',
  },
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'còn mấy cái tết',
    'còn mấy cái tết nữa',
    'còn bao nhiêu cái tết với bố mẹ',
    'còn bao nhiêu cái tết',
    'số tết còn lại với bố mẹ',
    'còn bao nhiêu lần gặp bố mẹ',
    'tuổi thọ trung bình việt nam',
    'tuổi thọ trung bình của người việt nam',
    'lưới tuần cuộc đời',
    'cuộc đời trong một trang',
    'tết sum vầy',
    'thời gian bên bố mẹ',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/products/brand/conmaytet-mark.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

/**
 * Dữ liệu có cấu trúc (JSON-LD) — chỉ khai đúng sự thật về app:
 * miễn phí, không cần tài khoản, chạy trên trình duyệt.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  alternateName: 'conmaytet',
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  inLanguage: 'vi',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
