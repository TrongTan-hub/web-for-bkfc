/**
 * page3_result/script.js
 * Đọc kết quả từ sessionStorage, render danh sách ngành, xử lý accordion
 */

/* -------------------------------------------------------
   DỮ LIỆU NGÀNH MẪU (điểm chuẩn tham khảo 2025)
   Cấu trúc: { name, minScore, program }
   program: "datra" | "oisp"
------------------------------------------------------- */
const MAJORS = [
  /* ── Chương trình đại trà ── */
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
  /* ── Chương trình OISP ── */
  { name: "Computer Science (OISP)",             minScore: 88.00, program: "oisp" },
  { name: "Data Science (OISP)",                 minScore: 86.50, program: "oisp" },
  { name: "Electrical Engineering (OISP)",       minScore: 82.00, program: "oisp" },
  { name: "Chemical Engineering (OISP)",         minScore: 78.50, program: "oisp" },
  { name: "Civil Engineering (OISP)",            minScore: 75.00, program: "oisp" },
];

/* -------------------------------------------------------
   HÀM RENDER DANH SÁCH NGÀNH
------------------------------------------------------- */
function renderList(containerId, majors) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (majors.length === 0) {
    container.innerHTML = '<div style="padding:12px 18px;font-size:13px;color:#889;">Không có ngành nào.</div>';
    return;
  }

  majors.forEach(m => {
    container.innerHTML += `
      <div class="major-row">
        <span class="major-dot"></span>
        <span class="major-name">${m.name}</span>
        <span class="major-score">${m.minScore.toFixed(2)}</span>
      </div>`;
  });
}

/* -------------------------------------------------------
   HÀM MỞ / ĐÓNG ACCORDION
   Gọi từ onclick trong HTML
------------------------------------------------------- */
function toggleProgram(bodyId) {
  const body  = document.getElementById(bodyId);
  const arrow = document.getElementById('arrow-' + bodyId);
  const isOpen = body.classList.contains('open');

  body.classList.toggle('open',  !isOpen);
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

/* -------------------------------------------------------
   ĐỌC KẾT QUẢ TỪ sessionStorage VÀ HIỂN THỊ
------------------------------------------------------- */
function loadResult() {
  const raw = sessionStorage.getItem('bkfc_result');

  /* Nếu không có dữ liệu → quay về form */
  if (!raw) {
    window.location.href = '../page2_form/index.html';
    return;
  }

  const { diemHocLuc, diemUT, diemCong, total } = JSON.parse(raw);

  /* Cập nhật thanh tóm tắt điểm */
  document.getElementById('result-hocluc').textContent    = diemHocLuc.toFixed(2);
  document.getElementById('result-diemcong-r').textContent = diemCong.toFixed(2);
  document.getElementById('result-uutien-r').textContent  = diemUT.toFixed(2);
  document.getElementById('result-total').textContent     = total.toFixed(2);

  /* Phân loại ngành đủ / không đủ điểm */
  const passAll = MAJORS.filter(m => total >= m.minScore);
  const failAll = MAJORS.filter(m => total <  m.minScore);

  /* Cập nhật bộ đếm */
  document.getElementById('count-pass').textContent = `${passAll.length}/${MAJORS.length} ngành`;
  document.getElementById('count-fail').textContent = `${failAll.length}/${MAJORS.length} ngành`;

  /* Render từng nhóm */
  renderList('pass-datra', passAll.filter(m => m.program === 'datra'));
  renderList('pass-oisp',  passAll.filter(m => m.program === 'oisp'));
  renderList('fail-datra', failAll.filter(m => m.program === 'datra'));
  renderList('fail-oisp',  failAll.filter(m => m.program === 'oisp'));
}

/* -------------------------------------------------------
   KHỞI TẠO KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadResult();

  /* Nút quay lại form */
  document.getElementById('btn-back-result').addEventListener('click', () => {
    window.location.href = '../page2_form/index.html';
  });
});
