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
const MAJORS = [
  // ── Chương trình đại trà ──
  { name: "Khoa học máy tính",                  minScore: 85.41, program: "datra" },
  { name: "Khoa học dữ liệu",                   minScore: 83.85, program: "datra" },
  { name: "Kỹ thuật máy tính",                  minScore: 82.50, program: "datra" },
  { name: "Điện – Điện tử",                     minScore: 79.80, program: "datra" },
  { name: "Kỹ thuật điều khiển & tự động hóa",  minScore: 78.20, program: "datra" },
  { name: "Viễn thông",                         minScore: 77.60, program: "datra" },
  { name: "Cơ điện tử",                         minScore: 76.50, program: "datra" },
  { name: "Kỹ thuật hóa học",                   minScore: 74.30, program: "datra" },
  { name: "Kỹ thuật hóa dầu",                   minScore: 72.80, program: "datra" },
  { name: "Kỹ thuật vật liệu",                  minScore: 71.20, program: "datra" },
  { name: "Kỹ thuật xây dựng",                  minScore: 69.50, program: "datra" },
  { name: "Kỹ thuật môi trường",                minScore: 68.00, program: "datra" },
  { name: "Kỹ thuật giao thông",                minScore: 67.40, program: "datra" },
  { name: "Cơ kỹ thuật",                        minScore: 66.90, program: "datra" },
  { name: "Kỹ thuật hệ thống công nghiệp",      minScore: 65.70, program: "datra" },
  { name: "Kỹ thuật địa chất & dầu khí",        minScore: 64.20, program: "datra" },
  { name: "Quản lý công nghiệp",                minScore: 63.50, program: "datra" },
  { name: "Kỹ thuật tàu thủy",                  minScore: 62.30, program: "datra" },
  // ── Chương trình OISP ──
  { name: "Computer Science (OISP)",             minScore: 88.00, program: "oisp" },
  { name: "Data Science (OISP)",                 minScore: 86.50, program: "oisp" },
  { name: "Electrical Engineering (OISP)",       minScore: 82.00, program: "oisp" },
  { name: "Chemical Engineering (OISP)",         minScore: 78.50, program: "oisp" },
  { name: "Civil Engineering (OISP)",            minScore: 75.00, program: "oisp" },
];

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
  container.innerHTML = majors.map(m => `
    <div class="major-row">
      <span class="major-dot"></span>
      <span class="major-name">${m.name}</span>
      <span class="major-score">${m.minScore.toFixed(2)}</span>
    </div>
  `).join('');
}

/* -------------------------------------------------------
   HÀM MỞ / ĐÓNG ACCORDION
   Được gọi khi click vào .program-header
------------------------------------------------------- */
function toggleProgram(targetId) {
  const body  = document.getElementById(targetId);
  const arrow = document.getElementById('arrow-' + targetId);
  if (!body || !arrow) return;

  const isOpen = body.classList.contains('open');
  body.classList.toggle('open',  !isOpen);
  arrow.classList.toggle('open', !isOpen);
}

/* -------------------------------------------------------
   GÁN SỰ KIỆN CLICK CHO TẤT CẢ .program-header
------------------------------------------------------- */
function initAccordions() {
  document.querySelectorAll('.program-header').forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-target');
      if (targetId) toggleProgram(targetId);
    });
  });
}

/* -------------------------------------------------------
   HIỂN THỊ KẾT QUẢ ĐIỂM TỪ sessionStorage
------------------------------------------------------- */
function loadResult() {
  const raw = sessionStorage.getItem('bkfc_result');
  if (!raw) {
    // Không có dữ liệu → quay về form
    window.location.href = '../page2_form/index.html';
    return;
  }

  const { diemHocLuc, diemUuTien, diemCong, total } = JSON.parse(raw);

  // Cập nhật thanh tóm tắt
  document.getElementById('val-hocluc').textContent  = diemHocLuc.toFixed(2);
  document.getElementById('val-cong').textContent    = diemCong.toFixed(2);
  document.getElementById('val-uutien').textContent  = diemUuTien.toFixed(2);
  document.getElementById('val-total').textContent   = total.toFixed(2);

  // Phân loại ngành
  const passAll = MAJORS.filter(m => total >= m.minScore);
  const failAll = MAJORS.filter(m => total <  m.minScore);

  // Cập nhật bộ đếm
  document.getElementById('count-pass').textContent = `${passAll.length}/${MAJORS.length} ngành`;
  document.getElementById('count-fail').textContent = `${failAll.length}/${MAJORS.length} ngành`;

  // Render từng nhóm
  renderMajorList('pass-datra', passAll.filter(m => m.program === 'datra'));
  renderMajorList('pass-oisp',  passAll.filter(m => m.program === 'oisp'));
  renderMajorList('fail-datra', failAll.filter(m => m.program === 'datra'));
  renderMajorList('fail-oisp',  failAll.filter(m => m.program === 'oisp'));
}

/* -------------------------------------------------------
   KHỞI TẠO KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadResult();
  initAccordions();

  // Nút quay lại form
  document.getElementById('btn-back-form').addEventListener('click', () => {
    window.location.href = '../page2_form/index.html';
  });

  // Nút về trang chủ
  document.getElementById('btn-back-home').addEventListener('click', () => {
    window.location.href = '../page1_landing/index.html';
  });
});
