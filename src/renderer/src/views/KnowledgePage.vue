
<script setup>
import { ref, computed, onMounted } from 'vue'

import {
  knowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
  fetchKnowledgeBases,
  knowledgeLoading
} from '../stores/knowledge.js'

// 搜索关键词
const searchKeyword = ref('')

// 创建弹窗
const showCreateModal = ref(false)
const newKnowledgeName = ref('')
const newKnowledgeDescription = ref('')

// 当前选中的知识库
const selectedKnowledge = ref(null)

// 搜索过滤
const filteredKnowledgeBases = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return knowledgeBases.value
  }

  return knowledgeBases.value.filter(item => {
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  })
})

// 页面加载时，从后端获取知识库
onMounted(async () => {
  try {
    await fetchKnowledgeBases()
  } catch (error) {
    window.alert('获取知识库失败：' + error.message)
  }
})

// 打开创建弹窗
function openCreateModal() {
  newKnowledgeName.value = ''
  newKnowledgeDescription.value = ''
  showCreateModal.value = true
}

// 创建知识库
async function handleCreate() {
  const name = newKnowledgeName.value.trim()

  if (!name) {
    window.alert('请输入知识库名称')
    return
  }

  const exists = knowledgeBases.value.some(
    item => item.name.toLowerCase() === name.toLowerCase()
  )

  if (exists) {
    window.alert('已经存在同名知识库，请更换名称')
    return
  }

  try {
    await createKnowledgeBase(name, newKnowledgeDescription.value)

    showCreateModal.value = false

    window.alert('知识库创建成功')
  } catch (error) {
    window.alert('创建知识库失败：' + error.message)
  }
}

// 删除知识库
async function handleDelete(item) {
  const confirmed = window.confirm(
    `确定要删除知识库「${item.name}」吗？`
  )

  if (!confirmed) return

  try {
    await deleteKnowledgeBase(item.id)

    if (selectedKnowledge.value?.id === item.id) {
      selectedKnowledge.value = null
    }

    window.alert('知识库删除成功')
  } catch (error) {
    window.alert('删除知识库失败：' + error.message)
  }
}

// 进入知识库详情
function openKnowledge(item) {
  selectedKnowledge.value = item
}

// 返回知识库列表
function backToList() {
  selectedKnowledge.value = null
}
</script>


<template>
  <div class="knowledge-page">
    <!-- 知识库列表 -->
    <template v-if="!selectedKnowledge">
      <div class="page-heading">
        <div>
          <h1>知识库</h1>
          <p>创建和管理你的本地专业知识库</p>
        </div>

        <button class="primary-button" @click="openCreateModal">
          <span>＋</span>
          新建知识库
        </button>
      </div>

      <div class="knowledge-toolbar">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索知识库名称或描述..."
          />
        </div>

        <div class="knowledge-count">
          共 {{ knowledgeBases.length }} 个知识库
        </div>
      </div>

      <div v-if="filteredKnowledgeBases.length" class="knowledge-grid">
        <div
          v-for="item in filteredKnowledgeBases"
          :key="item.id"
          class="knowledge-card"
        >
          <div class="card-top">
            <div class="knowledge-icon">▤</div>

            <button
              class="delete-button"
              title="删除知识库"
              @click="handleDelete(item)"
            >
              ×
            </button>
          </div>

          <div class="card-main" @click="openKnowledge(item)">
            <h3>{{ item.name }}</h3>

            <p class="knowledge-description">
              {{ item.description || '暂无描述' }}
            </p>

            <div class="knowledge-meta">
              <span>{{ item.documentCount }} 个文档</span>
              <span>创建于 {{ item.createdAt }}</span>
            </div>
          </div>

          <div class="card-bottom">
            <button class="enter-button" @click="openKnowledge(item)">
              进入知识库
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">▤</div>

        <h3>
          {{ searchKeyword ? '没有找到相关知识库' : '还没有知识库' }}
        </h3>

        <p>
          {{
            searchKeyword
              ? '试试更换搜索关键词'
              : '创建你的第一个知识库，开始整理专业资料'
          }}
        </p>

        <button
          v-if="!searchKeyword"
          class="primary-button"
          @click="openCreateModal"
        >
          ＋ 创建第一个知识库
        </button>
      </div>
    </template>

    <!-- 知识库详情 -->
    <template v-else>
      <div class="detail-heading">
        <button class="back-button" @click="backToList">
          ← 返回知识库
        </button>

        <div class="detail-title-row">
          <div class="detail-icon">▤</div>

          <div>
            <h1>{{ selectedKnowledge.name }}</h1>
            <p>{{ selectedKnowledge.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>

      <div class="detail-overview">
        <div class="overview-card">
          <div class="overview-label">文档数量</div>
          <div class="overview-value">
            {{ selectedKnowledge.documentCount }}
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-label">创建时间</div>
          <div class="overview-value date-value">
            {{ selectedKnowledge.createdAt }}
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-label">知识库状态</div>
          <div class="overview-value status-value">
            <span></span>
            已创建
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-heading">
          <div>
            <h2>知识库文档</h2>
            <p>这里将显示导入到当前知识库的文件</p>
          </div>
        </div>

        <div class="document-empty">
          <div class="empty-icon">▧</div>
          <h3>暂时还没有文档</h3>
          <p>下一步我们将实现文档上传和解析功能</p>
        </div>
      </div>
    </template>

    <!-- 创建知识库弹窗 -->
    <div
      v-if="showCreateModal"
      class="modal-mask"
      @click.self="showCreateModal = false"
    >
      <div class="create-modal">
        <div class="modal-heading">
          <div>
            <h2>新建知识库</h2>
            <p>创建一个空间，用来整理和检索专业资料</p>
          </div>

          <button
            class="modal-close"
            @click="showCreateModal = false"
          >
            ×
          </button>
        </div>

        <div class="form-group">
          <label>知识库名称 <span>*</span></label>

          <input
            v-model="newKnowledgeName"
            type="text"
            maxlength="40"
            placeholder="例如：计算机专业知识库"
            @keydown.enter="handleCreate"
          />
        </div>

        <div class="form-group">
          <label>知识库描述</label>

          <textarea
            v-model="newKnowledgeDescription"
            rows="4"
            maxlength="200"
            placeholder="简单介绍这个知识库的用途..."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button
            class="cancel-button"
            @click="showCreateModal = false"
          >
            取消
          </button>

          <button class="primary-button" @click="handleCreate">
            创建知识库
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-page {
  width: 100%;
  min-height: 100%;
  padding: 30px 34px;
  color: #e8eaf0;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-heading h1,
.detail-heading h1 {
  margin: 0;
  color: #e9eaf0;
  font-size: 23px;
  font-weight: 650;
}

.page-heading p,
.detail-heading p {
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
  transition: background 0.2s;
}

.primary-button:hover {
  background: #788cf0;
}

.primary-button span {
  font-size: 17px;
}

.knowledge-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
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
}

.search-icon {
  color: #858b9a;
  font-size: 19px;
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

.knowledge-count {
  color: #858b9a;
  font-size: 11px;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: 16px;
}

.knowledge-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #303440;
  border-radius: 10px;
  background: #20232c;
  transition: border-color 0.2s, transform 0.2s;
}

.knowledge-card:hover {
  transform: translateY(-2px);
  border-color: #515d83;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 17px;
}

.knowledge-icon,
.detail-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #303750;
  color: #aab8ff;
  font-size: 20px;
}

.delete-button,
.modal-close {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #777e8e;
  font-size: 20px;
  cursor: pointer;
}

.delete-button:hover,
.modal-close:hover {
  background: #38303a;
  color: #ef8585;
}

.card-main {
  cursor: pointer;
}

.card-main h3 {
  overflow: hidden;
  margin: 0 0 9px;
  color: #e6e8ef;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-description {
  display: -webkit-box;
  min-height: 36px;
  overflow: hidden;
  margin: 0;
  color: #858b9a;
  font-size: 11px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.knowledge-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 18px;
  color: #747b8a;
  font-size: 10px;
}

.card-bottom {
  padding-top: 14px;
  margin-top: 15px;
  border-top: 1px solid #303440;
}

.enter-button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border: 0;
  background: transparent;
  color: #aab8ff;
  font-size: 11px;
  cursor: pointer;
}

.enter-button:hover {
  color: #d0d8ff;
}

.empty-state,
.document-empty {
  display: flex;
  min-height: 350px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  display: flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  margin-bottom: 17px;
  border: 1px solid #353b4b;
  border-radius: 15px;
  background: #252a38;
  color: #9eafff;
  font-size: 25px;
}

.empty-state h3,
.document-empty h3 {
  margin: 0;
  color: #dfe2eb;
  font-size: 14px;
}

.empty-state p,
.document-empty p {
  margin: 10px 0 20px;
  color: #858b9a;
  font-size: 11px;
}

.detail-heading {
  margin-bottom: 28px;
}

.back-button {
  padding: 0;
  margin-bottom: 24px;
  border: 0;
  background: transparent;
  color: #9eafff;
  font-size: 12px;
  cursor: pointer;
}

.back-button:hover {
  color: #c7d0ff;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.detail-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.detail-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 30px;
}

.overview-card {
  padding: 18px;
  border: 1px solid #303440;
  border-radius: 9px;
  background: #20232c;
}

.overview-label {
  margin-bottom: 13px;
  color: #858b9a;
  font-size: 11px;
}

.overview-value {
  color: #e8eaf0;
  font-size: 22px;
  font-weight: 600;
}

.date-value {
  font-size: 16px;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #67d7a5;
  font-size: 14px;
}

.status-value span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #43c98b;
}

.detail-section {
  padding: 22px;
  border: 1px solid #303440;
  border-radius: 10px;
  background: #20232c;
}

.section-heading h2 {
  margin: 0;
  color: #e6e8ef;
  font-size: 15px;
}

.section-heading p {
  margin: 8px 0 0;
  color: #858b9a;
  font-size: 11px;
}

.document-empty {
  min-height: 260px;
}

.modal-mask {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #00000088;
  backdrop-filter: blur(3px);
}

.create-modal {
  width: 100%;
  max-width: 460px;
  padding: 24px;
  border: 1px solid #3b4150;
  border-radius: 12px;
  background: #242832;
  box-shadow: 0 20px 70px #00000055;
}

.modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 25px;
}

.modal-heading h2 {
  margin: 0;
  color: #e8eaf0;
  font-size: 17px;
}

.modal-heading p {
  margin: 8px 0 0;
  color: #858b9a;
  font-size: 11px;
}

.form-group {
  margin-bottom: 19px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: #cbd0dc;
  font-size: 12px;
}

.form-group label span {
  color: #ee8585;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #3b4150;
  border-radius: 7px;
  outline: 0;
  background: #1d2028;
  color: #e8eaf0;
  font-family: inherit;
  font-size: 12px;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #687bbd;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #687080;
}

.form-group textarea {
  resize: vertical;
  line-height: 1.7;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

.cancel-button {
  height: 38px;
  padding: 0 16px;
  border: 1px solid #414755;
  border-radius: 7px;
  background: transparent;
  color: #b5bac6;
  font-size: 12px;
  cursor: pointer;
}

.cancel-button:hover {
  background: #303541;
}

@media (max-width: 760px) {
  .knowledge-page {
    padding: 22px 18px;
  }

  .detail-overview {
    grid-template-columns: 1fr;
  }

  .knowledge-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }
}
</style>
