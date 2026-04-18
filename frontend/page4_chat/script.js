/**
 * page4_chat/script.js
 * Chatbot tư vấn tuyển sinh BK HCM
 * Kết nối tới Backend RAG API (Python/FastAPI)
 */

/* -------------------------------------------------------
   CẤU HÌNH API
------------------------------------------------------- */
const API_CONFIG = {
  // Link Space của Tấn trên Hugging Face
  endpoint: "https://ttan-3126-web-for-bkfc.hf.space/api/chat",
  timeout: 30000,
};

/* -------------------------------------------------------
   LỊCH SỬ HỘI THOẠI
------------------------------------------------------- */
let chatHistory = [];

/* -------------------------------------------------------
   TÌM PHẦN TỬ DOM
------------------------------------------------------- */
const messagesDiv = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send");

/* -------------------------------------------------------
   HÀM TIỆN ÍCH
------------------------------------------------------- */
function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* -------------------------------------------------------
   GIAO DIỆN TIN NHẮN
------------------------------------------------------- */
function addBotMessage(html, chips = []) {
  const chipsHtml = chips.length
    ? `<div class="quick-chips">${chips.map((c) => `<span class="chip" data-msg="${c}">${c}</span>`).join("")}</div>`
    : "";

  const el = document.createElement("div");
  el.className = "msg-row bot";
  el.innerHTML = `
    <div class="msg-avatar">🎓</div>
    <div>
      <div class="msg-bubble">${html}${chipsHtml}</div>
      <div class="msg-time">${nowTime()}</div>
    </div>`;

  messagesDiv.appendChild(el);
  scrollToBottom();

  el.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => sendMessage(chip.dataset.msg));
  });
}

function addUserMessage(text) {
  const el = document.createElement("div");
  el.className = "msg-row user";
  el.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${nowTime()}</div>
    </div>`;
  messagesDiv.appendChild(el);
  scrollToBottom();
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "msg-row bot";
  el.id = "typing-indicator";
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
  document.getElementById("typing-indicator")?.remove();
}

/* -------------------------------------------------------
   GỌI BACKEND RAG API
------------------------------------------------------- */
async function callRAGApi(question) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const res = await fetch(API_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        history: chatHistory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    // Đảm bảo lấy đúng key 'answer' từ response của FastAPI
    return (
      data.answer ||
      "Bách Khoa chưa tìm thấy thông tin cụ thể, bạn có thể đặt câu hỏi khác nhé!"
    );
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Lỗi API:", err);

    if (err.name === "AbortError") {
      return "Hệ thống đang xử lý hơi lâu, bạn vui lòng thử lại sau giây lát nhé!";
    }
    return "Kết nối tới server tư vấn đang gặp sự cố. Bạn kiểm tra lại mạng hoặc thử lại sau nhé!";
  }
}

/* -------------------------------------------------------
   HÀM GỬI TIN NHẮN CHÍNH
------------------------------------------------------- */
async function sendMessage(text) {
  const question = (text || chatInput.value).trim();
  if (!question) return;

  chatInput.value = "";
  chatInput.style.height = "auto";
  btnSend.disabled = true;

  addUserMessage(question);
  chatHistory.push({ role: "user", content: question });

  showTyping();

  // Luôn gọi API, không dùng Fallback local nữa
  const answer = await callRAGApi(question);

  removeTyping();
  addBotMessage(answer);

  chatHistory.push({ role: "assistant", content: answer });
  btnSend.disabled = false;
  chatInput.focus();
}

/* -------------------------------------------------------
   KHỞI TẠO
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  addBotMessage(
    `Xin chào! 👋 Mình là <strong>Trợ lý ảo BK-FC</strong>.<br>
    Mình đã sẵn sàng giải đáp mọi thắc mắc về tuyển sinh Bách Khoa HCM 2026 dựa trên dữ liệu mới nhất.<br>
    Bạn muốn tìm hiểu về ngành học hay cách tính điểm? 😊`,
    ["Phương thức xét tuyển", "Học phí các ngành", "Lịch tuyển sinh 2026"],
  );

  btnSend.addEventListener("click", () => sendMessage());

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });

  const btnBack = document.getElementById("btn-back-home");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.location.href = "/frontend/page1_landing/index.html";
    });
  }
});
