"""
backend/main.py
FastAPI server tích hợp RAG (LangChain + FAISS + Groq)
Cung cấp API cho chatbox tư vấn tuyển sinh BK HCM
"""

import os
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# ── LangChain imports ──────────────────────────────────────────────────────────
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# ── Cấu hình ──────────────────────────────────────────────────────────────────
load_dotenv()

BASE_DIR       = Path(__file__).parent
DATA_DIR       = BASE_DIR / "data"       # Thư mục chứa PDF
DB_FAISS_PATH  = BASE_DIR / "vectorstore" / "db_faiss"
ADMIN_API_KEY  = os.getenv("ADMIN_API_KEY", "bkfc_admin_2026")  # Đặt trong .env

# Tạo thư mục nếu chưa có
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FAISS_PATH.parent.mkdir(parents=True, exist_ok=True)

# ── Separators cho text splitter ──────────────────────────────────────────────
MARKDOWN_SEPARATORS = [
    "\n#{1,6} ", "```\n", "\n\\*\\*\\*+\n",
    "\n---+\n", "\n___+\n", "\n\n", "\n", " ", ""
]

# ── Global state ───────────────────────────────────────────────────────────────
vectorstore = None   # FAISS vectorstore
rag_chain   = None   # RAG chain
embeddings  = None   # Embedding model


# ==============================================================================
# KHỞI TẠO EMBEDDING + RAG CHAIN
# ==============================================================================
def get_embeddings():
    """Khởi tạo embedding model (chạy 1 lần, tái sử dụng)"""
    global embeddings
    if embeddings is None:
        print("🔄 Đang tải Embedding model...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
    return embeddings


def load_or_create_vectorstore():
    """Tải FAISS từ ổ cứng hoặc tạo mới nếu chưa có"""
    global vectorstore
    emb = get_embeddings()

    if DB_FAISS_PATH.exists():
        print("⚡ Đang tải Vector Database từ ổ cứng...")
        vectorstore = FAISS.load_local(
            str(DB_FAISS_PATH),
            emb,
            allow_dangerous_deserialization=True
        )
    else:
        print("ℹ️  Chưa có Vector DB. Upload PDF qua Admin Panel để tạo.")
        vectorstore = None


def rebuild_vectorstore():
    """Xây dựng lại FAISS từ các file PDF trong thư mục data/"""
    global vectorstore, rag_chain
    emb = get_embeddings()

    pdf_files = list(DATA_DIR.glob("**/*.pdf"))
    if not pdf_files:
        raise ValueError("Chưa có file PDF nào trong thư mục data/")

    print(f"🔄 Đang xử lý {len(pdf_files)} file PDF...")
    loader = DirectoryLoader(
        path=str(DATA_DIR),
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=True,
    )
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=MARKDOWN_SEPARATORS,
    )
    splits = splitter.split_documents(docs)

    # Xóa DB cũ nếu có
    if DB_FAISS_PATH.exists():
        shutil.rmtree(DB_FAISS_PATH)

    vectorstore = FAISS.from_documents(
        documents=splits,
        embedding=emb,
        distance_strategy=DistanceStrategy.COSINE,
    )
    vectorstore.save_local(str(DB_FAISS_PATH))
    print(f"✅ Đã tạo Vector DB với {len(splits)} chunks từ {len(pdf_files)} PDF")

    # Cập nhật lại chain
    setup_rag_chain()


def setup_rag_chain():
    """Thiết lập RAG chain sau khi vectorstore sẵn sàng"""
    global rag_chain, vectorstore

    if vectorstore is None:
        rag_chain = None
        return

    # Retriever
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )

    # Prompt
    template = (
        "Bạn là Chuyên gia Tư vấn Tuyển sinh thông minh và tận tâm của "
        "Trường Đại học Bách khoa - ĐHQG-HCM (HCMUT).\n"
        "Nhiệm vụ của bạn là hỗ trợ thí sinh và phụ huynh giải đáp các thắc mắc "
        "về tuyển sinh dựa trên dữ liệu chính thống.\n\n"

        "--- QUY TẮC ỨNG XỬ ---\n"
        "1) THÔNG TIN CHÍNH XÁC: Chỉ sử dụng thông tin trong phần 'Ngữ cảnh' bên dưới.\n"
        "2) KHI KHÔNG CÓ DỮ LIỆU: Trả lời: 'Hiện tại hệ thống chưa cập nhật thông tin "
        "chi tiết. Bạn vui lòng liên hệ Phòng Đào tạo hoặc website tuyển sinh.'\n"
        "3) PHONG CÁCH: Lịch sự, chuyên nghiệp, gọi người hỏi là Bạn, xưng là Ad.\n"
        "4) ĐỊNH DẠNG: Dùng bullet points cho danh sách. Câu trả lời HTML-safe.\n"
        "5) ĐỘ DÀI: Ngắn gọn, súc tích. Tối đa 300 từ.\n\n"

        "--- NGỮ CẢNH (CONTEXT) ---\n"
        "{context}\n\n"

        "--- LỊCH SỬ HỘI THOẠI ---\n"
        "{history}\n\n"

        "--- CÂU HỎI ---\n"
        "{question}\n\n"

        "Câu trả lời (dùng HTML đơn giản như <br>, <strong>, <ul><li> nếu cần):"
    )
    prompt = ChatPromptTemplate.from_template(template)

    # LLM (Groq)
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        groq_api_key=os.getenv("GROQ_API_KEY"),
    )

    # Chain
    rag_chain = (
        {
            "context":  retriever,
            "question": RunnablePassthrough(),
            "history":  RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    print("✅ RAG chain đã sẵn sàng")


# ==============================================================================
# FASTAPI APP
# ==============================================================================
app = FastAPI(
    title="BK Tuyển Sinh RAG API",
    description="API tư vấn tuyển sinh ĐH Bách Khoa HCM dùng RAG",
    version="1.0.0",
)

# CORS – cho phép frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # Thay bằng domain thật khi deploy production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ static files (frontend HTML/CSS/JS)
FRONTEND_DIR = BASE_DIR / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ==============================================================================
# PYDANTIC MODELS
# ==============================================================================
class ChatMessage(BaseModel):
    role: str       # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = []

class AdminAuthHeader(BaseModel):
    api_key: str


# ==============================================================================
# DEPENDENCY: Xác thực Admin
# ==============================================================================
def verify_admin_key(x_api_key: str = None):
    """Kiểm tra API key cho các endpoint admin"""
    from fastapi import Header
    return x_api_key


def require_admin(x_api_key: str = Depends(lambda: None)):
    """Trả về 401 nếu API key sai"""
    pass  # Logic kiểm tra key ở từng endpoint


# ==============================================================================
# STARTUP EVENT
# ==============================================================================
@app.on_event("startup")
async def startup_event():
    """Tải vectorstore khi server khởi động"""
    load_or_create_vectorstore()
    setup_rag_chain()
    print("🚀 BK RAG API đã khởi động!")


# ==============================================================================
# ENDPOINTS CÔNG KHAI
# ==============================================================================

@app.get("/")
async def root():
    """Health check"""
    return {"status": "ok", "service": "BK Tuyển Sinh RAG API", "version": "1.0.0"}


@app.get("/api/health")
async def health():
    """Kiểm tra trạng thái hệ thống"""
    return {
        "status": "ok",
        "vectorstore_ready": vectorstore is not None,
        "rag_chain_ready":   rag_chain   is not None,
        "pdf_count":         len(list(DATA_DIR.glob("**/*.pdf"))),
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint chat chính – nhận câu hỏi, trả lời qua RAG
    """
    if rag_chain is None:
        # Fallback khi chưa có vectorstore
        return ChatResponse(
            answer=(
                "Hệ thống đang được khởi tạo. Vui lòng liên hệ:<br>"
                "📞 Hotline: <strong>028 3864 8987</strong><br>"
                "📧 tuyensinh@hcmut.edu.vn"
            )
        )

    # Chuẩn bị lịch sử hội thoại
    history_text = ""
    if request.history:
        lines = []
        for msg in request.history[-6:]:  # Chỉ lấy 6 tin nhắn gần nhất
            prefix = "User" if msg.role == "user" else "Ad"
            lines.append(f"{prefix}: {msg.content}")
        history_text = "\n".join(lines)

    try:
        answer = rag_chain.invoke({
            "question": request.question,
            "history":  history_text,
        })
        return ChatResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi RAG chain: {str(e)}")


# ==============================================================================
# ENDPOINTS ADMIN (yêu cầu API key)
# ==============================================================================

@app.get("/api/admin/files")
async def list_files(x_api_key: str = None):
    """Liệt kê các file PDF đã upload"""
    # Kiểm tra API key
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ")

    files = []
    for f in DATA_DIR.glob("**/*.pdf"):
        files.append({
            "name":  f.name,
            "size":  f.stat().st_size,
            "path":  str(f.relative_to(BASE_DIR)),
        })
    return {"files": files, "total": len(files)}


@app.post("/api/admin/upload")
async def upload_pdf(
    files: List[UploadFile] = File(...),
    x_api_key: str = None,
):
    """
    Upload một hoặc nhiều file PDF vào thư mục data/
    Sau khi upload xong sẽ tự động rebuild vectorstore
    """
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ")

    uploaded = []
    errors   = []

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            errors.append(f"{file.filename}: Chỉ chấp nhận file PDF")
            continue

        save_path = DATA_DIR / file.filename
        try:
            content = await file.read()
            with open(save_path, "wb") as f:
                f.write(content)
            uploaded.append(file.filename)
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")

    # Rebuild vectorstore nếu có file mới
    if uploaded:
        try:
            rebuild_vectorstore()
        except Exception as e:
            return JSONResponse(status_code=500, content={
                "uploaded": uploaded,
                "errors":   errors + [f"Lỗi rebuild DB: {str(e)}"],
            })

    return {
        "uploaded": uploaded,
        "errors":   errors,
        "message":  f"Đã upload {len(uploaded)} file(s) và cập nhật Vector DB",
    }


@app.delete("/api/admin/files/{filename}")
async def delete_file(filename: str, x_api_key: str = None):
    """Xóa file PDF và rebuild vectorstore"""
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ")

    file_path = DATA_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File không tồn tại")

    file_path.unlink()

    # Rebuild lại DB
    try:
        pdf_files = list(DATA_DIR.glob("**/*.pdf"))
        if pdf_files:
            rebuild_vectorstore()
        else:
            # Xóa DB nếu không còn PDF nào
            if DB_FAISS_PATH.exists():
                shutil.rmtree(DB_FAISS_PATH)
            global vectorstore, rag_chain
            vectorstore = None
            rag_chain   = None
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return {"message": f"Đã xóa {filename} và cập nhật Vector DB"}


@app.post("/api/admin/rebuild")
async def manual_rebuild(x_api_key: str = None):
    """Rebuild vectorstore thủ công"""
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ")

    try:
        rebuild_vectorstore()
        return {"message": "Rebuild thành công!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
