
<script setup>
import { ref, computed, onMounted } from 'vue'
import { knowledgeBases } from '../stores/knowledge.js'
import {
  documents,
  importing,
  formatFileSize,
  addDocuments,
  removeDocumentRecord,
  fetchDocuments
} from '../stores/documents.js'

const searchKeyword = ref('')
const selectedKnowledgeBase = ref('all')
const errorMessage = ref('')

onMounted(async() => {
  try {
    await fetchDocuments()
  } catch (error) {
    console.error('获取文档列表失败：', error)
    errorMessage.value = '获取文档列表失败，请重试'
  }
})
const filteredDocuments = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return documents.value.filter(file => {
    const matchesKeyword = !keyword ||
      file.name.toLowerCase().includes(keyword)

    const matchesKnowledgeBase =
      selectedKnowledgeBase.value === 'all' ||
      (selectedKnowledgeBase.value === 'unassigned'
        ? !file.knowledgeBaseId
        : file.knowledgeBaseId === selectedKnowledgeBase.value)

    return matchesKeyword && matchesKnowledgeBase
  })
})

function getKnowledgeBaseName(id) {
  if (!id) return '未关联知识库'

  const item = knowledgeBases.value.find(kb => kb.id === id)
  return item ? item.name : '知识库已不存在'
}

function formatDate(value) {
  if (!value) return '-'

  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 调用 Electron 主进程选择并导入文件
async function handleImport() {
  if (importing.value) return

  errorMessage.value = ''
  importing.value = true

  try {
    if (!window.api?.selectAndImportDocuments) {
      throw new Error('无法连接 Electron 文件导入接口')
    }

    const result = await window.api.selectAndImportDocuments()

    if (!result.success) {
      throw new Error(result.message || '文件导入失败')
    }

    if (result.canceled || !result.files?.length) return

    await addDocuments(result.files)
  } catch (error) {
    console.error('文档导入失败：', error)
    errorMessage.value = error.message || '文档导入失败，请重试'
  } finally {
    importing.value = false
  }
}

// 删除文档
async function handleDelete(file) {
  const confirmed = window.confirm(
    `确定删除文档「${file.name}」吗？这也会删除应用保存的本地副本。`
  )

  if (!confirmed) return

  try {
    const result = await window.api.deleteImportedDocument(file.id)

    if (!result.success) {
      throw new Error(result.message || '删除文件失败')
    }
    await removeDocumentRecord(file.id)
  } catch (error) {
    console.error('删除文档失败：', error)
    window.alert(error.message || '删除失败，请重试')
  }
}
</script>

<template>
  <div class="documents-page">
    <div class="page-heading">
      <div>
        <h1>文档管理</h1>
        <p>统一管理导入到本地知识库的专业资料</p>
      </div>

      <button
        class="primary-button"
        :disabled="importing"
        @click="handleImport"
      >
        <span>＋</span>
        {{ importing ? '正在导入...' : '导入文档' }}
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="document-stats">
      <div class="stat-card">
        <div class="stat-label">文档总数</div>
        <div class="stat-value">{{ documents.length }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">已占用空间</div>
        <div class="stat-value">
          {{ formatFileSize(documents.reduce((sum, file) => sum + file.size, 0)) }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">关联知识库</div>
        <div class="stat-value">{{ knowledgeBases.length }}</div>
      </div>
    </div>

    <div class="document-toolbar">
      <div class="search-box">
        <span>⌕</span>
        <input
          v-model="searchKeyword"
          placeholder="搜索文档名称..."
        />
      </div>

      <select v-model="selectedKnowledgeBase" class="filter-select">
        <option value="all">全部文档</option>
        <option value="unassigned">未关联知识库</option>
        <option
          v-for="item in knowledgeBases"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </option>
      </select>
    </div>

    <div class="document-table">
      <div class="table-header">
        <span class="file-column">文件名称</span>
        <span class="format-column">格式</span>
        <span class="size-column">大小</span>
        <span class="knowledge-column">所属知识库</span>
        <span class="date-column">导入时间</span>
        <span class="action-column">操作</span>
      </div>

      <div
        v-for="file in filteredDocuments"
        :key="file.id"
        class="table-row"
      >
        <div class="file-column file-info">
          <div class="file-icon" :class="file.extension.replace('.', '')">
            {{ file.extension.replace('.', '').toUpperCase() }}
          </div>

          <div class="file-name" :title="file.name">
            {{ file.name }}
          </div>
        </div>

        <div class="format-column">
          {{ file.extension.replace('.', '').toUpperCase() }}
        </div>

        <div class="size-column">
          {{ formatFileSize(file.size) }}
        </div>

        <div class="knowledge-column knowledge-name">
          {{ getKnowledgeBaseName(file.knowledgeBaseId) }}
        </div>

        <div class="date-column date-text">
          {{ formatDate(file.importedAt) }}
        </div>

        <div class="action-column">
          <button
            class="delete-button"
            title="删除文档"
            @click="handleDelete(file)"
          >
            删除
          </button>
        </div>
      </div>

      <div v-if="filteredDocuments.length === 0" class="empty-state">
        <div class="empty-icon">▧</div>
        <h3>
          {{ searchKeyword ? '没有找到相关文档' : '还没有导入文档' }}
        </h3>
        <p>
          {{
            searchKeyword
              ? '请尝试更换搜索关键词'
              : '点击右上角的导入文档，选择电脑中的专业资料'
          }}
        </p>
        <button
          v-if="!searchKeyword && documents.length === 0"
          class="primary-button"
          @click="handleImport"
        >
          ＋ 导入第一个文档
        </button>
      </div>
    </div>

    <div class="supported-formats">
      支持格式：PDF、DOC、DOCX、XLS、XLSX、CSV、TXT
    </div>
  </div>
</template>

<style scoped>
.documents-page {
  width: 100%;
  min-height: 100%;
  padding: 30px 34px;
  color: #e8eaf0;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.page-heading h1 {
  margin: 0;
  color: #e9eaf0;
  font-size: 23px;
  font-weight: 650;
}

.page-heading p {
  margin: 9px 0 0;
  color: #858b9a;
  font-size: 12px;
}

.primary-button {
  display: inline-flex;
  height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 15px;
  border: 0;
  border-radius: 7px;
  background: #6579dc;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.primary-button:hover:not(:disabled) {
  background: #788cf0;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.primary-button span {
  font-size: 17px;
}

.error-message {
  padding: 12px 15px;
  margin-bottom: 18px;
  border: 1px solid #70434a;
  border-radius: 7px;
  background: #38272c;
  color: #f0a0a0;
  font-size: 12px;
}

.document-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 17px 19px;
  border: 1px solid #303440;
  border-radius: 9px;
  background: #20232c;
}

.stat-label {
  margin-bottom: 12px;
  color: #858b9a;
  font-size: 11px;
}

.stat-value {
  color: #e8eaf0;
  font-size: 21px;
  font-weight: 600;
}

.document-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
}

.search-box {
  display: flex;
  width: 330px;
  height: 38px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid #343946;
  border-radius: 7px;
  background: #20232c;
  color: #858b9a;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e8eaf0;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #727988;
}

.filter-select {
  height: 38px;
  min-width: 180px;
  padding: 0 10px;
  border: 1px solid #343946;
  border-radius: 7px;
  outline: 0;
  background: #20232c;
  color: #cbd0dc;
  font-size: 11px;
}

.document-table {
  overflow: hidden;
  border: 1px solid #303440;
  border-radius: 9px;
  background: #20232c;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: minmax(180px, 2.2fr) 0.7fr 0.8fr minmax(130px, 1.3fr) minmax(145px, 1.2fr) 55px;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
}

.table-header {
  min-height: 45px;
  border-bottom: 1px solid #343946;
  background: #252933;
  color: #858b9a;
  font-size: 10px;
}

.table-row {
  min-height: 65px;
  border-bottom: 1px solid #303440;
  color: #b8bdc9;
  font-size: 11px;
}

.table-row:last-of-type {
  border-bottom: 0;
}

.file-info {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.file-icon {
  display: flex;
  width: 33px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #303750;
  color: #aab8ff;
  font-size: 8px;
  font-weight: 700;
}

.file-icon.pdf {
  background: #472e34;
  color: #f18e99;
}

.file-icon.doc,
.file-icon.docx {
  background: #293d57;
  color: #82b6f0;
}

.file-icon.xls,
.file-icon.xlsx,
.file-icon.csv {
  background: #294437;
  color: #83d2a6;
}

.file-name {
  overflow: hidden;
  color: #e0e3eb;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-name,
.date-text {
  overflow: hidden;
  color: #8f96a6;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-button {
  padding: 6px 8px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #dc8585;
  font-size: 11px;
  cursor: pointer;
}

.delete-button:hover {
  background: #3c2b31;
}

.empty-state {
  display: flex;
  min-height: 310px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

.empty-icon {
  display: flex;
  width: 55px;
  height: 55px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 1px solid #353b4b;
  border-radius: 14px;
  background: #252a38;
  color: #9eafff;
  font-size: 24px;
}

.empty-state h3 {
  margin: 0;
  color: #dfe2eb;
  font-size: 14px;
}

.empty-state p {
  margin: 10px 0 18px;
  color: #858b9a;
  font-size: 11px;
}

.supported-formats {
  margin-top: 14px;
  color: #6f7787;
  font-size: 10px;
}

@media (max-width: 1000px) {
  .documents-page {
    padding: 22px 18px;
  }

  .document-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 850px;
  }
}
</style>
