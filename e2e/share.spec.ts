import { readFile } from 'node:fs/promises';
import { expect, test } from './fixtures';
import { fillPanelForm, HOPE_FATHER, HOPE_MOTHER } from './helpers';

test.describe('CQ-08 (3) — copy text + tải thẻ PNG 1080×1350', () => {
  test('clipboard chứa hai câu hy vọng riêng + câu miễn trừ; PNG tải về đúng magic + IHDR 1080×1350', async ({
    page,
    baseURL,
  }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await fillPanelForm(page);

    const share = page.locator('section[aria-label="Gửi đi"]');
    await share.scrollIntoViewIfNeeded();

    // ── Copy text ──────────────────────────────────────────────────────
    await share.getByRole('button', { name: /Copy kết quả/ }).click();
    await expect(share.getByRole('button', { name: /Đã sao chép!/ })).toBeVisible();
    const clip = await page.evaluate(async () => navigator.clipboard.readText());
    expect(clip).toContain(HOPE_FATHER);
    expect(clip).toContain(HOPE_MOTHER);
    expect(clip).toContain('Không phải dự đoán');
    expect(clip.toLowerCase()).toContain('không phải dự đoán');
    expect(clip).toContain('16 cái Tết');
    expect(clip).toContain('24 cái Tết');

    // ── Tải thẻ PNG ────────────────────────────────────────────────────
    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await share.getByRole('button', { name: /Tải ảnh thẻ kết quả/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('con-may-cai-tet-nua.png');
    const path = await download.path();
    expect(path).toBeTruthy();
    const bytes = await readFile(path as string);
    // Magic bytes PNG: 89 50 4E 47 0D 0A 1A 0A
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    // IHDR: width tại byte 16..19, height tại 20..23 (big-endian).
    expect(bytes.readUInt32BE(16)).toBe(1080);
    expect(bytes.readUInt32BE(20)).toBe(1350);
  });
});
