
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.documents import router as documents_router

from database.database import init_database
from routers.knowledge import router as knowledge_router


app = FastAPI(
    title="LocalKnowledgeAI",
    description="本地知识库 AI 助手后端服务",
    version="1.0.0"
)


# 配置跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_database()


# 注册知识库接口
app.include_router(knowledge_router)

# 注册文档管理接口
app.include_router(documents_router)
@app.get("/")
def read_root():
    return {
        "message": "LocalKnowledgeAI 后端运行成功！",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "后端服务正常"
    }
