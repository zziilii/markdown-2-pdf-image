<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import mermaid from 'mermaid'
import { renderMarkdown } from '../utils/markdown.js'
import { PDF_THEMES, PDF_FORMATS } from '../utils/exportPdf.js'

const props = defineProps({
  content:   { type: String,  default: '' },
  isDark:    { type: Boolean, default: false },
  pdfTheme:  { type: String,  default: 'light' },
  pdfFormat: { type: String,  default: 'a4' },
})

const previewRef = ref(null)
const htmlContent = ref('')

// PDF 主题 → Mermaid 主题映射
const MERMAID_THEME_MAP = {
  light:  'default',
  github: 'neutral',
  sepia:  'forest',
  dark:   'dark',
}

function getMermaidTheme() {
  return MERMAID_THEME_MAP[props.pdfTheme] ?? 'default'
}

function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: getMermaidTheme(),
    securityLevel: 'loose',
    fontFamily: 'inherit',
  })
}

initMermaid()

// 预览区根据 PDF 主题应用样式（内联 CSS 变量，覆盖根级变量）
const previewScrollStyle = computed(() => {
  const thm = PDF_THEMES[props.pdfTheme]?.vars
  return thm ? { background: thm.bg } : {}
})

const previewContentStyle = computed(() => {
  const thm = PDF_THEMES[props.pdfTheme]?.vars
  const fmt = PDF_FORMATS[props.pdfFormat]
  if (!thm) return {}
  return {
    // 覆盖 CSS 自定义属性，markdown-body 的所有样式均通过这些变量着色
    '--text-primary':      thm.text,
    '--text-secondary':    thm.textSub,
    '--border-color':      thm.border,
    '--code-bg':           thm.codeBg,
    '--blockquote-border': thm.quoteLeft,
    '--blockquote-bg':     thm.quoteBg,
    '--table-header-bg':   thm.tableHead,
    '--table-stripe-bg':   thm.tableStripe,
    '--link-color':        thm.link,
    '--hr-color':          thm.hr,
    // 直接颜色属性
    background: thm.bg,
    color:      thm.text,
    // 宽度跟随格式（min() 保证不超出可见区域）
    maxWidth: fmt ? `${fmt.contentPx}px` : '800px',
  }
})

// ── Mermaid 渲染 ─────────────────────────────────────────

async function renderMermaid() {
  await nextTick()
  const el = previewRef.value
  if (!el) return

  const nodes = el.querySelectorAll('pre.mermaid')
  if (!nodes.length) return

  nodes.forEach((node) => {
    if (node.dataset.processed === 'true') {
      const original = node.dataset.originalCode
      if (original) {
        node.innerHTML = original
        node.removeAttribute('data-processed')
      }
    }
  })

  try {
    await mermaid.run({ nodes: Array.from(nodes) })
  } catch (e) {
    console.warn('[Mermaid] render error:', e)
  }
}

async function update() {
  htmlContent.value = renderMarkdown(props.content)
  await renderMermaid()
}

watch(() => props.content, () => update(), { immediate: true })

// 主题切换时重新初始化 Mermaid 并重渲染
watch(() => props.pdfTheme, async () => {
  initMermaid()
  await update()
})

defineExpose({ previewRef })
</script>

<template>
  <div class="preview-pane">
    <div class="pane-header">
      <span>预览</span>
      <span class="pane-hint">{{ pdfFormat.toUpperCase() }} · {{ PDF_THEMES[pdfTheme]?.label }}</span>
    </div>
    <div class="preview-scroll" :style="previewScrollStyle">
      <div
        ref="previewRef"
        class="preview-content markdown-body"
        :style="previewContentStyle"
        v-html="htmlContent"
      />
    </div>
  </div>
</template>

<style scoped>
.preview-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.pane-hint {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.7;
  letter-spacing: 0;
  text-transform: none;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  transition: background 0.2s;
}

.preview-content {
  /* max-width 由 pdfFormat 通过 inline style 覆盖 */
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 40px;
  box-sizing: border-box;
  min-height: 100%;
  transition: background 0.2s, color 0.2s, max-width 0.2s;
}
</style>
