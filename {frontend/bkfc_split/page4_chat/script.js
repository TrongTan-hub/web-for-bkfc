/**
 * page4_chat/script.js
 * Chatbot tư vấn tuyển sinh BK HCM – trả lời dựa trên từ khoá
 */

/* -------------------------------------------------------
   DANH SÁCH CÂU TRẢ LỜI TỰ ĐỘNG THEO TỪ KHÓA
------------------------------------------------------- */
const chatRules = [
  {
    keys: ['xét tuyển', 'phương thức', 'cách tính', 'điểm xét', 'xét tuyển tổng hợp'],
    reply: `ĐH Bách Khoa HCM 2026 áp dụng <strong>Phương thức Xét Tuyển Tổng Hợp</strong> gồm:<br>
      • <strong>Điểm học lực</strong> (dựa trên học bạ Toán, Lý, Hóa/Anh lớp 10-12)<br>
      • <strong>Điểm ưu tiên</strong> (khu vực + đối tượng)<br>
      • <strong>Điểm cộng</strong> (tra cứu trên mybk)<br>
      Tổng điểm = Học lực + Ưu tiên + Cộng. Bạn có thể dùng công cụ tính điểm trên trang này! 🎯`
  },
  {
    keys: ['ngành', 'khoa', 'chương trình', 'học gì'],
    reply: `BK HCM có <strong>18+ ngành đại trà</strong> và <strong>5 ngành OISP</strong> (giảng dạy bằng tiếng Anh). Một số ngành hot:<br>
      🔹 Khoa học máy tính (điểm chuẩn ~85.41)<br>
      🔹 Khoa học dữ liệu (~83.85)<br>
      🔹 Kỹ thuật máy tính (~82.50)<br>
      🔹 Computer Science OISP (~88.00)<br>
      Bạn quan tâm ngành nào?`
  },
  {
    keys: ['oisp', 'tiếng anh', 'chương trình tiên tiến'],
    reply: `<strong>Chương trình OISP</strong> (Office for International Study Programs) là chương trình giảng dạy hoàn toàn bằng tiếng Anh, hợp tác với các đại học Mỹ.<br>
      • Học phí cao hơn chương trình đại trà (~120-150 triệu/năm)<br>
      • Điểm chuẩn thường cao hơn 2-3 điểm so với đại trà<br>
      • Cơ hội chuyển tiếp học ở nước ngoài`
  },
  {
    keys: ['học phí', 'chi phí', 'bao nhiêu tiền'],
    reply: `Học phí ĐH Bách Khoa HCM 2026 (dự kiến):<br>
      💰 <strong>Chương trình đại trà:</strong> ~25-35 triệu/năm<br>
      💰 <strong>Chương trình OISP:</strong> ~120-150 triệu/năm<br>
      📌 Có nhiều học bổng và hỗ trợ tài chính. Xem chi tiết tại <a href="https://tuyensinh.hcmut.edu.vn" target="_blank" style="color:#90caff;">tuyensinh.hcmut.edu.vn</a>`
  },
  {
    keys: ['dgnl', 'đánh giá năng lực', 'thi đánh giá'],
    reply: `<strong>Kỳ thi Đánh giá Năng lực (ĐGNL)</strong> do ĐHQG HCM tổ chức gồm 3 phần:<br>
      📖 Ngôn ngữ (tối đa 40 điểm)<br>
      🔢 Toán học (tối đa 50 điểm)<br>
      🔬 Tư duy khoa học (tối đa 60 điểm)<br>
      <strong>Tổng tối đa: 150 điểm.</strong> BK HCM quy đổi sang thang 100 để xét tuyển.`
  },
  {
    keys: ['ielts', 'toefl', 'pte', 'toeic', 'chứng chỉ', 'tiếng anh'],
    reply: `Thí sinh có chứng chỉ tiếng Anh quốc tế có thể quy đổi sang điểm thi THPT môn Anh:<br>
      🏅 IELTS 8.0+ → 10 điểm | IELTS 7.5 → 9.8 | IELTS 7.0 → 9.5<br>
      🏅 TOEFL iBT 110+ → 10 điểm<br>
      Dùng công cụ tra bảng trong phần <strong>Tính Điểm</strong> để tự động quy đổi! ✅`
  },
  {
    keys: ['khu vực', 'kv1', 'kv2', 'ưu tiên', 'đối tượng'],
    reply: `Điểm ưu tiên khu vực 2026:<br>
      📍 KV1 (nông thôn): +2.00 điểm<br>
      📍 KV2-NT: +1.50 điểm<br>
      📍 KV2: +1.00 điểm<br>
      📍 KV3 (thành thị): 0 điểm<br>
      Đối tượng ưu tiên 1 (UT1): +2.00 | UT2: +1.00`
  },
  {
    keys: ['deadline', 'hạn nộp', 'lịch', 'thời gian'],
    reply: `Lịch tuyển sinh BK HCM 2026 (dự kiến):<br>
      📅 Tháng 3-4/2026: Đăng ký nguyện vọng trên hệ thống<br>
      📅 Tháng 6/2026: Thi THPT Quốc gia & ĐGNL<br>
      📅 Tháng 7-8/2026: Công bố điểm chuẩn & nhập học<br>
      ⚠️ Theo dõi thông báo chính thức tại website trường!`
  },
];

/* -------------------------------------------------------
   BIẾN TRẠNG THÁI
------------------------------------------------------- */
let chatInited = false; /* Tránh thêm tin nhắn chào bị lặp khi quay lại */

/* -------------------------------------------------------
   HÀM THÊM TIN NHẮN BOT
------------------------------------------------------- */
function addBotMessage(text, chips = []) {
  const messagesDiv = document.getElementById('chat-messages');
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  /* Tạo HTML chips nếu có */
  const chipsHtml = chips.length > 0
    ? `<div class="quick-chips">${chips.map(c => `<span class="chip" onclick="sendChip('${c}')">${c}</span>`).join('')}</div>`
    : '';

  const msgEl = document.createElement('div');
  msgEl.className = 'msg-row bot';
  msgEl.innerHTML = `
    <div class="msg-avatar">🎓</div>
    <div>
      <div class="msg-bubble">${text}${chipsHtml}</div>
      <div class="msg-time">${now}</div>
    </div>`;

  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* -------------------------------------------------------
   HÀM THÊM TIN NHẮN USER
------------------------------------------------------- */
function addUserMessage(text) {
  const messagesDiv = document.getElementById('chat-messages');
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const msgEl = document.createElement('div');
  msgEl.className = 'msg-row user';
  msgEl.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div>
      <div class="msg-bubble">${text}</div>
      <div class="msg-time">${now}</div>
    </div>`;

  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* -------------------------------------------------------
   HIỂN THỊ / ẨN TYPING INDICATOR
------------------------------------------------------- */
function showTyping() {
  const messagesDiv = document.getElementById('chat-messages');
  const typingEl = document.createElement('div');
  typingEl.className = 'msg-row bot';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `
    <div class="msg-avatar">🎓</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  messagesDiv.appendChild(typingEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

/* -------------------------------------------------------
   TÌM CÂU TRẢ LỜI PHÙ HỢP DỰA TRÊN TỪ KHÓA
------------------------------------------------------- */
function findReply(text) {
  const lower = text.toLowerCase();
  for (const rule of chatRules) {
    if (rule.keys.some(k => lower.includes(k))) {
      return rule.reply;
    }
  }
  /* Câu trả lời mặc định */
  return `Cảm ơn bạn đã hỏi! Câu hỏi của bạn đang được chuyển tới chuyên viên tuyển sinh.<br>
    Bạn cũng có thể:<br>
    📞 Liên hệ hotline: <strong>028 3864 8987</strong><br>
    📧 Email: <strong>tuyensinh@hcmut.edu.vn</strong><br>
    🌐 Website: <a href="https://tuyensinh.hcmut.edu.vn" target="_blank" style="color:#90caff;">tuyensinh.hcmut.edu.vn</a>`;
}

/* -------------------------------------------------------
   GỬI TIN NHẮN TỪ INPUT
------------------------------------------------------- */
function sendChat() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;

  addUserMessage(text);        /* Hiện tin nhắn user */
  input.value = '';             /* Xóa input */
  input.style.height = 'auto'; /* Reset chiều cao textarea */

  showTyping(); /* Hiện 3 chấm đang gõ */

  /* Giả lập delay phản hồi 0.8–1.5s */
  setTimeout(() => {
    removeTyping();
    addBotMessage(findReply(text));
  }, 800 + Math.random() * 700);
}

/* Gửi khi nhấn chip gợi ý nhanh */
function sendChip(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}

/* Gửi khi nhấn Enter (Shift+Enter = xuống dòng) */
function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
}

/* Auto-resize textarea theo nội dung */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* -------------------------------------------------------
   KHỞI TẠO KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* Nút quay về trang chủ */
  document.getElementById('btn-back-home').addEventListener('click', () => {
    window.location.href = '../page1_landing/index.html';
  });

  /* Hiện tin nhắn chào lần đầu */
  if (!chatInited) {
    chatInited = true;
    addBotMessage(
      `Xin chào! 👋 Mình là <strong>Chuyên viên Tư vấn Tuyển Sinh Bách Khoa HCM</strong>.<br>
      Mình có thể giúp bạn:<br>
      • Tìm hiểu các phương thức xét tuyển 2026<br>
      • Giải đáp thắc mắc về ngành học, học phí<br>
      • Hướng dẫn tính điểm xét tuyển<br>
      Bạn muốn hỏi gì? 😊`,
      /* Chip gợi ý nhanh */
      ['Phương thức xét tuyển', 'Các ngành học', 'Học phí OISP', 'Lịch tuyển sinh 2026', 'Ưu tiên khu vực']
    );
  }

});
