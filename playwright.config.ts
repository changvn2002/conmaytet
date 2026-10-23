import { defineConfig } from '@playwright/test';

/**
 * CQ-08 — Playwright smoke cho ConMayTet.
 *
 * - Chạy trên bản build production local: webServer tự `pnpm build` rồi
 *   khởi động `next start` ở cổng riêng 3417 (không đụng cổng dev 3100).
 * - Browser: mặc định Playwright tự quản lý Chromium (đúng cách CI chạy:
 *   `playwright install chromium` rồi `pnpm test:e2e`).
 *   Trong sandbox của wave này, CDN tải Chromium của Playwright bị
 *   timeout, nên lần chạy local đặt biến môi trường
 *   `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/meta-chromium/chrome`
 *   để dùng Chrome hệ thống. Không đặt biến này thì config không ép
 *   executablePath nào cả.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;

/**
 * Sandbox fallback: Chrome hệ thống 152 chặn điều hướng trực tiếp tới
 * 127.0.0.1 (ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS, mọi cờ
 * --disable-features đều vô hiệu — xem log W3). Khi đặt
 * PLAYWRIGHT_LOCAL_ORIGIN_FALLBACK=1, baseURL chuyển sang origin public
 * của app và fixture trong e2e/fixtures.ts fulfill mọi request bằng
 * bytes của chính server local này (nội dung vẫn là build local).
 * CI không đặt biến này: đi thẳng 127.0.0.1 như bình thường.
 */
const originFallback = !!process.env.PLAYWRIGHT_LOCAL_ORIGIN_FALLBACK;

const PORT = 3417;
const LOCAL_URL = `http://127.0.0.1:${PORT}`;
const BASE_URL = originFallback ? 'https://conmaytet.vercel.app' : LOCAL_URL;

export default defineConfig({
  testDir: './e2e',
  // VM chậm (2 vCPU): timeout hào phóng; các spec xoá/hoàn tác phải chờ
  // cửa sổ 8 giây thật nên test timeout phải vượt tổng thời gian chờ đó.
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // Ở chế độ fallback, service worker của origin public (bản live thật)
    // không được can thiệp vào phiên đo build local.
    serviceWorkers: originFallback ? 'block' : 'allow',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-390',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm exec next start --port ${PORT}`,
    url: LOCAL_URL,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
  },
});
