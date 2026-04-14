/**
 * page4_chat/script.js
 * Chatbot tư vấn tuyển sinh BK HCM
 * Kết nối tới Backend RAG API (Python/FastAPI)
 */

/* -------------------------------------------------------
   CẤU HÌNH API
   → Thay URL nếu deploy lên server khác
------------------------------------------------------- */
const API_CONFIG = {
  // Endpoint của FastAPI backend RAG
  endpoint: 'http://localhost:8000/api/chat',
  // Timeout tối đa mỗi request (ms)
  timeout: 30000,
};

/* -------------------------------------------------------
   LỊCH SỬ HỘI THOẠI (dùng để gửi context cho backend)
------------------------------------------------------- */
let chatHistory = [];

/* -------------------------------------------------------
   TÌM PHẦN TỬ DOM
------------------------------------------------------- */
const messagesDiv = document.getElementById('chat-messages');
const chatInput   = document.getElementById('chat-input');
const btnSend     = document.getElementById('btn-send');

/* -------------------------------------------------------
   HÀM TẠO THỜI GIAN HIỆN TẠI
------------------------------------------------------- */
function nowTime() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/* -------------------------------------------------------
   HÀM THÊM TIN NHẮN BOT
   @param {string} html - Nội dung HTML
   @param {string[]} chips - Mảng chip gợi ý (optional)
------------------------------------------------------- */
function addBotMessage(html, chips = []) {
  const chipsHtml = chips.length
    ? `<div class="quick-chips">${chips.map(c => `<span class="chip" data-msg="${c}">${c}</span>`).join('')}</div>`
    : '';

  const el = document.createElement('div');
  el.className = 'msg-row bot';
  el.innerHTML = `
    <div class="msg-avatar">🎓</div>
    <div>
      <div class="msg-bubble">${html}${chipsHtml}</div>
      <div class="msg-time">${nowTime()}</div>
    </div>`;

  messagesDiv.appendChild(el);
  scrollToBottom();

  // Gán sự kiện cho chip mới được tạo
  el.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.msg));
  });
}

/* -------------------------------------------------------
   HÀM THÊM TIN NHẮN USER
------------------------------------------------------- */
function addUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'msg-row user';
  el.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${nowTime()}</div>
    </div>`;
  messagesDiv.appendChild(el);
  scrollToBottom();
}

/* -------------------------------------------------------
   HIỆN / ẨN TYPING INDICATOR
------------------------------------------------------- */
function showTyping() {
  const el = document.createElement('div');
  el.className = 'msg-row bot';
  el.id = 'typing-indicator';
  el.innerHTML = `
    <div class="msg-avatar">🎓</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  messagesDiv.appendChild(el);
  scrollToBottom();
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove();
}

/* -------------------------------------------------------
   CUỘN XUỐNG CUỐI
------------------------------------------------------- */
function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* -------------------------------------------------------
   ESCAPE HTML (bảo vệ XSS cho tin nhắn user)
------------------------------------------------------- */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* -------------------------------------------------------
   GỌI BACKEND RAG API
   POST /api/chat { question, history }
   → { answer }
------------------------------------------------------- */
async function callRAGApi(question) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const res = await fetch(API_CONFIG.endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question, history: chatHistory }),
      signal:  controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.answer || 'Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé!';

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return 'Yêu cầu quá thời gian. Vui lòng thử lại!';
    }
    // Nếu backend chưa chạy → dùng fallback local
    console.warn('Backend không phản hồi, dùng fallback:', err.message);
    return getFallbackReply(question);
  }
}

/* -------------------------------------------------------
   FALLBACK: Trả lời local khi backend chưa chạy
   (Dùng trong giai đoạn dev / demo)
------------------------------------------------------- */
const FALLBACK_RULES = [
  {
    keys: ['xét tuyển', 'phương thức', 'cách tính', 'điểm xét'],
    reply: `BK HCM 2026 áp dụng <strong>Phương thức Xét Tuyển Tổng Hợp</strong>:<br>
      • <strong>Điểm học lực</strong> (học bạ Toán, Lý, Hóa/Anh lớp 10-12)<br>
      • <strong>Điểm ưu tiên</strong> (khu vực + đối tượng)<br>
      • <strong>Điểm cộng</strong> (tra cứu trên mybk)<br>
      Dùng <a href="../page2_form/index.html" style="color:#90caff;">công cụ tính điểm</a> để tính ngay! 🎯`,
  },
  {
    keys: ['ngành', 'khoa', 'chương trình', 'học gì'],
    reply: `BK HCM có <strong>18+ ngành đại trà</strong> và <strong>5 ngành OISP</strong>. Hot nhất:<br>
      🔹 Khoa học máy tính (~85.41)<br>
      🔹 Khoa học dữ liệu (~83.85)<br>
      🔹 Kỹ thuật máy tính (~82.50)<br>
      🔹 CS OISP (~88.00)<br>Bạn quan tâm ngành nào?`,
  },
  {
    keys: ['oisp', 'tiếng anh', 'tiên tiến'],
    reply: `<strong>Chương trình OISP</strong> giảng dạy hoàn toàn bằng tiếng Anh, hợp tác ĐH Mỹ:<br>
      💰 Học phí: ~120-150 triệu/năm<br>📈 Điểm chuẩn cao hơn đại trà ~2-3 điểm<br>✈️ Cơ hội chuyển tiếp học nước ngoài`,
  },
  {
    keys: ['học phí', 'chi phí', 'tiền'],
    reply: `Học phí BK HCM 2026 (dự kiến):<br>
      💰 Đại trà: ~25-35 triệu/năm<br>
      💰 OISP: ~120-150 triệu/năm<br>
      📌 Có nhiều học bổng hỗ trợ.`,
  },
  {
    keys: ['dgnl', 'đánh giá năng lực'],
    reply: `<strong>Kỳ thi ĐGNL ĐHQG HCM</strong> gồm 3 phần:<br>
      📖 Ngôn ngữ (≤40đ) | 🔢 Toán học (≤50đ) | 🔬 Tư duy KH (≤60đ)<br>
      <strong>Tổng tối đa: 150 điểm.</strong>`,
  },
  {
    keys: ['ielts', 'toefl', 'pte', 'toeic', 'chứng chỉ'],
    reply: `Chứng chỉ tiếng Anh quốc tế quy đổi sang điểm THPT:<br>
      🏅 IELTS 8.0+ → 10đ | IELTS 7.0 → 9.5đ | IELTS 6.0 → 8.5đ<br>
      Dùng công cụ quy đổi trong trang Tính Điểm! ✅`,
  },
  {
    keys: ['khu vực', 'kv1', 'kv2', 'ưu tiên'],
    reply: `Điểm ưu tiên khu vực 2026:<br>
      📍 KV1: +2.00 | KV2-NT: +1.50 | KV2: +1.00 | KV3: 0<br>
      UT1: +2.00 | UT2: +1.00`,
  },
  {
    keys: ['lịch', 'deadline', 'hạn nộp', 'thời gian'],
    reply: `Lịch tuyển sinh BK HCM 2026 (dự kiến):<br>
      📅 T3-4/2026: Đăng ký nguyện vọng<br>
      📅 T6/2026: Thi THPT & ĐGNL<br>
      📅 T7-8/2026: Công bố điểm chuẩn`,
  },
];

function getFallbackReply(text) {
  const lower = text.toLowerCase();
  for (const rule of FALLBACK_RULES) {
    if (rule.keys.some(k => lower.includes(k))) return rule.reply;
  }
  return `Cảm ơn câu hỏi của bạn! Thông tin chi tiết:<br>
    📞 Hotline: <strong>028 3864 8987</strong><br>
    📧 Email: <strong>tuyensinh@hcmut.edu.vn</strong><br>
    🌐 <a href="https://tuyensinh.hcmut.edu.vn" target="_blank" style="color:#90caff;">tuyensinh.hcmut.edu.vn</a>`;
}

/* -------------------------------------------------------
   HÀM GỬI TIN NHẮN CHÍNH
------------------------------------------------------- */
async function sendMessage(text) {
  // Lấy text từ input nếu không có tham số
  const question = (text || chatInput.value).trim();
  if (!question) return;

  // Reset input
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Disable nút gửi trong lúc chờ
  btnSend.disabled = true;

  // Hiện tin nhắn user
  addUserMessage(question);

  // Lưu vào lịch sử
  chatHistory.push({ role: 'user', content: question });

  // Hiện typing indicator
  showTyping();

  // Gọi API
  const answer = await callRAGApi(question);

  // Ẩn typing, hiện câu trả lời
  removeTyping();
  addBotMessage(answer);

  // Lưu câu trả lời vào lịch sử
  chatHistory.push({ role: 'assistant', content: answer });

  // Bật lại nút gửi
  btnSend.disabled = false;
  chatInput.focus();
}

/* -------------------------------------------------------
   KHỞI TẠO KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Tin nhắn chào mở đầu
  addBotMessage(
    `Xin chào! 👋 Mình là <strong>Chuyên viên Tư vấn Tuyển Sinh Bách Khoa HCM</strong>.<br>
    Mình có thể hỗ trợ bạn:<br>
    • Tìm hiểu phương thức xét tuyển 2026<br>
    • Giải đáp thắc mắc về ngành học, học phí<br>
    • Hướng dẫn tính điểm xét tuyển<br>
    Bạn muốn hỏi gì? 😊`,
    // Chip gợi ý nhanh
    [
      'Phương thức xét tuyển',
      'Các ngành học',
      'Học phí OISP',
      'Lịch tuyển sinh 2026',
      'Ưu tiên khu vực',
    ]
  );

  // Nút gửi
  btnSend.addEventListener('click', () => sendMessage());

  // Nhấn Enter gửi (Shift+Enter xuống dòng)
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto resize textarea
  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // Nút quay về trang chủ
  document.getElementById('btn-back-home').addEventListener('click', () => {
    window.location.href = '../page1_landing/index.html';
  });
});
