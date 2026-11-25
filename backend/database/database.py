
import sqlite3
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# 数据库存放目录
DATA_DIR = PROJECT_ROOT / "data"

# 数据库文件
DB_PATH = DATA_DIR / "app.db"


def get_connection():
    """获取数据库连接"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    # 启用外键约束
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def init_database():
    """初始化数据库和数据表"""

    connection = get_connection()

    try:
        # 知识库表
        connection.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_bases (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                created_at TEXT NOT NULL
            )
        """)

        # 文档表
        connection.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                extension TEXT,
                size INTEGER DEFAULT 0,
                path TEXT NOT NULL,
                knowledge_base_id TEXT,
                status TEXT DEFAULT '待解析',
                imported_at TEXT NOT NULL,
                FOREIGN KEY (knowledge_base_id)
                    REFERENCES knowledge_bases(id)
                    ON DELETE SET NULL
            )
        """)

        connection.commit()
        print("SQLite 数据库初始化成功！")
        print(f"数据库位置：{DB_PATH}")

    finally:
        connection.close()
