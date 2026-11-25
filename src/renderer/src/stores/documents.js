
import { ref } from 'vue'

// 所有已导入的文档
export const documents = ref([])

// 正在导入状态
export const importing = ref(false)

// 后端接口地址
const API_BASE_URL = 'http://127.0.0.1:8000/api/documents'

// 格式化文件大小
export function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// 获取文档列表
export async function fetchDocuments() {
  const response = await fetch(API_BASE_URL)

  if (!response.ok) {
    throw new Error('获取文档列表失败')
  }

  const data = await response.json()

  documents.value = data.map(item => ({
    id: item.id,
    name: item.name,
    extension: item.extension,
    size: item.size,
    path: item.path,
    knowledgeBaseId: item.knowledge_base_id,
    status: item.status,
    importedAt: item.imported_at
  }))

  return documents.value
}

// 导入文档并保存到数据库
export async function addDocuments(newFiles, knowledgeBaseId = null) {
  for (const file of newFiles) {
    const document = {
      id: file.id,
      name: file.name,
      extension: file.extension,
      size: file.size,
      path: file.path,
      knowledge_base_id: knowledgeBaseId,
      status: '待解析',
      imported_at: file.importedAt
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || `保存文档失败：${file.name}`)
    }
  }

  // 保存成功后重新获取数据库中的完整列表
  await fetchDocuments()

  return documents.value
}

// 删除数据库中的文档记录
export async function removeDocumentRecord(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.detail || '删除文档记录失败')
  }

  await fetchDocuments()

  return result
}
