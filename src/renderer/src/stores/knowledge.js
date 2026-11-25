
import { ref } from 'vue'

// 知识库列表
export const knowledgeBases = ref([])

// 加载状态
export const knowledgeLoading = ref(false)

// 错误信息
export const knowledgeError = ref('')

// 后端接口地址
const API_BASE_URL = 'http://127.0.0.1:8000/api/knowledge-bases'


// 获取知识库列表
export async function fetchKnowledgeBases() {
  knowledgeLoading.value = true
  knowledgeError.value = ''

  try {
    const response = await fetch(API_BASE_URL)

    if (!response.ok) {
      throw new Error('获取知识库列表失败')
    }

    const data = await response.json()

    knowledgeBases.value = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      documentCount: 0,
      createdAt: item.created_at
    }))

    return knowledgeBases.value

  } catch (error) {
    knowledgeError.value = error.message
    console.error('获取知识库失败：', error)
    throw error

  } finally {
    knowledgeLoading.value = false
  }
}


// 创建知识库
export async function createKnowledgeBase(name, description = '') {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.trim(),
      description: description.trim()
    })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.detail || '创建知识库失败')
  }

  // 创建成功后重新获取列表
  await fetchKnowledgeBases()

  return result.data
}


// 删除知识库
export async function deleteKnowledgeBase(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.detail || '删除知识库失败')
  }

  // 删除成功后重新获取列表
  await fetchKnowledgeBases()

  return result
}
