import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.spec.ts', 'components/**/*.spec.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      thresholds: {
        // CQ-06 (mở cổng coverage 2026-10-26, SEC-10): repo trước đây
        // không có @vitest/coverage-v8 nên `vitest run --coverage` lỗi
        // MISSING DEPENDENCY — nay bổ sung cặp khớp vitest 4.1.12.
        // Ngưỡng đặt tại số đo thật 2026-10-26 (suite đầy đủ 212 test,
        // phạm vi mặc định v8 = các file được test nạp): statements
        // 64.47% / branches 74.41% / functions 73.02% / lines 65.19% →
        // ngưỡng = ceil(số đo − 3), hiệu đo − ngưỡng nằm trong [2, 3]
        // (2.47 / 2.41 / 2.02 / 2.19) làm biên chống dao động giữa các
        // máy — cùng công thức đã áp cho sodam. Nâng ngưỡng khi thêm
        // test; hạ ngưỡng phải ghi lý do tại đây.
        statements: 62,
        branches: 72,
        functions: 71,
        lines: 63,
      },
    },
  },
});
