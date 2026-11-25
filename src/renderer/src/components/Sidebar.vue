
<script setup>
defineProps({
  activePage: {
    type: String,
    default: 'chat'
  }
})

const emit = defineEmits(['select-page'])

const navItems = [
  { id: 'chat', label: 'AI 问答', icon: '✧' },
  { id: 'knowledge', label: '知识库', icon: '▤' },
  { id: 'documents', label: '文档管理', icon: '▧' },
  { id: 'settings', label: '系统设置', icon: '⚙' }
]

function selectPage(page) {
  emit('select-page', page)
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">L</div>
      <div class="brand-info">
        <div class="brand-name">LocalKnowledgeAI</div>
        <div class="brand-subtitle">LOCAL AI WORKSPACE</div>
      </div>
    </div>

    <div class="nav-section">
      <div class="section-label">工作空间</div>

      <nav class="nav-list">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activePage === item.id }"
          @click="selectPage(item.id)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="activePage === item.id" class="active-indicator"></span>
        </button>
      </nav>
    </div>

    <div class="sidebar-bottom">
      <div class="runtime-card">
        <div class="runtime-header">
          <span class="status-dot"></span>
          <span>本地运行模式</span>
        </div>
        <div class="runtime-description">
          数据存储在本地设备
        </div>
        <div class="runtime-tag">
          <span>●</span> 离线环境
        </div>
      </div>

      <div class="sidebar-footer">
        <span>LocalKnowledgeAI</span>
        <span>v1.0.0</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  width: 248px;
  min-width: 248px;
  height: 100%;
  flex-direction: column;
  padding: 24px 16px 16px;
  border-right: 1px solid #292c35;
  background: #1c1f27;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 42px;
}

.brand-logo {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #7186ff, #5268df);
  color: #fff;
  font-size: 21px;
  font-weight: 700;
}

.brand-name {
  color: #f0f1f5;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.3px;
}

.brand-subtitle {
  margin-top: 4px;
  color: #777e8e;
  font-size: 9px;
  letter-spacing: 1.1px;
}

.section-label {
  padding: 0 10px;
  margin-bottom: 12px;
  color: #777e8e;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  position: relative;
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  gap: 13px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #a3a8b6;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
  background: #272b35;
  color: #e8eaf0;
}

.nav-item.active {
  background: #2a3043;
  color: #9eafff;
}

.nav-icon {
  display: flex;
  width: 18px;
  justify-content: center;
  font-size: 17px;
}

.active-indicator {
  position: absolute;
  right: 10px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #8296ff;
}

.sidebar-bottom {
  margin-top: auto;
}

.runtime-card {
  padding: 14px;
  border: 1px solid #303440;
  border-radius: 10px;
  background: #222630;
}

.runtime-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d7dae3;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #43c98b;
  box-shadow: 0 0 8px #43c98b66;
}

.runtime-description {
  margin: 9px 0 12px;
  color: #858b9a;
  font-size: 11px;
}

.runtime-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 5px;
  background: #20352f;
  color: #67d7a5;
  font-size: 10px;
}

.runtime-tag span {
  font-size: 7px;
}

.sidebar-footer {
  display: flex;
  justify-content: space-between;
  padding: 18px 4px 0;
  color: #626978;
  font-size: 10px;
}
</style>
