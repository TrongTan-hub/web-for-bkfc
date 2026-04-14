/**
 * page1_landing/script.js
 * Xử lý điều hướng các nút và card trên Landing Page
 */

document.addEventListener("DOMContentLoaded", () => {
  /* Nút "Bắt đầu" → sang trang form tính điểm */
  document.getElementById("btn-start").addEventListener("click", () => {
    window.location.href = "../page2_form/index.html";
  });

  /* Card "Giới Thiệu Trường" → mở website BK */
  document.getElementById("card-gioithieu").addEventListener("click", () => {
    window.open("https://hcmut.edu.vn", "_blank");
  });

  /* Card "Tư Vấn Tuyển Sinh" → sang trang chat */
  document.getElementById("card-tuvan").addEventListener("click", () => {
    window.location.href = "../page4_chat/index.html";
  });

  /* Card "Tham Quan Ảo" → mở link 360 */
  document.getElementById("card-360").addEventListener("click", () => {
    window.open("https://hcmut.edu.vn/virtual-tour/", "_blank");
  });
});
