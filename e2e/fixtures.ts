import { test as base } from '@playwright/test';

/**
 * Fallback điều hướng cho sandbox của wave (Chrome hệ thống 152 chặn
 * MỌI điều hướng trực tiếp tới 127.0.0.1/localhost bằng
 * ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS — đã thử các cờ
 * --disable-features=LocalNetworkAccessChecks…, không hiệu quả; xem
 * log W3). Khi biến môi trường PLAYWRIGHT_LOCAL_ORIGIN_FALLBACK=1:
 * trình duyệt điều hướng tới origin public của app, và fixture này
 * chặn mọi request tới origin đó để fulfill bằng đúng bytes của bản
 * build local ở 127.0.0.1:3417 (kỹ thuật Fetch-interception của W2,
 * chuyển sang page.route của Playwright). Nội dung phục vụ vẫn là
 * build local 100% — chỉ có tên origin trong thanh địa chỉ là khác.
 * Trên CI (không đặt biến này) fixture là no-op và test đi thẳng tới
 * webServer local như bình thường.
 */
export const LOCAL_ORIGIN = 'https://conmaytet.vercel.app';
const LOCAL_SERVER = 'http://127.0.0.1:3417';
export const originFallbackEnabled = !!process.env.PLAYWRIGHT_LOCAL_ORIGIN_FALLBACK;

export const test = base.extend({
  // Tham số thứ hai của fixture Playwright (hàm `use` theo tài liệu)
  // được đặt tên khác để ESLint react-hooks không nhầm thành React Hook.
  page: async ({ page }, runFixture) => {
    if (originFallbackEnabled) {
      await page.route(`${LOCAL_ORIGIN}/**`, async (route) => {
        const requestUrl = new URL(route.request().url());
        const localUrl = `${LOCAL_SERVER}${requestUrl.pathname}${requestUrl.search}`;
        try {
          const res = await fetch(localUrl, { method: route.request().method() });
          const body = Buffer.from(await res.arrayBuffer());
          const headers: Record<string, string> = {};
          res.headers.forEach((value, key) => {
            const k = key.toLowerCase();
            if (k === 'content-length' || k === 'content-encoding' || k === 'transfer-encoding') {
              return;
            }
            headers[key] = value;
          });
          await route.fulfill({ status: res.status, headers, body });
        } catch {
          await route.abort();
        }
      });
    }
    await runFixture(page);
  },
});

export { expect } from '@playwright/test';
