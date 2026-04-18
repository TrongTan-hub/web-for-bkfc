/**
 * page2_form/script.js
 * Sửa lỗi: Chặn nhập chữ, Ép trần điểm (10, 600, 300), Toán x2.
 * Giữ nguyên cấu trúc source gốc.
 */

/* -------------------------------------------------------
   BẢNG QUY ĐỔI CHỨNG CHỈ TIẾNG ANH (Giữ nguyên)
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

  const maxVal = CERT_TABLE[certType][0].max;
  if (certScore > maxVal) {
    alert(
      `Điểm tối đa của ${certType} là ${maxVal}. Hệ thống sẽ tự đưa về mức tối đa.`,
    );
    certInput.value = maxVal;
    return lookupCert();
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
   HÀM TÍNH TOÁN
------------------------------------------------------- */
function calculate() {
  const hbToan = avgValid(["toan10", "toan11", "toan12"]);
  const hbMon2 = avgValid(["ly10", "ly11", "ly12"]);
  const hbMon3 = avgValid(["hoa10", "hoa11", "hoa12"]);
  const diemHocTHPT_QuyDoi = ((hbToan * 2 + hbMon2 + hbMon3) / 4) * 10;

  const thptToan = safeNum("thpt1");
  const thptMon2 = safeNum("thpt2");
  const thptMon3 = safeNum("thpt3");
  const diemTNTHPT_QuyDoi = ((thptToan * 2 + thptMon2 + thptMon3) / 4) * 10;

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
    diemNangLuc = (tongDGNL + dgnlToan) / 15;
  }

  let diemHocLuc =
    diemNangLuc * 0.7 + diemTNTHPT_QuyDoi * 0.2 + diemHocTHPT_QuyDoi * 0.1;
  diemHocLuc = parseFloat(diemHocLuc.toFixed(2));

  const diemCongGoc = safeNum("input-diem-cong");
  const diemCongThanhTich = Math.min(diemCongGoc, 10);
  let diemCongThucTe =
    diemHocLuc + diemCongThanhTich < 100 ? diemCongThanhTich : 100 - diemHocLuc;

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

  let total = parseFloat((tongHocLucVaCong + diemUT_Final).toFixed(2));
  if (total > 100) total = 100;

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
   GÁN SỰ KIỆN & KIỂM SOÁT NHẬP LIỆU CHẶT CHẼ
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const allInputs = document.querySelectorAll('input[type="number"]');

  allInputs.forEach((input) => {
    // 1. Chặn phím không phải số/chấm
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

    // 2. Ép trần điểm khi người dùng nhập/dán
    input.addEventListener("input", (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) return;

      const id = e.target.id;
      let maxLimit = 10; // Mặc định cho học bạ, thpt, điểm cộng

      if (id === "dgnl-ngonngu") maxLimit = 600;
      else if (id === "dgnl-toanh" || id === "dgnl-tuduy") maxLimit = 300;
      else if (id === "cert-score") return; // Bỏ qua vì đã có hàm lookupCert xử lý riêng theo loại chứng chỉ

      if (val > maxLimit) {
        e.target.value = maxLimit;
      }
    });
  });

  document.getElementById("btn-back-home")?.addEventListener("click", () => {
    window.location.href = "/frontend/page1_landing/index.html";
  });

  document.getElementById("btn-lookup")?.addEventListener("click", lookupCert);
  document
    .getElementById("btn-calculate")
    ?.addEventListener("click", calculate);
  document.getElementById("btn-go-to-result")?.addEventListener("click", () => {
    window.location.href = "/frontend/page3_result/index.html";
  });

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
