import { expect, test } from './fixtures';
import { fillPanelForm, HOPE_FATHER, HOPE_MOTHER } from './helpers';

test.describe('CQ-08 (1) — hành trình đầy đủ ra đúng con số', () => {
  test('điền form panel → sân khấu bố 16 Tết/32 lần, mẹ 24 Tết/47 lần, lưới tuần + xem trước chia sẻ', async ({
    page,
  }) => {
    await fillPanelForm(page);

    const father = page.locator('section[aria-label="Kết quả với bố"]');
    await father.scrollIntoViewIfNeeded();
    await expect(father).toContainText('Với BỐ');
    await expect(father).toContainText('16');
    await expect(father).toContainText('cái Tết nữa');
    await expect(father).toContainText('khoảng 32 lần gặp nữa');
    await expect(father).toContainText(HOPE_FATHER);

    const mother = page.locator('section[aria-label="Kết quả với mẹ"]');
    await mother.scrollIntoViewIfNeeded();
    await expect(mother).toContainText('Với MẸ');
    await expect(mother).toContainText('24');
    await expect(mother).toContainText('cái Tết nữa');
    await expect(mother).toContainText('khoảng 47 lần gặp nữa');
    await expect(mother).toContainText(HOPE_MOTHER);

    // Hai câu riêng từng người không được lẫn nhau.
    await expect(father).not.toContainText(HOPE_MOTHER);
    await expect(mother).not.toContainText(HOPE_FATHER);

    // Cảnh 3: lưới tuần hiện với nhãn trợ năng tóm tắt số tuần.
    await expect(page.getByRole('heading', { name: 'Cuộc đời bạn, kể bằng tuần' })).toBeAttached();
    const grid = page.getByRole('img', { name: /Lưới tuần cuộc đời/ });
    await grid.scrollIntoViewIfNeeded();
    await expect(grid).toBeVisible();
    await expect(page.getByText('Bạn đang ở tuần này', { exact: true })).toBeAttached();

    // Cảnh 4: xem trước thẻ chia sẻ — ảnh thẻ canvas thật hiện trong trang;
    // hai câu riêng đã được khẳng định ở sân khấu (cùng nguồn chuỗi với
    // đoạn text/thẻ chia sẻ trong lib/share-card.ts — kiểm sâu ở share.spec).
    const share = page.locator('section[aria-label="Gửi đi"]');
    await share.scrollIntoViewIfNeeded();
    await expect(
      share.getByRole('img', { name: 'Thẻ kết quả Còn Mấy Cái Tết Nữa?' }),
    ).toBeVisible();
    await expect(share.getByRole('button', { name: /Copy kết quả/ })).toBeVisible();
    await expect(share.getByRole('button', { name: /Tải ảnh thẻ kết quả/ })).toBeVisible();
  });
});
