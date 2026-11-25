
<script setup>
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import ChatPage from './views/ChatPage.vue'
import KnowledgePage from './views/KnowledgePage.vue'
import DocumentsPage from './views/DocumentsPage.vue'

const activePage = ref('chat')

const pageTitles = {
  chat: 'AI 问答',
  knowledge: '知识库',
  documents: '文档管理',
  settings: '系统设置'
}

const currentTitle = computed(() => {
  return pageTitles[activePage.value] || 'AI 问答'
})

function handlePageChange(page) {
  activePage.value = page
}
</script>

<template>
  <div class="app-shell">
    <Sidebar
      :active-page="activePage"
      @select-page="handlePageChange"
    />

    <main class="main-area">
      <Topbar :title="currentTitle" />

      <div class="page-container">
        <ChatPage v-if="activePage === 'chat'" />

        <KnowledgePage
          v-else-if="activePage === 'knowledge'"
        />
        <DocumentsPage
          v-else-if="activePage === 'documents'"
        />
        
        <div v-else class="placeholder-page">
          <div class="placeholder-icon">
            <span v-if="activePage === 'knowledge'">▤</span>
            <span v-else-if="activePage === 'documents'">▧</span>
            <span v-else>⚙</span>
          </div>

          <h2>{{ currentTitle }}</h2>
          <p>这个功能页面正在建设中，稍后会在这里实现。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: #17191f;
  color: #e8eaf0;
}

.main-area {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.page-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.placeholder-page {
  display: flex;
  height: 100%;
  min-height: 400px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b90a0;
}

.placeholder-icon {
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid #303440;
  border-radius: 18px;
  background: #20232c;
  color: #a5a9b8;
  font-size: 28px;
}

.placeholder-page h2 {
  margin: 0 0 10px;
  color: #e8eaf0;
  font-size: 20px;
  font-weight: 600;
}

.placeholder-page p {
  margin: 0;
  color: #858b9a;
  font-size: 13px;
}
</style>
