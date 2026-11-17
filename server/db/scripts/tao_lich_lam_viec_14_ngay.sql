-- Tạo ca sáng 08:00-11:30 (slot 30 phút) cho TẤT CẢ bác sĩ, từ hôm nay đến 14 ngày sau.
-- Chạy trước buổi demo để luôn có giờ trống trong tương lai. Chạy nhiều lần vẫn an toàn.

INSERT INTO lich_lam_viec (ma_bs, ngay_lam, gio_bat_dau, gio_ket_thuc, thoi_luong_slot, so_slot_toi_da)
SELECT bs.ma_bs,
       d::date,
       TIME '08:00',
            TIME '11:30',
                 30,
                 7
FROM bac_si bs
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + 14, INTERVAL '1 day') AS d ON CONFLICT (ma_bs,
                                                                                                ngay_lam,
                                                                                                gio_bat_dau) DO NOTHING;


SELECT COUNT(*) AS so_ca_tu_hom_nay
FROM lich_lam_viec
WHERE ngay_lam >= CURRENT_DATE;
