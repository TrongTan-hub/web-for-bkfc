/**
 * page3_result/script.js
 * Đọc kết quả từ sessionStorage, render danh sách ngành, xử lý accordion
 */

/* -------------------------------------------------------
   DỮ LIỆU NGÀNH MẪU
   → Thay thế bằng dữ liệu thật từ API backend khi deploy
   Cấu trúc: { name, minScore, program }
   program: "datra" | "oisp"
------------------------------------------------------- */
/**
 * page3_result/script.js
 * Cập nhật dữ liệu điểm chuẩn Bách Khoa TP.HCM 2025
 */

/* -------------------------------------------------------
   DỮ LIỆU NGÀNH CẬP NHẬT 2025
------------------------------------------------------- */
const MAJORS = [
  // ── CHƯƠNG TRÌNH ĐẠI TRÀ (Mã 1xx) ──
  { name: "1106 - Khoa học Máy tính", minScore: 85.41, program: "datra" },
  { name: "1107 - Kỹ thuật Máy tính", minScore: 82.91, program: "datra" },
  {
    name: "1108 - Điện - Điện tử - Viễn Thông - Tự động hoá",
    minScore: 80.77,
    program: "datra",
  },
  { name: "1109 - Kỹ Thuật Cơ khí", minScore: 75.43, program: "datra" },
  { name: "1110 - Kỹ Thuật Cơ Điện tử", minScore: 81.82, program: "datra" },
  { name: "1112 - Dệt - May", minScore: 60.75, program: "datra" },
  {
    name: "1114 - Hoá - Thực phẩm - Sinh học",
    minScore: 75.43,
    program: "datra",
  },
  {
    name: "1115 - Xây dựng và Quản lý Dự án Xây dựng",
    minScore: 55.05,
    program: "datra",
  },
  { name: "1117 - Kiến Trúc", minScore: 67.42, program: "datra" },
  { name: "1120 - Dầu khí - Địa chất", minScore: 60.0, program: "datra" },
  { name: "1123 - Quản lý Công nghiệp", minScore: 75.98, program: "datra" },
  {
    name: "1125 - Tài nguyên và Môi trường",
    minScore: 60.93,
    program: "datra",
  },
  {
    name: "1128 - Logistics và Hệ thống Công nghiệp",
    minScore: 80.52,
    program: "datra",
  },
  { name: "1129 - Kỹ thuật Vật liệu", minScore: 71.1, program: "datra" },
  { name: "1137 - Vật lý Kỹ thuật", minScore: 76.61, program: "datra" },
  { name: "1138 - Cơ Kỹ thuật", minScore: 75.98, program: "datra" },
  { name: "1140 - Kỹ thuật Nhiệt", minScore: 73.5, program: "datra" },
  { name: "1141 - Bảo dưỡng Công nghiệp", minScore: 65.59, program: "datra" },
  { name: "1142 - Kỹ thuật Ô tô", minScore: 76.34, program: "datra" },
  {
    name: "1145 - (Song ngành) Tàu thủy - Hàng không",
    minScore: 76.63,
    program: "datra",
  },
  { name: "1146 - Khoa học Dữ liệu", minScore: 83.85, program: "datra" },
  { name: "1147 - Địa Kỹ thuật Xây dựng", minScore: 55.06, program: "datra" },
  { name: "1148 - Kinh tế Xây dựng", minScore: 55.72, program: "datra" },
  {
    name: "1153 - Quản trị Kinh doanh (Ngành mới)",
    minScore: 71.24,
    program: "datra",
  },

  // ── CHƯƠNG TRÌNH OISP (Tiên tiến, Dạy bằng TA, Liên kết...) ──
  {
    name: "2206 - Khoa học Máy tính (Dạy bằng TA)",
    minScore: 83.74,
    program: "oisp",
  },
  {
    name: "2207 - Kỹ thuật Máy tính (Dạy bằng TA)",
    minScore: 78.66,
    program: "oisp",
  },
  {
    name: "2208 - Kỹ thuật Điện - Điện tử (Tiên tiến)",
    minScore: 79.5,
    program: "oisp",
  },
  {
    name: "2209 - Kỹ thuật Cơ khí (Dạy bằng TA)",
    minScore: 74.3,
    program: "oisp",
  },
  {
    name: "2210 - Kỹ thuật Cơ Điện tử (Dạy bằng TA)",
    minScore: 78.44,
    program: "oisp",
  },
  {
    name: "2211 - Kỹ thuật Robot (Dạy bằng TA)",
    minScore: 73.89,
    program: "oisp",
  },
  {
    name: "2214 - Kỹ thuật Hóa học (Dạy bằng TA)",
    minScore: 63.3,
    program: "oisp",
  },
  {
    name: "2215 - Quản lý Dự án & Kỹ thuật Xây dựng (TA)",
    minScore: 56.2,
    program: "oisp",
  },
  {
    name: "2217 - Kiến trúc Cảnh quan (Dạy bằng TA)",
    minScore: 55.45,
    program: "oisp",
  },
  {
    name: "2218 - Công nghệ Sinh học (Dạy bằng TA)",
    minScore: 66.13,
    program: "oisp",
  },
  {
    name: "2219 - Công nghệ Thực phẩm (Dạy bằng TA)",
    minScore: 59.21,
    program: "oisp",
  },
  {
    name: "2220 - Kỹ thuật Dầu khí (Dạy bằng TA)",
    minScore: 60.25,
    program: "oisp",
  },
  {
    name: "2223 - Quản lý Công nghiệp (Dạy bằng TA)",
    minScore: 61.08,
    program: "oisp",
  },
  {
    name: "2225 - Tài nguyên và Môi trường (Dạy bằng TA)",
    minScore: 55.46,
    program: "oisp",
  },
  {
    name: "2228 - Logistics và Hệ thống Công nghiệp (TA)",
    minScore: 73.05,
    program: "oisp",
  },
  {
    name: "2229 - Kỹ thuật Vật liệu (Dạy bằng TA)",
    minScore: 55.23,
    program: "oisp",
  },
  {
    name: "2237 - Kỹ thuật Y sinh (Dạy bằng TA)",
    minScore: 64.74,
    program: "oisp",
  },
  {
    name: "2242 - Kỹ thuật Ô tô (Dạy bằng TA)",
    minScore: 69.49,
    program: "oisp",
  },
  {
    name: "2245 - Kỹ thuật Hàng không (Dạy bằng TA)",
    minScore: 78.79,
    program: "oisp",
  },
  {
    name: "2253 - Kinh doanh số (Dạy bằng TA)",
    minScore: 59.06,
    program: "oisp",
  },
  {
    name: "2254 - Công nghệ Sinh học số (Dạy bằng TA)",
    minScore: 56.42,
    program: "oisp",
  },
  {
    name: "2255 - Kinh tế Tuần hoàn (Dạy bằng TA)",
    minScore: 64.38,
    program: "oisp",
  },
  {
    name: "2257 - Năng lượng Tái tạo (Dạy bằng TA)",
    minScore: 58.07,
    program: "oisp",
  },
  {
    name: "2258 - Thiết kế Vi mạch (Dạy bằng TA)",
    minScore: 83.09,
    program: "oisp",
  },
  {
    name: "2266 - Khoa học Máy tính (Định hướng Nhật Bản)",
    minScore: 77.05,
    program: "oisp",
  },
  { name: "2268 - Cơ Kỹ thuật", minScore: 69.45, program: "oisp" },
  {
    name: "3306 - KH Máy tính (Liên kết Úc/NZ/Mỹ)",
    minScore: 72.9,
    program: "oisp",
  },
  {
    name: "3307 - Kỹ thuật Máy tính (Liên kết Úc/NZ)",
    minScore: 67.68,
    program: "oisp",
  },
  {
    name: "3308 - Kỹ thuật Điện - Điện tử (Liên kết Úc/Hàn)",
    minScore: 65.52,
    program: "oisp",
  },
  {
    name: "3309 - Kỹ thuật Cơ khí (Liên kết Mỹ/Úc)",
    minScore: 74.3,
    program: "oisp",
  },
  {
    name: "3310 - Kỹ thuật Cơ Điện tử (Liên kết Mỹ/Úc)",
    minScore: 78.44,
    program: "oisp",
  },
  {
    name: "3314 - Kỹ thuật Hóa học (Liên kết Úc)",
    minScore: 63.3,
    program: "oisp",
  },
  {
    name: "3315 - Kỹ thuật Xây dựng (Liên kết Úc)",
    minScore: 56.2,
    program: "oisp",
  },
  {
    name: "3319 - Công nghệ Thực phẩm (Liên kết NZ)",
    minScore: 56.2,
    program: "oisp",
  },
  {
    name: "3323 - Quản lý Công nghiệp (Liên kết Úc)",
    minScore: 61.08,
    program: "oisp",
  },
  {
    name: "3325 - MT & Quản lý Tài nguyên (Liên kết Úc)",
    minScore: 55.46,
    program: "oisp",
  },
  {
    name: "3342 - Kỹ thuật Ô tô (Liên kết Úc)",
    minScore: 69.49,
    program: "oisp",
  },
  {
    name: "3345 - Kỹ thuật Hàng không (Liên kết Úc)",
    minScore: 78.79,
    program: "oisp",
  },
  {
    name: "4406 - Trí tuệ Nhân tạo (UTS Úc cấp bằng)",
    minScore: 65.5,
    program: "oisp",
  },
  {
    name: "4416 - Công nghệ Thông tin (UTS Úc cấp bằng)",
    minScore: 57.38,
    program: "oisp",
  },
];

/* --- Các hàm xử lý renderMajorList, loadResult, v.v. bên dưới giữ nguyên --- */
/* -------------------------------------------------------
   HÀM RENDER DANH SÁCH NGÀNH VÀO CONTAINER
------------------------------------------------------- */
function renderMajorList(containerId, majors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (majors.length === 0) {
    container.innerHTML = '<div class="no-major">Không có ngành nào.</div>';
    return;
  }

  // Tạo HTML từng hàng ngành
  container.innerHTML = majors
    .map(
      (m) => `
    <div class="major-row">
      <span class="major-dot"></span>
      <span class="major-name">${m.name}</span>
      <span class="major-score">${m.minScore.toFixed(2)}</span>
    </div>
  `,
    )
    .join("");
}

/* -------------------------------------------------------
   HÀM MỞ / ĐÓNG ACCORDION
   Được gọi khi click vào .program-header
------------------------------------------------------- */
function toggleProgram(targetId) {
  const body = document.getElementById(targetId);
  const arrow = document.getElementById("arrow-" + targetId);
  if (!body || !arrow) return;

  const isOpen = body.classList.contains("open");
  body.classList.toggle("open", !isOpen);
  arrow.classList.toggle("open", !isOpen);
}

/* -------------------------------------------------------
   GÁN SỰ KIỆN CLICK CHO TẤT CẢ .program-header
------------------------------------------------------- */
function initAccordions() {
  document.querySelectorAll(".program-header").forEach((header) => {
    header.addEventListener("click", () => {
      const targetId = header.getAttribute("data-target");
      if (targetId) toggleProgram(targetId);
    });
  });
}

/* -------------------------------------------------------
   HIỂN THỊ KẾT QUẢ ĐIỂM TỪ sessionStorage
------------------------------------------------------- */
function loadResult() {
  const raw = sessionStorage.getItem("bkfc_result");
  if (!raw) {
    // Không có dữ liệu → quay về form
    window.location.href = "../page2_form/index.html";
    return;
  }

  const { diemHocLuc, diemUuTien, diemCong, total } = JSON.parse(raw);

  // Cập nhật thanh tóm tắt
  document.getElementById("val-hocluc").textContent = diemHocLuc.toFixed(2);
  document.getElementById("val-cong").textContent = diemCong.toFixed(2);
  document.getElementById("val-uutien").textContent = diemUuTien.toFixed(2);
  document.getElementById("val-total").textContent = total.toFixed(2);

  // Phân loại ngành
  const passAll = MAJORS.filter((m) => total >= m.minScore);
  const failAll = MAJORS.filter((m) => total < m.minScore);

  // Cập nhật bộ đếm
  document.getElementById("count-pass").textContent =
    `${passAll.length}/${MAJORS.length} ngành`;
  document.getElementById("count-fail").textContent =
    `${failAll.length}/${MAJORS.length} ngành`;

  // Render từng nhóm
  renderMajorList(
    "pass-datra",
    passAll.filter((m) => m.program === "datra"),
  );
  renderMajorList(
    "pass-oisp",
    passAll.filter((m) => m.program === "oisp"),
  );
  renderMajorList(
    "fail-datra",
    failAll.filter((m) => m.program === "datra"),
  );
  renderMajorList(
    "fail-oisp",
    failAll.filter((m) => m.program === "oisp"),
  );
}

/* -------------------------------------------------------
   KHỞI TẠO KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadResult();
  initAccordions();

  // Nút quay lại form
  document.getElementById("btn-back-form").addEventListener("click", () => {
    window.location.href = "../page2_form/index.html";
  });

  // Nút về trang chủ
  document.getElementById("btn-back-home").addEventListener("click", () => {
    window.location.href = "../page1_landing/index.html";
  });
});
