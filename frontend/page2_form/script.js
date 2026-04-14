/**
 * page2_form/script.js
 * Xử lý: quy đổi chứng chỉ, tính điểm học bạ, chuyển trang kết quả
 */

/* -------------------------------------------------------
   BẢNG QUY ĐỔI CHỨNG CHỈ TIẾNG ANH → ĐIỂM THI THPT
   Nguồn: Thông tư BK HCM 2026 (tham khảo)
------------------------------------------------------- */
const CERT_TABLE = {
  IELTS: [
    { min: 8.0, score: 10 },
    { min: 7.5, score: 9.8 },
    { min: 7.0, score: 9.5 },
    { min: 6.5, score: 9.0 },
    { min: 6.0, score: 8.5 },
    { min: 5.5, score: 8.0 },
    { min: 5.0, score: 7.0 },
    { min: 4.5, score: 6.0 },
    { min: 4.0, score: 5.0 },
  ],
  PTE: [
    { min: 76, score: 10 },
    { min: 68, score: 9.5 },
    { min: 59, score: 9.0 },
    { min: 51, score: 8.0 },
    { min: 42, score: 7.0 },
    { min: 36, score: 6.0 },
  ],
  TOEFL: [
    { min: 110, score: 10 },
    { min: 100, score: 9.5 },
    { min: 87,  score: 9.0 },
    { min: 72,  score: 8.0 },
    { min: 60,  score: 7.0 },
    { min: 46,  score: 6.0 },
  ],
  TOEIC: [
    { min: 905, score: 10 },
    { min: 800, score: 9.5 },
    { min: 700, score: 9.0 },
    { min: 600, score: 8.0 },
    { min: 500, score: 7.0 },
    { min: 400, score: 6.0 },
  ],
};

/* -------------------------------------------------------
   HỆ SỐ ƯU TIÊN (điểm)
------------------------------------------------------- */
const KV_BONUS  = { KV1: 2.0, 'KV2NT': 1.5, KV2: 1.0, KV3: 0.0 };
const UT_BONUS  = { UT1: 2.0, UT2: 1.0, none: 0.0 };

/* -------------------------------------------------------
   HÀM TIỆN ÍCH: Lấy giá trị số an toàn từ input
------------------------------------------------------- */
function safeNum(id) {
  const v = parseFloat(document.getElementById(id)?.value);
  return isNaN(v) ? 0 : v;
}

/* -------------------------------------------------------
   HÀM TRA BẢNG QUY ĐỔI CHỨNG CHỈ
------------------------------------------------------- */
function lookupCert() {
  // Lấy loại chứng chỉ đang chọn
  const certType = document.querySelector('input[name="cert"]:checked')?.value;
  if (!certType) {
    alert('Vui lòng chọn loại chứng chỉ trước!');
    return;
  }

  const certScore = parseFloat(document.getElementById('cert-score').value);
  if (isNaN(certScore)) {
    alert('Vui lòng nhập điểm chứng chỉ hợp lệ!');
    return;
  }

  // Tra bảng quy đổi
  const table = CERT_TABLE[certType] || [];
  let converted = null;
  for (const row of table) {
    if (certScore >= row.min) {
      converted = row.score;
      break;
    }
  }

  if (converted === null) {
    alert(`Điểm ${certType} ${certScore} không đủ điều kiện quy đổi.`);
    return;
  }

  // Tự điền vào ô Môn 3 (thường là tiếng Anh)
  document.getElementById('thpt3').value = converted;
  alert(`✅ ${certType} ${certScore} → ${converted} điểm THPT (đã điền vào ô Môn 3)`);
}

/* -------------------------------------------------------
   HÀM TÍNH TOÁN ĐIỂM XÉT TUYỂN TỔNG HỢP
   Công thức BK HCM 2026:
     Điểm học lực = TB(Toán+Lý+Hóa/Anh 10-12) × 10
     Điểm ưu tiên = KV + UT
     Tổng = Học lực + Ưu tiên + Cộng
------------------------------------------------------- */
function calculate() {
  // Thu thập 9 ô học bạ
  const hbValues = [
    safeNum('toan10'), safeNum('ly10'), safeNum('hoa10'),
    safeNum('toan11'), safeNum('ly11'), safeNum('hoa11'),
    safeNum('toan12'), safeNum('ly12'), safeNum('hoa12'),
  ];

  // Chỉ tính trung bình các ô đã nhập (> 0)
  const filled  = hbValues.filter(v => v > 0);
  const avgHB   = filled.length > 0
    ? filled.reduce((a, b) => a + b, 0) / filled.length
    : 0;

  // Quy về thang 100 (thang học bạ 10 → ×10)
  const diemHocLuc = parseFloat((avgHB * 10).toFixed(2));

  // Điểm ưu tiên
  const kuvuc       = document.querySelector('input[name="kuvuc"]:checked')?.value  || 'KV3';
  const uutien      = document.querySelector('input[name="uutien"]:checked')?.value || 'none';
  const diemUuTien  = (KV_BONUS[kuvuc] || 0) + (UT_BONUS[uutien] || 0);

  // Điểm cộng
  const diemCong = safeNum('input-diem-cong');

  // Tổng điểm
  const total = parseFloat((diemHocLuc + diemUuTien + diemCong).toFixed(2));

  // Lưu kết quả vào sessionStorage để trang result đọc
  sessionStorage.setItem('bkfc_result', JSON.stringify({
    diemHocLuc,
    diemUuTien,
    diemCong,
    total,
  }));

  // Chuyển sang trang kết quả
  window.location.href = '../page3_result/index.html';
}

/* -------------------------------------------------------
   GÁN SỰ KIỆN SAU KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-back-home').addEventListener('click', () => {
    window.location.href = '../page1_landing/index.html';
  });
  document.getElementById('btn-lookup').addEventListener('click', lookupCert);
  document.getElementById('btn-calculate').addEventListener('click', calculate);
});
