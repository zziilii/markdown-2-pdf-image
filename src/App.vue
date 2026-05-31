<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import Toolbar from './components/Toolbar.vue'
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'
import { exportToPdf, exportToPdfBitmap, exportToImage } from './utils/exportPdf.js'
import { DEFAULT_CONTENT } from './utils/defaultContent.js'

// ── 偏好持久化 ────────────────────────────────────────
const PREFS_KEY = 'md2pdf-prefs'

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePrefs(patch) {
  try {
    const prev = loadPrefs()
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prev, ...patch }))
  } catch {}
}

// ── 编辑器主题 ────────────────────────────────────────
const p = loadPrefs()
const isDark = ref(p.isDark ?? false)

watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  savePrefs({ isDark: dark })
})

// 初始化 html data-theme
document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')

function toggleTheme() {
  isDark.value = !isDark.value
}

// ── Markdown 内容 ─────────────────────────────────────
const markdownText = ref(DEFAULT_CONTENT)

// ── 文件名（自动从标题提取） ──────────────────────────
const FALLBACK_FILENAME = 'Markdown 转 PDF'

function cleanFilename(name) {
  return (name || FALLBACK_FILENAME)
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || FALLBACK_FILENAME
}

const filename = ref(cleanFilename(extractHeading(DEFAULT_CONTENT)))
const filenameManuallySet = ref(false)

function extractHeading(md) {
  const match = md.match(/^#{1,6}\s+(.+)$/m)
  if (!match) return null
  return match[1]
    .replace(/[*_`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

watch(markdownText, (md) => {
  if (filenameManuallySet.value) return
  const heading = extractHeading(md)
  if (heading) filename.value = cleanFilename(heading)
})

function onFilenameInput(val) {
  filename.value = val
  filenameManuallySet.value = true
}

function onImportFile(content) {
  filenameManuallySet.value = false
  markdownText.value = content
}

// ── PDF 导出选项（持久化） ────────────────────────────
const pdfFormat     = ref(p.pdfFormat     ?? 'a4')
const pdfTheme      = ref(p.pdfTheme      ?? 'light')
const pdfMode       = ref(p.pdfMode       ?? 'vector')  // 'vector' | 'bitmap'
const pdfSinglePage = ref(p.pdfSinglePage ?? false)     // 是否不分页
const imageScale    = ref(p.imageScale    ?? 2)         // 长图像素倍率 1/2/3

watch(pdfFormat,     (v) => savePrefs({ pdfFormat:     v }))
watch(pdfTheme,      (v) => savePrefs({ pdfTheme:      v }))
watch(pdfMode,       (v) => savePrefs({ pdfMode:       v }))
watch(pdfSinglePage, (v) => savePrefs({ pdfSinglePage: v }))
watch(imageScale,    (v) => savePrefs({ imageScale:    v }))

// ── 导出逻辑 ─────────────────────────────────────────
const previewComp    = ref(null)
const exporting      = ref(false)
const exportingImage = ref(false)

async function waitReady() {
  await nextTick()
  await new Promise((r) => setTimeout(r, 400))
}

async function onExportPdf() {
  if (exporting.value) return
  exporting.value = true
  try {
    await waitReady()
    const el = previewComp.value?.previewRef
    if (!el) return
    const name = cleanFilename(filename.value)
    if (pdfMode.value === 'bitmap') {
      await exportToPdfBitmap(el, name, pdfFormat.value, pdfTheme.value, pdfSinglePage.value)
    } else {
      exportToPdf(el, name, pdfFormat.value, pdfTheme.value, pdfSinglePage.value)
    }
  } catch (e) {
    console.error('[exportPdf]', e)
    alert('PDF 导出失败，请查看控制台。')
  } finally {
    exporting.value = false
  }
}

async function onExportImage() {
  if (exportingImage.value) return
  exportingImage.value = true
  try {
    await waitReady()
    const el = previewComp.value?.previewRef
    if (!el) return
    await exportToImage(el, cleanFilename(filename.value), pdfFormat.value, pdfTheme.value, imageScale.value)
  } catch (e) {
    console.error('[exportImage]', e)
    alert('长图导出失败，请查看控制台。')
  } finally {
    exportingImage.value = false
  }
}

// ── 拖拽分栏 ─────────────────────────────────────────
const splitPercent = ref(50)
const isDragging   = ref(false)
const containerRef = ref(null)

function onDividerMouseDown(e) {
  isDragging.value = true
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  e.preventDefault()
}

function onMouseMove(e) {
  if (!isDragging.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  splitPercent.value = Math.min(Math.max(pct, 20), 80)
}

function onMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="app-container" :class="{ dragging: isDragging }">
    <Toolbar
      :is-dark="isDark"
      :exporting="exporting"
      :exporting-image="exportingImage"
      :filename="filename"
      :pdf-format="pdfFormat"
      :pdf-theme="pdfTheme"
      :pdf-mode="pdfMode"
      :pdf-single-page="pdfSinglePage"
      :image-scale="imageScale"
      @toggle-theme="toggleTheme"
      @import-file="onImportFile"
      @export-pdf="onExportPdf"
      @export-image="onExportImage"
      @update:filename="onFilenameInput"
      @update:pdf-format="pdfFormat = $event"
      @update:pdf-theme="pdfTheme = $event"
      @update:pdf-mode="pdfMode = $event"
      @update:pdf-single-page="pdfSinglePage = $event"
      @update:image-scale="imageScale = $event"
    />

    <div class="workspace" ref="containerRef">
      <div class="pane" :style="{ width: splitPercent + '%' }">
        <Editor v-model="markdownText" />
      </div>

      <div class="divider" @mousedown="onDividerMouseDown" title="拖拽调整宽度">
        <div class="divider-handle" />
      </div>

      <div class="pane" :style="{ width: (100 - splitPercent) + '%' }">
        <Preview
          ref="previewComp"
          :content="markdownText"
          :is-dark="isDark"
          :pdf-theme="pdfTheme"
          :pdf-format="pdfFormat"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-base);
}

.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.pane {
  flex-shrink: 0;
  overflow: hidden;
  height: 100%;
}

.divider {
  width: 5px;
  flex-shrink: 0;
  cursor: col-resize;
  background: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  z-index: 10;
}

.divider:hover,
.dragging .divider {
  background: var(--accent);
}

.divider-handle {
  width: 2px;
  height: 28px;
  background: currentColor;
  border-radius: 2px;
  opacity: 0.35;
}

.app-container.dragging {
  user-select: none;
  cursor: col-resize;
}
</style>
