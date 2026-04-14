/**
 * page1_landing/script.js
 * Xử lý điều hướng các nút trên Landing Page
 */

/* -------------------------------------------------------
   Cấu hình đường dẫn tới các trang khác
   → Chỉnh sửa tại đây nếu deploy trên server khác
------------------------------------------------------- */
const ROUTES = {
  form: "../page2_form/index.html", // Trang tính điểm
  chat: "../page4_chat/index.html", // Trang tư vấn
  school: "https://hcmut.edu.vn", // Website chính BK
  tour360: "https://hcmut.edu.vn/virtual-tour/", // Virtual tour (thay link thật)
};

/* -------------------------------------------------------
   Gán sự kiện sau khi DOM đã tải xong
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  /* Nút "Bắt đầu" → trang form tính điểm */
  document.getElementById("btn-start").addEventListener("click", () => {
    window.location.href = ROUTES.form;
  });

  /* Card "Giới Thiệu Trường" → website BK */
  document.getElementById("card-gioithieu").addEventListener("click", () => {
    window.open(ROUTES.school, "_blank");
  });

  /* Card "Tư Vấn Tuyển Sinh" → trang chat */
  document.getElementById("card-tuvan").addEventListener("click", () => {
    window.location.href = ROUTES.chat;
  });

  /* Card "Tham Quan Ảo" → link 360 */
  document.getElementById("card-360").addEventListener("click", () => {
    window.open(ROUTES.tour360, "_blank");
  });
});
