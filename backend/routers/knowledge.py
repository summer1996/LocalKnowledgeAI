
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime

from database.database import get_connection

router = APIRouter(prefix="/api/knowledge-bases", tags=["知识库"])


# 接收前端传来的知识库数据
class KnowledgeBaseCreate(BaseModel):
    name: str
    description: str = ""


# 获取所有知识库
@router.get("")
def get_knowledge_bases():
    connection = get_connection()

    try:
        rows = connection.execute("""
            SELECT
                id,
                name,
                description,
                created_at
            FROM knowledge_bases
            ORDER BY created_at DESC
        """).fetchall()

        return [dict(row) for row in rows]

    finally:
        connection.close()


# 创建知识库
@router.post("")
def create_knowledge_base(data: KnowledgeBaseCreate):
    name = data.name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="知识库名称不能为空")

    connection = get_connection()

    try:
        knowledge_base = {
            "id": str(uuid4()),
            "name": name,
            "description": data.description.strip(),
            "created_at": datetime.now().isoformat(timespec="seconds")
        }

        connection.execute("""
            INSERT INTO knowledge_bases (
                id, name, description, created_at
            )
            VALUES (?, ?, ?, ?)
        """, (
            knowledge_base["id"],
            knowledge_base["name"],
            knowledge_base["description"],
            knowledge_base["created_at"]
        ))

        connection.commit()

        return {
            "success": True,
            "message": "知识库创建成功",
            "data": knowledge_base
        }

    finally:
        connection.close()


# 删除知识库
@router.delete("/{knowledge_base_id}")
def delete_knowledge_base(knowledge_base_id: str):
    connection = get_connection()

    try:
        cursor = connection.execute("""
            DELETE FROM knowledge_bases
            WHERE id = ?
        """, (knowledge_base_id,))

        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="知识库不存在")

        return {
            "success": True,
            "message": "知识库删除成功"
        }

    finally:
        connection.close()
