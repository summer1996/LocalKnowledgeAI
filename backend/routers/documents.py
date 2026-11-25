
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from database.database import get_connection


router = APIRouter(
    prefix="/api/documents",
    tags=["文档管理"]
)


class DocumentCreate(BaseModel):
    id: str
    name: str
    extension: str
    size: int
    path: str
    knowledge_base_id: Optional[str] = None
    status: str = "待解析"
    imported_at: str


# 获取文档列表
@router.get("")
def get_documents():
    connection = get_connection()

    try:
        rows = connection.execute("""
            SELECT
                id,
                name,
                extension,
                size,
                path,
                knowledge_base_id,
                status,
                imported_at
            FROM documents
            ORDER BY imported_at DESC
        """).fetchall()

        return [dict(row) for row in rows]

    finally:
        connection.close()


# 保存导入的文档信息
@router.post("")
def create_document(data: DocumentCreate):
    if not data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="文档名称不能为空"
        )

    connection = get_connection()

    try:
        connection.execute("""
            INSERT INTO documents (
                id,
                name,
                extension,
                size,
                path,
                knowledge_base_id,
                status,
                imported_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.id,
            data.name.strip(),
            data.extension,
            data.size,
            data.path,
            data.knowledge_base_id,
            data.status,
            data.imported_at
        ))

        connection.commit()

        return {
            "success": True,
            "message": "文档信息保存成功"
        }

    except Exception as error:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"保存文档失败：{str(error)}"
        )

    finally:
        connection.close()


# 删除文档数据库记录
@router.delete("/{document_id}")
def delete_document(document_id: str):
    connection = get_connection()

    try:
        cursor = connection.execute("""
            DELETE FROM documents
            WHERE id = ?
        """, (document_id,))

        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="文档记录不存在"
            )

        return {
            "success": True,
            "message": "文档记录删除成功"
        }

    finally:
        connection.close()
