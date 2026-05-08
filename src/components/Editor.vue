<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

// Tab 键插入 2 个空格
function onKeyDown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const ta = textareaRef.value
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const value = ta.value
    const newValue = value.substring(0, start) + '  ' + value.substring(end)
    emit('update:modelValue', newValue)
    nextTick(() => {
      ta.selectionStart = ta.selectionEnd = start + 2
    })
  }
}

// 自动同步高度（不限制滚动，保留 textarea 原生行为）
onMounted(() => {
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="editor-pane">
    <div class="pane-header">
      <span>编辑器</span>
    </div>
    <textarea
      ref="textareaRef"
      class="editor-textarea"
      :value="modelValue"
      @input="onInput"
      @keydown="onKeyDown"
      placeholder="在此输入 Markdown..."
      spellcheck="false"
      autocorrect="off"
      autocapitalize="off"
    />
  </div>
</template>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.pane-header {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  background: var(--pane-header-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  user-select: none;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 20px;
  border: none;
  outline: none;
  resize: none;
  background: var(--editor-bg);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.7;
  tab-size: 2;
  box-sizing: border-box;
}

.editor-textarea::placeholder {
  color: var(--text-muted);
}
</style>
