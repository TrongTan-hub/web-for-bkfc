# 🎓 BK HCM Tuyển Sinh 2026 – Công Cụ Tính Điểm & Tư Vấn RAG

Hệ thống gồm 4 trang web + backend RAG + admin panel để tư vấn tuyển sinh
Đại Học Bách Khoa HCM 2026.

---

## 📁 CẤU TRÚC THƯ MỤC

```
bkfc_project/
├── frontend/
│   ├── page1_landing/          ← Trang chủ (ảnh animate + 3 card)
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── page2_form/             ← Form nhập điểm
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── page3_result/           ← Kết quả xét tuyển (accordion)
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── page4_chat/             ← Chatbox tư vấn RAG
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── backend/
│   ├── main.py                 ← FastAPI server + RAG chain
│   ├── requirements.txt
│   ├── .env.example            ← Mẫu cấu hình
│   ├── data/                   ← Chứa file PDF tài liệu tuyển sinh
│   └── vectorstore/            ← FAISS Vector DB (tự tạo)
│
├── admin/
│   ├── index.html              ← Admin Panel giao diện
│   ├── style.css
│   └── script.js
│
├── docker/
│   ├── Dockerfile.backend      ← Docker image cho FastAPI
│   ├── Dockerfile.frontend     ← Docker image cho Nginx
│   └── nginx.conf              ← Cấu hình Nginx
│
├── docker-compose.yml          ← Production (1 lệnh chạy tất cả)
├── docker-compose.dev.yml      ← Development (hot reload)
├── render.yaml                 ← Deploy lên Render.com
├── railway.toml                ← Deploy lên Railway.app
├── fly.toml                    ← Deploy lên Fly.io
├── .dockerignore
└── .gitignore
```

---

## ⚡ CHẠY NHANH (Local)

### Bước 1: Cài đặt prerequisites
```bash
# Python 3.11+
python --version

# Docker Desktop (tải tại docker.com)
docker --version
docker compose version
```

### Bước 2: Cấu hình môi trường
```bash
cd bkfc_project/backend
cp .env.example .env

# Mở .env và điền:
# GROQ_API_KEY=your_groq_key   ← Lấy miễn phí tại console.groq.com
# ADMIN_API_KEY=your_secret_key
```

### Bước 3A: Chạy bằng Docker (KHUYẾN NGHỊ)
```bash
cd bkfc_project

# Tạo thư mục volume
mkdir -p backend/data backend/vectorstore

# Build và chạy
docker compose up --build

# Truy cập:
# → Trang chủ:    http://localhost
# → Admin Panel:  http://localhost/admin
# → API Docs:     http://localhost/api/docs  (khi phát triển)
```

### Bước 3B: Chạy thủ công (không Docker)
```bash
# Terminal 1: Backend
cd bkfc_project/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd bkfc_project
python -m http.server 3000
# Mở: http://localhost:3000/frontend/page1_landing/index.html
# Admin: http://localhost:3000/admin/index.html
```

---

## 📄 HƯỚNG DẪN NẠP TÀI LIỆU PDF

1. Mở Admin Panel: `http://localhost/admin` (hoặc `/admin/index.html`)
2. Nhập **Admin API Key** (trong file `.env`)
3. Kéo thả file PDF vào vùng upload (hoặc nhấn "Chọn file")
   - Có thể upload nhiều file cùng lúc
   - Hỗ trợ: đề án tuyển sinh, thông báo điểm chuẩn, quy chế...
4. Nhấn **"Upload & Cập nhật Vector DB"**
5. Hệ thống tự động xử lý PDF và cập nhật chatbot

---

## 🔗 TÍCH HỢP API CHAT VỚI FRONTEND

File `page4_chat/script.js` gọi endpoint:
```
POST /api/chat
Body: { "question": "...", "history": [...] }
Response: { "answer": "..." }
```

Nếu backend offline → fallback tự trả lời từ rule-based local.

---

## 🌐 DEPLOY MIỄN PHÍ

### ✅ OPTION 1: Render.com (KHUYẾN NGHỊ NHẤT)

| Thành phần | Service | Giới hạn Free |
|---|---|---|
| Backend  | Render Web Service | 750 giờ/tháng (tắt sau 15p idle) |
| Frontend | Render Static Site | Không giới hạn |

**Các bước:**
```bash
# 1. Push code lên GitHub (bắt buộc)
git init && git add . && git commit -m "init"
git remote add origin https://github.com/USERNAME/bkfc.git
git push -u origin main

# 2. Vào https://render.com → Đăng ký bằng GitHub
# 3. New → Blueprint → Chọn repo → Deploy
# 4. Sau khi deploy, vào Environment → Thêm:
#    GROQ_API_KEY = your_key
#    ADMIN_API_KEY = your_secret
```

**Lưu ý Render free:**
- Backend tắt sau 15 phút không dùng, mất ~30s để khởi động lại
- KHÔNG có persistent disk → PDF và Vector DB mất khi restart
- Giải pháp: Lưu vector DB lên Hugging Face Hub (xem phần nâng cao)

---

### ✅ OPTION 2: Railway.app

| Thành phần | Giới hạn Free |
|---|---|
| $5 credit/tháng | Tương đương ~500 giờ chạy |

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Đăng nhập
railway login

# Khởi tạo project
cd bkfc_project/backend
railway init

# Set biến môi trường
railway variables set GROQ_API_KEY=your_key
railway variables set ADMIN_API_KEY=your_secret

# Deploy
railway up
```

**Lưu ý Railway:**
- Có persistent volume → PDF và Vector DB không mất
- $5 credit miễn phí mỗi tháng (không cần thẻ)
- Tốc độ khởi động nhanh hơn Render

---

### ✅ OPTION 3: Fly.io

| Thành phần | Giới hạn Free |
|---|---|
| 3 shared-cpu-1x 256MB VMs | Miễn phí vĩnh viễn |
| 3GB persistent storage | Miễn phí |

```bash
# Cài Fly CLI
curl -L https://fly.io/install.sh | sh

# Đăng nhập (cần thẻ để verify, không charge)
flyctl auth login

# Tạo app (chạy từ thư mục gốc)
flyctl launch --no-deploy

# Set secrets
flyctl secrets set GROQ_API_KEY=your_groq_key
flyctl secrets set ADMIN_API_KEY=your_admin_key

# Deploy
flyctl deploy

# Xem URL
flyctl status
```

**Lưu ý Fly.io:**
- Cần thẻ tín dụng để đăng ký (nhưng không charge với free tier)
- Có persistent volume 3GB → Tốt cho lưu PDF và Vector DB
- Tự scale về 0 khi không dùng (auto_stop_machines = true)

---

### ✅ OPTION 4: Hugging Face Spaces (Gradio/Streamlit)

Dành cho version đơn giản hơn (chỉ chatbot, không có trang web đầy đủ):

```bash
# Tạo Space tại https://huggingface.co/spaces
# Chọn SDK: "Docker"
# Upload: Dockerfile.backend + backend/ code
```

---

### ✅ OPTION 5: Koyeb.com

- Free tier: 2 services, 2GB RAM
- Deploy bằng Docker hoặc GitHub
- Có persistent storage

---

## 🏗️ HƯỚNG DẪN NÂNG CAO

### Lưu Vector DB lên Hugging Face Hub (giải quyết vấn đề persistent)

```python
# Thêm vào backend/main.py
from huggingface_hub import HfApi

def push_db_to_hf():
    """Upload Vector DB lên HF Hub để lưu bền"""
    api = HfApi(token=os.getenv("HF_TOKEN"))
    api.upload_folder(
        folder_path=str(DB_FAISS_PATH),
        repo_id="username/bkfc-vectordb",
        repo_type="dataset"
    )

def pull_db_from_hf():
    """Tải Vector DB từ HF Hub khi khởi động"""
    from huggingface_hub import snapshot_download
    snapshot_download(
        repo_id="username/bkfc-vectordb",
        repo_type="dataset",
        local_dir=str(DB_FAISS_PATH)
    )
```

### Tối ưu cho production
```bash
# Dùng model embedding nhỏ hơn
model_name = "sentence-transformers/all-MiniLM-L6-v2"   # 80MB thay vì 130MB

# Cache embedding model
HuggingFaceEmbeddings(
    model_name=...,
    cache_folder="/app/.cache"  # Không tải lại khi restart
)
```

---

## 🔑 LẤY GROQ API KEY (MIỄN PHÍ)

1. Vào https://console.groq.com
2. Đăng ký tài khoản (miễn phí)
3. API Keys → Create API Key
4. Copy key vào file `.env`

**Groq free tier:** 14,400 tokens/phút (đủ dùng cho ~100 câu hỏi/phút)

---

## 📞 LIÊN HỆ & TÀI LIỆU

- Website BK: https://hcmut.edu.vn
- Tuyển sinh: https://tuyensinh.hcmut.edu.vn
- Hotline: 028 3864 8987

---

## 🏆 SO SÁNH CÁC PLATFORM MIỄN PHÍ

| Platform | Cold Start | Persistent DB | RAM | Thẻ TN? | Điểm |
|---|---|---|---|---|---|
| **Render.com**   | ~30s | ❌ Free / ✅ $7 | 512MB | Không | ⭐⭐⭐⭐ |
| **Railway.app**  | ~10s | ✅            | 512MB | Không | ⭐⭐⭐⭐⭐ |
| **Fly.io**       | ~15s | ✅ 3GB        | 256MB | Có    | ⭐⭐⭐⭐ |
| **Koyeb.com**    | ~20s | ✅            | 512MB | Không | ⭐⭐⭐ |
| **HF Spaces**    | ~60s | ❌            | 16GB  | Không | ⭐⭐ |

> **Khuyến nghị:** Dùng **Railway.app** cho backend (có persistent DB, không cần thẻ),
> **Render.com Static Site** cho frontend (miễn phí 100%).
# web-for-bkfc
