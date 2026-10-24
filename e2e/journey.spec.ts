import { expect, test } from './fixtures';
import { fillPanelForm, HOPE_FATHER, HOPE_MOTHER } from './helpers';

test.describe('CQ-08 (1) — hành trình đầy đủ ra đúng con số', () => {
  test('điền form panel → sân khấu bố 16 Tết/32 lần, mẹ 24 Tết/47 lần, lưới tuần + xem trước chia sẻ', async ({
    page,
  }) => {
    await fillPanelForm(page);

    const father = page.locator('section[aria-label="Kết quả với bố"]');
    await father.scrollIntoViewIfNeeded();
    // Hệ lens-04: đầu thẻ là tên (H3) + năm sinh + chip tuổi — thay
    // nhãn «Với BỐ» của hệ V4, sức khẳng định giữ nguyên (đúng người,
    // đúng năm sinh, đúng tuổi).
    await expect(father.locator('h3')).toHaveText('Bố');
    await expect(father).toContainText('Sinh năm 1965');
    await expect(father).toContainText('61 tuổi');
    await expect(father).toContainText('16');
    await expect(father).toContainText('cái Tết nữa');
    await expect(father).toContainText('khoảng 32 lần gặp nữa');
    await expect(father).toContainText(HOPE_FATHER);

    const mother = page.locator('section[aria-label="Kết quả với mẹ"]');
    await mother.scrollIntoViewIfNeeded();
    await expect(mother.locator('h3')).toHaveText('Mẹ');
    await expect(mother).toContainText('Sinh năm 1968');
    await expect(mother).toContainText('58 tuổi');
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
    // Pill của hệ lens-04 mang cả số tuần: «Bạn đang ở tuần này · tuần N».
    await expect(page.getByText(/Bạn đang ở tuần này · tuần/)).toBeAttached();

    // Cảnh 4: thẻ chia sẻ — desktop hiện xem trước thẻ canvas thật;
    // mobile (F5 vòng 2) hiện khối tóm tắt native (avatar + số + câu
    // cho 2 người) và thẻ thật chỉ mở toàn màn hình qua «Xem thẻ đầy
    // đủ». Sức khẳng định giữ nguyên: người dùng kiểm chứng được số
    // và câu của cả bố lẫn mẹ trước khi gửi, ở cả hai viewport.
    const share = page.locator('section[aria-label="Gửi đi"]');
    await share.scrollIntoViewIfNeeded();
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) {
      // G4c vòng 3: desktop nay có BẢN SAO của chính khối tóm tắt
      // này ở cột phải (chỉ hiện ở ≥lg, display:none ở mobile) nên
      // mỗi nhãn tồn tại 2 lần trong DOM. `.first()` neo vào khối
      // mobile (đứng TRƯỚC trong DOM) — khẳng định giữ nguyên sức:
      // đúng các nhãn/câu đó phải HIỆN hữu hình ở mobile.
      await expect(share.getByText(/Với bố ·/).first()).toBeVisible();
      await expect(share.getByText(/Với mẹ ·/).first()).toBeVisible();
      await expect(share.getByText(HOPE_FATHER).first()).toBeVisible();
      await expect(share.getByText(HOPE_MOTHER).first()).toBeVisible();
      await share.getByRole('button', { name: 'Xem thẻ đầy đủ' }).click();
      await expect(
        share.getByRole('img', { name: 'Thẻ kết quả Còn Mấy Cái Tết Nữa?' }),
      ).toBeVisible();
      await share.getByRole('button', { name: 'Đóng' }).click();
    } else {
      await expect(
        share.getByRole('img', { name: 'Thẻ kết quả Còn Mấy Cái Tết Nữa?' }),
      ).toBeVisible();
    }
    await expect(share.getByRole('button', { name: /Copy kết quả/ })).toBeVisible();
    await expect(share.getByRole('button', { name: /Tải ảnh thẻ kết quả/ })).toBeVisible();
  });
});
