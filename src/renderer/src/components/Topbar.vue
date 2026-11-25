
<script setup>
defineProps({
  title: {
    type: String,
    default: 'AI 问答'
  }
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <div class="breadcrumb">
        <span>工作空间</span>
        <span class="breadcrumb-separator">/</span>
        <span class="current-title">{{ title }}</span>
      </div>
    </div>

    <div class="topbar-right">
      <div class="connection-status">
        <span class="connection-dot"></span>
        本地环境
      </div>

      <div class="user-avatar">U</div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  height: 64px;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid #292c35;
  background: #1b1e26;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #858b9a;
  font-size: 12px;
}

.breadcrumb-separator {
  color: #555b68;
}

.current-title {
  color: #e5e7ed;
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #a2a8b5;
  font-size: 11px;
}

.connection-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #43c98b;
}

.user-avatar {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid #414654;
  border-radius: 50%;
  background: #2b3040;
  color: #c0caff;
  font-size: 12px;
  font-weight: 600;
}
</style>
