
<script setup>
import { ref } from 'vue'

const question = ref('')

const suggestions = [
  {
    icon: '⌕',
    title: '查找文档内容',
    description: '从知识库中查找相关资料'
  },
  {
    icon: '▤',
    title: '总结专业资料',
    description: '快速提炼文档中的核心内容'
  },
  {
    icon: '✧',
    title: '解释专业概念',
    description: '用通俗的语言理解专业知识'
  }
]

function useSuggestion(title) {
  const prompts = {
    '查找文档内容': '请帮我从知识库中查找相关资料：',
    '总结专业资料': '请帮我总结这份专业资料的核心内容：',
    '解释专业概念': '请用通俗易懂的语言解释这个专业概念：'
  }

  question.value = prompts[title] || ''
}

function sendQuestion() {
  if (!question.value.trim()) return

  // 当前还没有连接后端问答接口
  // 后续会在这里调用 Python 后端的 RAG 问答 API
  window.alert('AI 问答服务尚未连接，后续完成后端接口后即可使用。')
}
</script>

<template>
  <div class="chat-page">
    <div class="welcome-area">
      <div class="welcome-logo">
        <span>✧</span>
      </div>

      <div class="welcome-label">LOCAL KNOWLEDGE ASSISTANT</div>

      <h1>你好，欢迎使用 <span>LocalKnowledgeAI</span></h1>

      <p class="welcome-description">
        你的本地知识库 AI 助手。导入专业资料，让 AI 帮你理解、检索和整理知识。
      </p>

      <div class="suggestion-grid">
        <button
          v-for="item in suggestions"
          :key="item.title"
          class="suggestion-card"
          @click="useSuggestion(item.title)"
        >
          <div class="suggestion-icon">{{ item.icon }}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ item.title }}</div>
            <div class="suggestion-description">{{ item.description }}</div>
          </div>
          <span class="suggestion-arrow">→</span>
        </button>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="chat-input-box">
        <textarea
          v-model="question"
          placeholder="输入你想了解的问题..."
          rows="2"
          @keydown.enter.exact.prevent="sendQuestion"
        ></textarea>

        <div class="input-toolbar">
          <div class="input-hint">
            <span class="hint-dot"></span>
            本地知识库 · 离线问答
          </div>

          <button
            class="send-button"
            :disabled="!question.trim()"
            @click="sendQuestion"
          >
            发送
            <span>↑</span>
          </button>
        </div>
      </div>

      <div class="input-tip">
        AI 生成的内容可能存在误差，请结合原始资料进行核对。
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  width: 100%;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 30px 30px;
}

.welcome-area {
  display: flex;
  width: 100%;
  max-width: 780px;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.welcome-logo {
  display: flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border: 1px solid #414b73;
  border-radius: 18px;
  background: linear-gradient(145deg, #303b61, #242b43);
  color: #a9b8ff;
  font-size: 30px;
  box-shadow: 0 8px 35px #647cff18;
}

.welcome-label {
  margin-bottom: 15px;
  color: #818ebd;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
}

.welcome-area h1 {
  margin: 0;
  color: #e9eaf0;
  font-size: 27px;
  font-weight: 650;
  letter-spacing: -0.8px;
}

.welcome-area h1 span {
  color: #9aabff;
}

.welcome-description {
  max-width: 560px;
  margin: 15px 0 38px;
  color: #9298a7;
  font-size: 13px;
  line-height: 1.8;
}

.suggestion-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.suggestion-card {
  display: flex;
  min-height: 112px;
  align-items: flex-start;
  gap: 11px;
  padding: 17px 13px;
  border: 1px solid #303440;
  border-radius: 10px;
  background: #20232c;
  color: #e3e5ec;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  border-color: #56658f;
  background: #252a38;
}

.suggestion-icon {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #303750;
  color: #aab8ff;
  font-size: 18px;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  margin: 2px 0 8px;
  color: #e2e4eb;
  font-size: 12px;
  font-weight: 600;
}

.suggestion-description {
  color: #858b9a;
  font-size: 10px;
  line-height: 1.6;
}

.suggestion-arrow {
  color: #69738f;
  font-size: 14px;
}

.chat-input-area {
  width: 100%;
  max-width: 780px;
  margin-top: 55px;
}

.chat-input-box {
  padding: 15px 17px 12px;
  border: 1px solid #3a3f4d;
  border-radius: 12px;
  background: #222630;
  transition: border-color 0.2s;
}

.chat-input-box:focus-within {
  border-color: #687bbd;
}

.chat-input-box textarea {
  display: block;
  width: 100%;
  min-height: 52px;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e8eaf0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.7;
}

.chat-input-box textarea::placeholder {
  color: #727988;
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7f8796;
  font-size: 10px;
}

.hint-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #43c98b;
}

.send-button {
  display: flex;
  height: 32px;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  border: 0;
  border-radius: 7px;
  background: #6579dc;
  color: white;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #788cf0;
}

.send-button:disabled {
  background: #3a4051;
  color: #777f91;
  cursor: not-allowed;
}

.send-button span {
  font-size: 16px;
}

.input-tip {
  margin-top: 12px;
  color: #666d7b;
  font-size: 10px;
  text-align: center;
}

@media (max-width: 900px) {
  .suggestion-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-card {
    min-height: 75px;
  }
}
</style>
