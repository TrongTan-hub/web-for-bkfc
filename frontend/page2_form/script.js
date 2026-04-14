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
    { min: 87, score: 9.0 },
    { min: 72, score: 8.0 },
    { min: 60, score: 7.0 },
    { min: 46, score: 6.0 },
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
   HỆ SỐ ƯU TIÊN (Đã chuẩn hóa về thang 30 của Bộ GD&ĐT)
------------------------------------------------------- */
const KV_BONUS_30 = { KV1: 0.75, KV2NT: 0.5, KV2: 0.25, KV3: 0.0 };
const UT_BONUS_30 = { UT1: 2.0, UT2: 1.0, none: 0.0 };

/* -------------------------------------------------------
   HÀM TIỆN ÍCH
------------------------------------------------------- */
function safeNum(id) {
  const v = parseFloat(document.getElementById(id)?.value);
  return isNaN(v) ? 0 : v;
}

// Tính trung bình cộng của các ô có nhập điểm
function avgValid(ids) {
  const values = ids.map((id) => safeNum(id)).filter((v) => v > 0);
  return values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
}

/* -------------------------------------------------------
   HÀM TRA BẢNG QUY ĐỔI CHỨNG CHỈ
------------------------------------------------------- */
function lookupCert() {
  const certType = document.querySelector('input[name="cert"]:checked')?.value;
  if (!certType) {
    alert("Vui lòng chọn loại chứng chỉ trước!");
    return;
  }

  const certScore = parseFloat(document.getElementById("cert-score").value);
  if (isNaN(certScore)) {
    alert("Vui lòng nhập điểm chứng chỉ hợp lệ!");
    return;
  }

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

  // Tự điền vào ô Môn 3 theo đúng ID HTML của bạn
  document.getElementById("thpt3").value = converted;
  alert(
    `✅ ${certType} ${certScore} → ${converted} điểm THPT (đã điền vào ô Môn 3)`,
  );
}

/* -------------------------------------------------------
   HÀM TÍNH TOÁN ĐIỂM XÉT TUYỂN (CẬP NHẬT BK HCM 2026)
------------------------------------------------------- */
function calculate() {
  /**
   * 1. HỌC BẠ QUY ĐỔI (Toán x2)
   * Giả định: Môn 1 (toan10) là Toán, Môn 2 (ly10), Môn 3 (hoa10)
   */
  const hbToan = avgValid(["toan10", "toan11", "toan12"]);
  const hbMon2 = avgValid(["ly10", "ly11", "ly12"]);
  const hbMon3 = avgValid(["hoa10", "hoa11", "hoa12"]);
  const diemHocTHPT_QuyDoi = ((hbToan * 2 + hbMon2 + hbMon3) / 4) * 10;

  /**
   * 2. THPT QUY ĐỔI (Toán x2)
   * Giả định: thpt1 là Toán
   */
  const thptToan = safeNum("thpt1");
  const thptMon2 = safeNum("thpt2");
  const thptMon3 = safeNum("thpt3");
  const diemTNTHPT_QuyDoi = ((thptToan * 2 + thptMon2 + thptMon3) / 4) * 10;

  /**
   * 3. NĂNG LỰC (Phân rẽ đối tượng Có/Không thi ĐGNL)
   */
  const isNoDGNL =
    document.querySelector('input[name="codinh"]:checked')?.value === "khong";
  let diemNangLuc = 0;

  if (isNoDGNL) {
    // Không thi ĐGNL: Lấy 75% của điểm THPT quy đổi
    diemNangLuc = diemTNTHPT_QuyDoi * 0.75;
  } else {
    // Có thi: Tính từ 3 ô nhập (Ngôn ngữ + Toán học + Tư duy)
    const dgnlNgonNgu = safeNum("dgnl-ngonngu");
    const dgnlToan = safeNum("dgnl-toanh");
    const dgnlTuDuy = safeNum("dgnl-tuduy");

    const tongDGNL = dgnlNgonNgu + dgnlToan + dgnlTuDuy;
    // Công thức: (Tổng + Toán) / 15
    diemNangLuc = (tongDGNL + dgnlToan) / 15;
  }

  /**
   * 4. HỌC LỰC (ĐGNL 70% - THPT 20% - Học bạ 10%)
   */
  let diemHocLuc =
    diemNangLuc * 0.7 + diemTNTHPT_QuyDoi * 0.2 + diemHocTHPT_QuyDoi * 0.1;
  diemHocLuc = parseFloat(diemHocLuc.toFixed(2));

  /**
   * 5. ĐIỂM CỘNG (Tối đa 10, Chặn 100)
   */
  const diemCongGoc = safeNum("input-diem-cong");
  const diemCongThanhTich = Math.min(diemCongGoc, 10);
  let diemCongThucTe =
    diemHocLuc + diemCongThanhTich < 100 ? diemCongThanhTich : 100 - diemHocLuc;

  /**
   * 6. ĐIỂM ƯU TIÊN (Giảm tuyến tính >= 75)
   */
  const kuvuc =
    document.querySelector('input[name="kuvuc"]:checked')?.value || "KV3";
  const uutien =
    document.querySelector('input[name="uutien"]:checked')?.value || "none";

  const utGoc30 = (KV_BONUS_30[kuvuc] || 0) + (UT_BONUS_30[uutien] || 0);
  const utQuyDoi100 = (utGoc30 / 3) * 10;

  let diemUT_Final = 0;
  const tongHocLucVaCong = diemHocLuc + diemCongThucTe;

  if (tongHocLucVaCong < 75) {
    diemUT_Final = utQuyDoi100;
  } else {
    diemUT_Final = ((100 - tongHocLucVaCong) / 25) * utQuyDoi100;
  }
  diemUT_Final = Math.round(diemUT_Final * 100) / 100;

  /**
   * 7. TỔNG ĐIỂM CUỐI CÙNG
   */
  let total = parseFloat((tongHocLucVaCong + diemUT_Final).toFixed(2));
  if (total > 100) total = 100;

  /**
   * 8. HIỂN THỊ KẾT QUẢ VÀ NÚT TRA CỨU
   */
  const resultDiv = document.getElementById("result-display");
  const scoreDisplay = document.getElementById("final-score");

  if (resultDiv && scoreDisplay) {
    scoreDisplay.innerText = total.toFixed(2);
    resultDiv.style.display = "block"; // Hiện khối kết quả
    resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" }); // Cuộn xuống
  } else {
    // Đề phòng HTML bị thiếu div, báo alert dự phòng
    alert("Tổng điểm xét tuyển của bạn là: " + total.toFixed(2));
  }

  // Lưu SessionStorage để dùng cho trang kết quả (page3)
  sessionStorage.setItem(
    "bkfc_result",
    JSON.stringify({
      diemHocLuc: diemHocLuc,
      diemUuTien: diemUT_Final,
      diemCong: diemCongThucTe,
      total: total,
      isNoDGNL: isNoDGNL,
    }),
  );
}

/* -------------------------------------------------------
   GÁN SỰ KIỆN SAU KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-back-home")?.addEventListener("click", () => {
    window.location.href = "../page1_landing/index.html";
  });

  document.getElementById("btn-lookup")?.addEventListener("click", lookupCert);

  document
    .getElementById("btn-calculate")
    ?.addEventListener("click", calculate);

  // Sự kiện cho nút chuyển trang (Nút này nằm trong HTML phần hiển thị kết quả mới thêm)
  document.getElementById("btn-go-to-result")?.addEventListener("click", () => {
    window.location.href = "../page3_result/index.html";
  });

  // Mờ form ĐGNL nếu chọn Không thi
  const radioDGNL = document.querySelectorAll('input[name="codinh"]');
  radioDGNL.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const isNoDGNL = e.target.value === "khong";
      const inputsDGNL = [
        document.getElementById("dgnl-ngonngu"),
        document.getElementById("dgnl-toanh"),
        document.getElementById("dgnl-tuduy"),
      ];
      inputsDGNL.forEach((input) => {
        if (input) {
          input.disabled = isNoDGNL;
          input.style.opacity = isNoDGNL ? "0.5" : "1";
          if (isNoDGNL) input.value = ""; // Xóa trắng khi không thi
        }
      });
    });
  });
  // Thêm đoạn này vào cuối hàm tính toán của bạn
  const resultBox = document.querySelector(".result-box");
  resultBox.style.display = "block";

  // Tự động cuộn đến hộp kết quả một cách mượt mà
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
