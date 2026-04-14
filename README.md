# 🎓 BKFC – Công Cụ Tính Điểm & Tư Vấn Tuyển Sinh BK HCM 2026

<div align="center">

![Banner](https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/HCM_City_University_of_Technology_%28HCMUT%29.jpg/640px-HCM_City_University_of_Technology_%28HCMUT%29.jpg)

**Hệ thống tính điểm xét tuyển tổng hợp + chatbot tư vấn RAG dành cho thí sinh Đại Học Bách Khoa HCM 2026**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=flat&logo=langchain&logoColor=white)](https://langchain.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

</div>

---

## 📌 Giới thiệu

**BKFC Tuyển Sinh 2026** là một ứng dụng web hỗ trợ thí sinh trường THPT Trường Chinh tra cứu và tính toán điểm xét tuyển vào **Đại Học Bách Khoa HCM** theo phương thức xét tuyển tổng hợp năm 2026, kết hợp chatbot tư vấn thông minh được xây dựng trên nền tảng **RAG (Retrieval-Augmented Generation)**.

Dự án gồm 2 phần chính:
- **Frontend** – 4 trang web tĩnh (HTML/CSS/JS), không cần framework
- **Backend** – REST API Python (FastAPI) tích hợp LangChain RAG, FAISS Vector DB và Groq LLM

---

## ✨ Tính năng

### 🖥️ Frontend
| Trang | Mô tả |
|---|---|
| **Landing Page** | Trang chủ với hiệu ứng ảnh nền animate từ trái sang phải (1s), điều hướng 3 card |
| **Form Tính Điểm** | Nhập học bạ, điểm THPT, ĐGNL, khu vực, ưu tiên; quy đổi chứng chỉ tiếng Anh (IELTS/TOEFL/PTE/TOEIC) |
| **Kết Quả** | Hiển thị tổng điểm, phân loại ngành đủ/không đủ điểm, accordion mở/đóng |
| **Chat Tư Vấn** | Giao diện chatbox với typing indicator, chip gợi ý nhanh, kết nối RAG API |

### ⚙️ Backend
- **RAG Pipeline** – LangChain + FAISS Vector DB + Groq LLaMA 3.3 70B
- **Embedding** – `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (hỗ trợ tiếng Việt)
- **API** – FastAPI với CORS, upload PDF, rebuild vector DB
- **Admin Panel** – Giao diện web quản lý tài liệu, upload PDF, xem trạng thái hệ thống

---

## 🗂️ Cấu trúc thư mục

```
bkfc_project/
│
├── frontend/                        # Giao diện người dùng
│   ├── page1_landing/               # Trang chủ
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── page2_form/                  # Form nhập điểm
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── page3_result/                # Trang kết quả
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── page4_chat/                  # Chatbot tư vấn
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── backend/                         # FastAPI + RAG
│   ├── main.py                      # Server chính
│   ├── requirements.txt
│   ├── .env.example                 # Mẫu biến môi trường
│   ├── data/                        # Chứa file PDF tài liệu
│   └── vectorstore/                 # FAISS Vector DB (tự sinh)
│
├── admin/                           # Trang quản trị
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml               # Production
├── docker-compose.dev.yml           # Development (hot reload)
├── render.yaml                      # Deploy Render.com
├── railway.toml                     # Deploy Railway.app
├── fly.toml                         # Deploy Fly.io
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- Python 3.11+
- Docker & Docker Compose (khuyến nghị)
- Groq API Key miễn phí tại [console.groq.com](https://console.groq.com)

---

### ▶️ Chạy bằng Docker (khuyến nghị)

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/bkfc-tuyen-sinh.git
cd bkfc-tuyen-sinh

# 2. Tạo thư mục dữ liệu
mkdir -p backend/data backend/vectorstore

# 3. Cấu hình biến môi trường
cp backend/.env.example backend/.env
# Mở backend/.env và điền GROQ_API_KEY, ADMIN_API_KEY

# 4. Build và chạy
docker compose up --build
```

Truy cập:
- 🌐 Trang chủ: `http://localhost`
- 🔧 Admin Panel: `http://localhost/admin`
- 📖 API Docs: `http://localhost/api/docs`

---

### ▶️ Chạy thủ công (không Docker)

```bash
# Terminal 1 – Backend
cd backend
pip install -r requirements.txt
cp .env.example .env        # Điền GROQ_API_KEY
uvicorn main:app --reload --port 8000

# Terminal 2 – Frontend
cd ..
python -m http.server 3000
# Mở: http://localhost:3000/frontend/page1_landing/index.html
```

---

## 📄 Nạp tài liệu PDF vào RAG

1. Mở **Admin Panel**: `http://localhost/admin`
2. Nhập **Admin API Key** (đã cấu hình trong `.env`)
3. Kéo thả hoặc chọn file PDF (đề án tuyển sinh, thông báo điểm chuẩn, quy chế...)
4. Nhấn **"Upload & Cập nhật Vector DB"**
5. Chatbot sẽ tự động cập nhật kiến thức mới

---

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra trạng thái hệ thống |
| `POST` | `/api/chat` | Gửi câu hỏi, nhận câu trả lời RAG |
| `GET` | `/api/admin/files` | Liệt kê file PDF *(cần API key)* |
| `POST` | `/api/admin/upload` | Upload PDF mới *(cần API key)* |
| `DELETE` | `/api/admin/files/{name}` | Xóa file PDF *(cần API key)* |
| `POST` | `/api/admin/rebuild` | Rebuild Vector DB thủ công *(cần API key)* |

**Ví dụ gọi API chat:**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Điểm chuẩn ngành Khoa học máy tính 2025 là bao nhiêu?"}'
```

---

## 🌐 Deploy miễn phí

| Platform | Backend | Frontend | Persistent DB | Thẻ TN? |
|---|---|---|---|---|
| **Railway.app** ⭐ | ✅ Free $5/tháng | ✅ | ✅ | Không |
| **Render.com** | ✅ 750h/tháng | ✅ Static | ❌ Free / ✅ $7 | Không |
| **Fly.io** | ✅ 3 VMs free | ✅ | ✅ 3GB | Cần verify |
| **Koyeb.com** | ✅ 2 services | ✅ | ✅ | Không |

### Deploy lên Railway (nhanh nhất)
```bash
npm install -g @railway/cli
railway login
cd backend && railway init
railway variables set GROQ_API_KEY=xxx ADMIN_API_KEY=xxx
railway up
```

### Deploy lên Render
1. Push code lên GitHub
2. Vào [render.com](https://render.com) → **New Blueprint** → Chọn repo
3. Thêm `GROQ_API_KEY` và `ADMIN_API_KEY` trong **Environment**

---

## ⚙️ Biến môi trường

| Biến | Mô tả | Bắt buộc |
|---|---|---|
| `GROQ_API_KEY` | API key từ [console.groq.com](https://console.groq.com) | ✅ |
| `ADMIN_API_KEY` | Mật khẩu bảo vệ Admin Panel | ✅ |
| `PORT` | Cổng server (mặc định `8000`) | ❌ |
| `ENV` | `development` hoặc `production` | ❌ |

---

## 🧠 Công nghệ sử dụng

**Frontend**
- HTML5 / CSS3 / Vanilla JavaScript (không framework)
- Google Fonts – Roboto Condensed
- CSS animations (`clip-path`, `@keyframes`)
- `sessionStorage` để truyền dữ liệu giữa các trang

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) – REST API framework
- [LangChain](https://langchain.com) – RAG orchestration
- [FAISS](https://faiss.ai) – Vector similarity search
- [HuggingFace Sentence Transformers](https://sbert.net) – Embedding đa ngôn ngữ
- [Groq](https://groq.com) – LLM inference cực nhanh (LLaMA 3.3 70B)
- [PyPDF](https://pypdf.readthedocs.io) – Đọc file PDF

**Infrastructure**
- Docker & Docker Compose
- Nginx (reverse proxy + static file server)

---

## 📐 Công thức tính điểm

```
Tổng điểm = Điểm học lực + Điểm ưu tiên + Điểm cộng

Điểm học lực  = Trung bình(Toán, Lý, Hóa/Anh lớp 10-12) × 10

Điểm ưu tiên:
  KV1    = +2.00  |  KV2-NT = +1.50
  KV2    = +1.00  |  KV3    = 0.00
  UT1    = +2.00  |  UT2    = +1.00
```

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repo này
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m "feat: thêm tính năng XYZ"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 📞 Liên hệ & Tài nguyên

- 🌐 Website BK HCM: [hcmut.edu.vn](https://hcmut.edu.vn)
- 📋 Tuyển sinh chính thức: [tuyensinh.hcmut.edu.vn](https://tuyensinh.hcmut.edu.vn)
- 📞 Hotline: **028 3864 8987**
- 📧 Email: **tuyensinh@hcmut.edu.vn**

---

## 📝 License

Dự án được phân phối theo giấy phép **MIT**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<div align="center">
  <sub>Made with ❤️ by BKFC – Trường THPT Trường Chinh</sub>
</div>
