/**
 * page2_form/script.js
 * Xử lý: quy đổi chứng chỉ, tính điểm, chuyển trang kết quả
 */

/* -------------------------------------------------------
   HÀM LẤY GIÁ TRỊ SỐ AN TOÀN TỪ INPUT
------------------------------------------------------- */
function safeNum(id) {
  const v = parseFloat(document.getElementById(id)?.value);
  return isNaN(v) ? 0 : v;
}

/* -------------------------------------------------------
   HÀM TRA BẢNG QUY ĐỔI CHỨNG CHỈ (demo đơn giản)
------------------------------------------------------- */
function lookupCert() {
  const certType  = document.querySelector('input[name="cert"]:checked')?.value || '';
  const certScore = parseFloat(document.getElementById('cert-score').value);

  if (!certType || isNaN(certScore)) {
    alert('Vui lòng chọn loại chứng chỉ và nhập điểm!');
    return;
  }

  /* Bảng quy đổi mẫu (IELTS → điểm thi THPT môn Anh) */
  const ieltsTable = [
    [8.0, 10], [7.5, 9.8], [7.0, 9.5], [6.5, 9.0],
    [6.0, 8.5], [5.5, 8.0], [5.0, 7.0], [4.5, 6.0]
  ];

  if (certType === 'IELTS') {
    for (const [min, eq] of ieltsTable) {
      if (certScore >= min) {
        /* Điền vào ô Môn 3 (thường là tiếng Anh) */
        document.getElementById('thpt3').value = eq;
        alert(`Điểm IELTS ${certScore} → ${eq} điểm thi THPT (đã điền vào Môn 3)`);
        return;
      }
    }
  }

  alert(`Đã tra bảng quy đổi cho ${certType}. Vui lòng kiểm tra điểm môn Anh.`);
}

/* -------------------------------------------------------
   HÀM TÍNH TOÁN ĐIỂM XÉT TUYỂN
   Công thức BK HCM 2026 (tham khảo):
     Điểm học lực = TB(Toán+Lý+Hóa/Anh) × 3 năm × hệ số
     Điểm ưu tiên = khu vực + đối tượng
     Điểm tổng    = Học lực + Ưu tiên + Cộng
------------------------------------------------------- */
function calculate() {
  /* Điểm học bạ: trung bình 9 ô × hệ số 10 (quy về thang 100) */
  const hbScores = [
    safeNum('toan10'), safeNum('ly10'), safeNum('hoa10'),
    safeNum('toan11'), safeNum('ly11'), safeNum('hoa11'),
    safeNum('toan12'), safeNum('ly12'), safeNum('hoa12'),
  ];

  /* Tính trung bình các ô đã nhập (bỏ qua ô = 0) */
  const filled     = hbScores.filter(x => x > 0);
  const avgHB      = filled.length > 0 ? filled.reduce((a, b) => a + b, 0) / filled.length : 0;
  const diemHocLuc = parseFloat((avgHB * 10).toFixed(2)); /* thang 100 */

  /* Điểm ưu tiên */
  const kuvuc   = document.querySelector('input[name="kuvuc"]:checked')?.value  || 'KV3';
  const uutien  = document.querySelector('input[name="uutien"]:checked')?.value || 'none';
  const kvBonus = { KV1: 2.0, 'KV2NT': 1.5, KV2: 1.0, KV3: 0.0 };
  const utBonus = { UT1: 2.0, UT2: 1.0, none: 0.0 };
  const diemUT  = (kvBonus[kuvuc] || 0) + (utBonus[uutien] || 0);

  /* Điểm cộng */
  const diemCong = safeNum('input-diem-cong');

  /* Tổng điểm */
  const total = parseFloat((diemHocLuc + diemUT + diemCong).toFixed(2));

  /* Lưu kết quả vào sessionStorage để trang result đọc */
  sessionStorage.setItem('bkfc_result', JSON.stringify({
    diemHocLuc,
    diemUT,
    diemCong,
    total
  }));

  /* Chuyển sang trang kết quả */
  window.location.href = '../page3_result/index.html';
}

/* -------------------------------------------------------
   GÁN SỰ KIỆN KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-back-home').addEventListener('click', () => {
    window.location.href = '../page1_landing/index.html';
  });

  document.getElementById('btn-lookup').addEventListener('click', lookupCert);

  document.getElementById('btn-calculate').addEventListener('click', calculate);
});
