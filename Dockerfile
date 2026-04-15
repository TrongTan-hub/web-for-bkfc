FROM python:3.11-slim

# --- Biến môi trường ---
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HOME=/home/user

# Thiết lập làm việc trong thư mục app (thay vì code để đồng bộ với user mới)
WORKDIR $HOME/app

# --- Cài đặt dependency hệ thống ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# --- Tạo User mới (Bắt buộc để tránh lỗi permission trên HF) ---
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

# --- Copy requirements ---
COPY --chown=user requirements.txt .

# --- Cài đặt Python packages ---
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --- Copy toàn bộ source code ---
COPY --chown=user . .

# --- Tạo thư mục và đảm bảo quyền ghi ---
RUN mkdir -p data vectorstore/db_faiss

# --- Port mặc định ---
EXPOSE 7860

# --- Lệnh khởi động ---
# Nếu main:app là FastAPI, dùng uvicorn. 
# Nếu chỉ là script Gradio bình thường thì dùng: CMD ["python", "main.py"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]