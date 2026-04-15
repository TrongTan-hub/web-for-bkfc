FROM python:3.11-slim

# --- Biến môi trường ---
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /code

# --- Cài đặt dependency hệ thống ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# --- Copy requirements (Lưu ý: Bỏ chữ backend/ đi) ---
COPY requirements.txt .

# --- Cài đặt Python packages ---
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --- Copy toàn bộ source code vào /code ---
COPY . .

# --- Tạo thư mục và cấp quyền ghi cho User của Hugging Face ---
RUN mkdir -p data vectorstore/db_faiss && \
    chmod -R 777 /code

# --- Port mặc định của HF là 7860 ---
EXPOSE 7860

# --- Lệnh khởi động (Sửa port thành 7860) ---
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]