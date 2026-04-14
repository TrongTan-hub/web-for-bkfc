/**
 * page2_form/script.js
 * Sửa lỗi: Chặn nhập chữ, Toán x2, Fix trần điểm chứng chỉ.
 * Giữ nguyên cấu trúc source gốc.
 */

/* -------------------------------------------------------
   BẢNG QUY ĐỔI CHỨNG CHỈ TIẾNG ANH (Fix trần điểm)
------------------------------------------------------- */
const CERT_TABLE = {
  IELTS: [
    { max: 9.0, min: 8.0, score: 10 },
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
    { max: 90, min: 76, score: 10 },
    { min: 68, score: 9.5 },
    { min: 59, score: 9.0 },
    { min: 51, score: 8.0 },
    { min: 42, score: 7.0 },
    { min: 36, score: 6.0 },
  ],
  TOEFL: [
    { max: 120, min: 110, score: 10 },
    { min: 100, score: 9.5 },
    { min: 87, score: 9.0 },
    { min: 72, score: 8.0 },
    { min: 60, score: 7.0 },
    { min: 46, score: 6.0 },
  ],
  TOEIC: [
    { max: 990, min: 905, score: 10 },
    { min: 800, score: 9.5 },
    { min: 700, score: 9.0 },
    { min: 600, score: 8.0 },
    { min: 500, score: 7.0 },
    { min: 400, score: 6.0 },
  ],
};

const KV_BONUS_30 = { KV1: 0.75, KV2NT: 0.5, KV2: 0.25, KV3: 0.0 };
const UT_BONUS_30 = { UT1: 2.0, UT2: 1.0, none: 0.0 };

/* -------------------------------------------------------
   HÀM TIỆN ÍCH
------------------------------------------------------- */
function safeNum(id) {
  const v = parseFloat(document.getElementById(id)?.value);
  return isNaN(v) ? 0 : v;
}

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
  if (!certType) return alert("Vui lòng chọn loại chứng chỉ trước!");

  const certInput = document.getElementById("cert-score");
  const certScore = parseFloat(certInput.value);
  if (isNaN(certScore)) return alert("Vui lòng nhập điểm chứng chỉ hợp lệ!");

  // Kiểm tra trần điểm tối đa
  const maxVal = CERT_TABLE[certType][0].max;
  if (certScore > maxVal) {
    alert(
      `Điểm tối đa của ${certType} là ${maxVal}. Hệ thống sẽ tự đưa về mức tối đa.`,
    );
    certInput.value = maxVal;
    return lookupCert(); // Chạy lại với giá trị đã fix
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

  document.getElementById("thpt3").value = converted;
  alert(
    `✅ ${certType} ${certScore} → ${converted} điểm THPT (đã điền vào ô Môn 3)`,
  );
}

/* -------------------------------------------------------
   HÀM TÍNH TOÁN (Toán x2)
------------------------------------------------------- */
function calculate() {
  // 1. Học bạ (Toán x2)
  const hbToan = avgValid(["toan10", "toan11", "toan12"]);
  const hbMon2 = avgValid(["ly10", "ly11", "ly12"]);
  const hbMon3 = avgValid(["hoa10", "hoa11", "hoa12"]);
  const diemHocTHPT_QuyDoi = ((hbToan * 2 + hbMon2 + hbMon3) / 4) * 10;

  // 2. THPT (Toán x2)
  const thptToan = safeNum("thpt1");
  const thptMon2 = safeNum("thpt2");
  const thptMon3 = safeNum("thpt3");
  const diemTNTHPT_QuyDoi = ((thptToan * 2 + thptMon2 + thptMon3) / 4) * 10;

  // 3. Năng lực
  const isNoDGNL =
    document.querySelector('input[name="codinh"]:checked')?.value === "khong";
  let diemNangLuc = 0;

  if (isNoDGNL) {
    diemNangLuc = diemTNTHPT_QuyDoi * 0.75;
  } else {
    const dgnlNgonNgu = safeNum("dgnl-ngonngu");
    const dgnlToan = safeNum("dgnl-toanh");
    const dgnlTuDuy = safeNum("dgnl-tuduy");
    const tongDGNL = dgnlNgonNgu + dgnlToan + dgnlTuDuy;
    // Công thức: (Tổng + Toán) / 15
    diemNangLuc = (tongDGNL + dgnlToan) / 15;
  }

  // 4. Học lực
  let diemHocLuc =
    diemNangLuc * 0.7 + diemTNTHPT_QuyDoi * 0.2 + diemHocTHPT_QuyDoi * 0.1;
  diemHocLuc = parseFloat(diemHocLuc.toFixed(2));

  // 5. Điểm cộng
  const diemCongGoc = safeNum("input-diem-cong");
  const diemCongThanhTich = Math.min(diemCongGoc, 10);
  let diemCongThucTe =
    diemHocLuc + diemCongThanhTich < 100 ? diemCongThanhTich : 100 - diemHocLuc;

  // 6. Điểm ưu tiên
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

  // 7. Tổng điểm
  let total = parseFloat((tongHocLucVaCong + diemUT_Final).toFixed(2));
  if (total > 100) total = 100;

  // 8. Hiển thị
  const resultDiv = document.getElementById("result-display");
  const scoreDisplay = document.getElementById("final-score");
  const resultBox = document.querySelector(".result-box");

  if (scoreDisplay) scoreDisplay.innerText = total.toFixed(2);
  if (resultDiv) resultDiv.style.display = "block";
  if (resultBox) resultBox.style.display = "block";

  resultBox?.scrollIntoView({ behavior: "smooth", block: "nearest" });

  sessionStorage.setItem(
    "bkfc_result",
    JSON.stringify({
      diemHocLuc,
      diemUuTien: diemUT_Final,
      diemCong: diemCongThucTe,
      total,
      isNoDGNL,
    }),
  );
}

/* -------------------------------------------------------
   GÁN SỰ KIỆN & CHẶN CHỮ
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // CHẶN NHẬP CHỮ (Chỉ cho phép số và dấu chấm)
  const allInputs = document.querySelectorAll('input[type="number"]');
  allInputs.forEach((input) => {
    input.addEventListener("keypress", (e) => {
      const charCode = e.which ? e.which : e.keyCode;
      if (
        charCode !== 46 &&
        charCode > 31 &&
        (charCode < 48 || charCode > 57)
      ) {
        e.preventDefault();
      }
    });
  });

  document.getElementById("btn-back-home")?.addEventListener("click", () => {
    window.location.href = "../page1_landing/index.html";
  });

  document.getElementById("btn-lookup")?.addEventListener("click", lookupCert);
  document
    .getElementById("btn-calculate")
    ?.addEventListener("click", calculate);
  document.getElementById("btn-go-to-result")?.addEventListener("click", () => {
    window.location.href = "../page3_result/index.html";
  });

  // Mờ form ĐGNL (giữ nguyên logic)
  const radioDGNL = document.querySelectorAll('input[name="codinh"]');
  radioDGNL.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const isNoDGNL = e.target.value === "khong";
      const ids = ["dgnl-ngonngu", "dgnl-toanh", "dgnl-tuduy"];
      ids.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
          input.disabled = isNoDGNL;
          input.style.opacity = isNoDGNL ? "0.5" : "1";
          if (isNoDGNL) input.value = "";
        }
      });
    });
  });
});
