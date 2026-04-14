/**
 * admin/script.js
 * Admin Panel – Quản lý tài liệu PDF cho hệ thống RAG BK HCM
 */

/* -------------------------------------------------------
   CẤU HÌNH
------------------------------------------------------- */
const API_BASE = "http://localhost:7860"; // Thay khi deploy

/* -------------------------------------------------------
   STATE
------------------------------------------------------- */
let apiKey = ""; // API key admin
let selectedFiles = []; // Mảng File đã chọn để upload
let isAuthed = false; // Trạng thái đã xác thực

/* -------------------------------------------------------
   HÀM LOG
------------------------------------------------------- */
function addLog(message, type = "info") {
  const logDiv = document.getElementById("activity-log");
  const time = new Date().toLocaleTimeString("vi-VN");

  const el = document.createElement("div");
  el.className = `log-item log-${type}`;
  el.textContent = `[${time}] ${message}`;

  logDiv.appendChild(el);
  logDiv.scrollTop = logDiv.scrollHeight; // Auto scroll xuống
}

/* -------------------------------------------------------
   CẬP NHẬT STATUS BADGE TRÊN HEADER
------------------------------------------------------- */
function setHeaderStatus(state, text) {
  const badge = document.getElementById("status-badge");
  badge.className = `header-status ${state}`;
  document.getElementById("status-text").textContent = text;
}

/* -------------------------------------------------------
   CẬP NHẬT BẢNG TRẠNG THÁI HỆ THỐNG
------------------------------------------------------- */
async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();

    setHeaderStatus("connected", "Backend online");

    // Cập nhật từng ô status
    setStatusVal("sys-backend", "Online", "ok");
    setStatusVal(
      "sys-vectordb",
      data.vectorstore_ready ? "Sẵn sàng" : "Chưa có dữ liệu",
      data.vectorstore_ready ? "ok" : "pending",
    );
    setStatusVal(
      "sys-ragchain",
      data.rag_chain_ready ? "Sẵn sàng" : "Chưa khởi tạo",
      data.rag_chain_ready ? "ok" : "pending",
    );
    setStatusVal(
      "sys-pdfs",
      `${data.pdf_count} file`,
      data.pdf_count > 0 ? "ok" : "pending",
    );
  } catch {
    setHeaderStatus("error", "Backend offline");
    setStatusVal("sys-backend", "Offline", "error");
    setStatusVal("sys-vectordb", "--", "");
    setStatusVal("sys-ragchain", "--", "");
    setStatusVal("sys-pdfs", "--", "");
    addLog(
      "Không kết nối được backend. Kiểm tra server đang chạy chưa.",
      "error",
    );
  }
}

function setStatusVal(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `status-val ${cls}`;
}

/* -------------------------------------------------------
   XÁC THỰC ADMIN
------------------------------------------------------- */
async function authenticate() {
  const key = document.getElementById("api-key-input").value.trim();
  if (!key) {
    alert("Vui lòng nhập API Key!");
    return;
  }

  try {
    // Test key bằng cách gọi endpoint list files
    const res = await fetch(
      `${API_BASE}/api/admin/files?x_api_key=${encodeURIComponent(key)}`,
    );

    if (res.ok) {
      apiKey = key;
      isAuthed = true;
      document.getElementById("auth-status").classList.remove("hidden");
      document.getElementById("btn-auth").textContent = "✅ Đã xác thực";
      document.getElementById("btn-auth").disabled = true;
      document.getElementById("btn-upload").disabled =
        selectedFiles.length === 0;
      addLog("Xác thực admin thành công.", "success");
      loadFileList();
    } else {
      addLog("API Key không hợp lệ!", "error");
      alert("API Key không đúng! Kiểm tra lại file .env");
    }
  } catch {
    addLog("Lỗi kết nối backend khi xác thực.", "error");
  }
}

/* -------------------------------------------------------
   TẢI DANH SÁCH FILE
------------------------------------------------------- */
async function loadFileList() {
  if (!isAuthed) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/files?x_api_key=${apiKey}`);
    const data = await res.json();

    const tbody = document.getElementById("file-table-body");
    const counter = document.getElementById("file-count");
    counter.textContent = `Tổng cộng: ${data.total} file PDF`;

    if (data.files.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="empty-row">Chưa có tài liệu nào</td></tr>`;
      return;
    }

    // Render từng file
    tbody.innerHTML = data.files
      .map(
        (f) => `
      <tr>
        <td>📄 ${f.name}</td>
        <td>${formatFileSize(f.size)}</td>
        <td>
          <button class="btn-delete" onclick="deleteFile('${f.name}')">🗑️ Xóa</button>
        </td>
      </tr>
    `,
      )
      .join("");

    addLog(`Tải danh sách: ${data.total} file PDF.`, "info");
  } catch {
    addLog("Không tải được danh sách file.", "error");
  }
}

/* -------------------------------------------------------
   XÓA FILE
------------------------------------------------------- */
async function deleteFile(filename) {
  if (!confirm(`Bạn có chắc muốn xóa "${filename}"?`)) return;

  addLog(`Đang xóa: ${filename}...`, "warning");

  try {
    const res = await fetch(
      `${API_BASE}/api/admin/files/${encodeURIComponent(filename)}?x_api_key=${apiKey}`,
      { method: "DELETE" },
    );
    const data = await res.json();

    if (res.ok) {
      addLog(`✅ Đã xóa ${filename} và rebuild Vector DB.`, "success");
      loadFileList();
      fetchSystemStatus();
    } else {
      addLog(`❌ Lỗi xóa: ${data.detail}`, "error");
    }
  } catch (e) {
    addLog(`❌ ${e.message}`, "error");
  }
}

/* -------------------------------------------------------
   UPLOAD FILE
------------------------------------------------------- */
async function uploadFiles() {
  if (!isAuthed) {
    alert("Vui lòng xác thực admin trước!");
    return;
  }
  if (selectedFiles.length === 0) {
    alert("Chưa chọn file nào!");
    return;
  }

  const progressWrap = document.getElementById("upload-progress");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  progressWrap.classList.remove("hidden");
  progressFill.style.width = "10%";
  progressText.textContent = `Đang upload ${selectedFiles.length} file...`;

  const formData = new FormData();
  selectedFiles.forEach((f) => formData.append("files", f));

  addLog(`Bắt đầu upload ${selectedFiles.length} file...`, "info");

  try {
    progressFill.style.width = "40%";

    const res = await fetch(
      `${API_BASE}/api/admin/upload?x_api_key=${apiKey}`,
      { method: "POST", body: formData },
    );
    const data = await res.json();

    progressFill.style.width = "100%";
    progressText.textContent = data.message;

    // Log kết quả
    data.uploaded.forEach((f) =>
      addLog(`✅ Upload thành công: ${f}`, "success"),
    );
    data.errors.forEach((e) => addLog(`❌ Lỗi: ${e}`, "error"));

    // Reset
    selectedFiles = [];
    document.getElementById("file-list").innerHTML = "";
    document.getElementById("selected-files").classList.add("hidden");
    document.getElementById("file-input").value = "";
    document.getElementById("btn-upload").disabled = true;

    // Làm mới danh sách và status
    loadFileList();
    fetchSystemStatus();

    setTimeout(() => {
      progressWrap.classList.add("hidden");
      progressFill.style.width = "0%";
    }, 3000);
  } catch (e) {
    progressText.textContent = `Lỗi: ${e.message}`;
    addLog(`❌ Upload thất bại: ${e.message}`, "error");
    setTimeout(() => {
      progressWrap.classList.add("hidden");
    }, 3000);
  }
}

/* -------------------------------------------------------
   REBUILD THỦ CÔNG
------------------------------------------------------- */
async function rebuildDB() {
  if (!isAuthed) {
    alert("Vui lòng xác thực admin trước!");
    return;
  }
  if (!confirm("Rebuild toàn bộ Vector DB? Quá trình này có thể mất vài phút."))
    return;

  addLog("🔨 Bắt đầu rebuild Vector DB...", "warning");

  try {
    const res = await fetch(
      `${API_BASE}/api/admin/rebuild?x_api_key=${apiKey}`,
      { method: "POST" },
    );
    const data = await res.json();

    if (res.ok) {
      addLog(`✅ ${data.message}`, "success");
      fetchSystemStatus();
    } else {
      addLog(`❌ Rebuild thất bại: ${data.detail}`, "error");
    }
  } catch (e) {
    addLog(`❌ ${e.message}`, "error");
  }
}

/* -------------------------------------------------------
   HIỂN THỊ FILE ĐÃ CHỌN
------------------------------------------------------- */
function showSelectedFiles(files) {
  selectedFiles = Array.from(files);

  const listEl = document.getElementById("file-list");
  const container = document.getElementById("selected-files");
  const btnUpload = document.getElementById("btn-upload");

  listEl.innerHTML = selectedFiles
    .map(
      (f) => `
    <li>📄 <span>${f.name}</span> <em>(${formatFileSize(f.size)})</em></li>
  `,
    )
    .join("");

  container.classList.toggle("hidden", selectedFiles.length === 0);
  btnUpload.disabled = selectedFiles.length === 0 || !isAuthed;
}

/* -------------------------------------------------------
   HÀM TIỆN ÍCH: Format kích thước file
------------------------------------------------------- */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/* -------------------------------------------------------
   KHỞI TẠO KHI DOM TẢI
------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // === Xác thực ===
  document.getElementById("btn-auth").addEventListener("click", authenticate);
  document.getElementById("api-key-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") authenticate();
  });

  // === File input ===
  document.getElementById("file-input").addEventListener("change", (e) => {
    showSelectedFiles(e.target.files);
  });

  // === Drop zone ===
  const dropZone = document.getElementById("drop-zone");

  dropZone.addEventListener("click", () => {
    document.getElementById("file-input").click();
  });
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf",
    );
    if (files.length === 0) {
      alert("Chỉ chấp nhận file PDF!");
      return;
    }
    showSelectedFiles(files);
  });

  // === Upload ===
  document.getElementById("btn-upload").addEventListener("click", uploadFiles);

  // === Rebuild ===
  document.getElementById("btn-rebuild").addEventListener("click", rebuildDB);

  // === Làm mới danh sách ===
  document.getElementById("btn-refresh").addEventListener("click", () => {
    loadFileList();
    fetchSystemStatus();
  });

  // === Xóa log ===
  document.getElementById("btn-clear-log").addEventListener("click", () => {
    document.getElementById("activity-log").innerHTML = "";
    addLog("Log đã được xóa.", "info");
  });

  // === Kiểm tra status khi load ===
  fetchSystemStatus();

  // === Auto refresh status mỗi 30 giây ===
  setInterval(fetchSystemStatus, 30000);
});
