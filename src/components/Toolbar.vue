<script setup>
import { ref } from 'vue'
import { PDF_FORMATS, PDF_THEMES } from '../utils/exportPdf.js'

const props = defineProps({
  isDark:        Boolean,
  exporting:     Boolean,
  exportingImage:Boolean,
  filename:      String,
  pdfFormat:     String,
  pdfTheme:      String,
  pdfMode:       String,   // 'vector' | 'bitmap'
  pdfSinglePage: Boolean,  // 是否不分页（矢量/位图均支持）
  imageScale:    Number,   // 长图像素倍率：1 / 2 / 3
})

const emit = defineEmits([
  'toggle-theme', 'import-file', 'export-pdf', 'export-image',
  'update:filename', 'update:pdfFormat', 'update:pdfTheme',
  'update:pdfMode', 'update:pdfSinglePage', 'update:imageScale',
])

const fileInputRef = ref(null)

function onImportClick() {
  fileInputRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    emit('import-file', ev.target.result)
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <span class="toolbar-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        Markdown → PDF
      </span>
    </div>

    <div class="toolbar-right">
      <!-- 文件名输入 -->
      <input
        class="toolbar-input filename-input"
        type="text"
        placeholder="文件名"
        :value="filename"
        @input="emit('update:filename', $event.target.value)"
        title="导出文件名"
      />

      <!-- 不分页开关（矢量/位图均支持） -->
      <button
        class="btn btn-toggle"
        :class="{ active: pdfSinglePage }"
        :title="pdfSinglePage ? '当前：不分页（点击切换为分页）' : '当前：分页（点击切换为不分页）'"
        @click="emit('update:pdfSinglePage', !pdfSinglePage)"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="4" y1="12" x2="20" y2="12" stroke-dasharray="3 2"/>
        </svg>
        {{ pdfSinglePage ? '不分页' : '分页' }}
      </button>

      <!-- PDF 格式选择 -->
      <div class="select-wrapper" title="PDF 页面格式">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
        </svg>
        <select
          class="toolbar-select"
          :value="pdfFormat"
          @change="emit('update:pdfFormat', $event.target.value)"
        >
          <option v-for="(fmt, key) in PDF_FORMATS" :key="key" :value="key">
            {{ fmt.label }}
          </option>
        </select>
      </div>

      <!-- PDF 模式切换：矢量 / 位图 -->
      <div class="mode-toggle" title="PDF 模式">
        <button
          class="mode-btn"
          :class="{ active: pdfMode === 'vector' }"
          @click="emit('update:pdfMode', 'vector')"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="4 7 4 4 20 4 20 7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
          矢量
        </button>
        <button
          class="mode-btn"
          :class="{ active: pdfMode === 'bitmap' }"
          @click="emit('update:pdfMode', 'bitmap')"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          位图
        </button>
      </div>

      <!-- PDF 主题选择 -->
      <div class="select-wrapper" title="PDF 主题">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
        <select
          class="toolbar-select"
          :value="pdfTheme"
          @change="emit('update:pdfTheme', $event.target.value)"
        >
          <option v-for="(thm, key) in PDF_THEMES" :key="key" :value="key">
            {{ thm.label }}
          </option>
        </select>
      </div>

      <!-- 分隔线 -->
      <div class="toolbar-sep" />

      <!-- 导入 .md 文件 -->
      <button class="btn btn-secondary" @click="onImportClick" title="导入 .md 文件">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        导入
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept=".md,.markdown,.txt"
        style="display: none"
        @change="onFileChange"
      />

      <!-- 长图像素倍率 -->
      <div class="mode-toggle" title="长图像素倍率">
        <button v-for="s in [1, 2, 3]" :key="s"
          class="mode-btn"
          :class="{ active: imageScale === s }"
          @click="emit('update:imageScale', s)"
        >{{ s }}x</button>
      </div>

      <!-- 导出长图 PNG -->
      <button
        class="btn btn-secondary"
        :disabled="exportingImage"
        @click="emit('export-image')"
        title="导出为长图 PNG"
      >
        <svg v-if="!exportingImage" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <svg v-else class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        {{ exportingImage ? '生成中...' : '导出长图' }}
      </button>

      <!-- 导出 PDF -->
      <button
        class="btn btn-primary"
        :disabled="exporting"
        @click="emit('export-pdf')"
        title="导出为 PDF（文字可选中）"
      >
        <svg v-if="!exporting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <svg v-else class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        {{ exporting ? '打开中...' : '导出 PDF' }}
      </button>

      <!-- 明暗主题切换 -->
      <button class="btn btn-icon" @click="emit('toggle-theme')" :title="isDark ? '切换为亮色主题' : '切换为暗色主题'">
        <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: 50px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  gap: 8px;
  z-index: 100;
}

.toolbar-logo {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 2px;
}

/* 文件名输入 */
.toolbar-input {
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.toolbar-input:focus {
  border-color: var(--accent);
}

.filename-input {
  width: 130px;
}

/* PDF 模式切换 */
.mode-toggle {
  display: inline-flex;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 9px;
  border: none;
  background: var(--btn-secondary-bg);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}

.mode-btn + .mode-btn {
  border-left: 1px solid var(--border-color);
}

.mode-btn.active {
  background: var(--accent);
  color: #fff;
}

.mode-btn:not(.active):hover {
  background: var(--btn-secondary-hover);
  color: var(--text-primary);
}

/* Select 下拉 */
.select-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.select-wrapper:focus-within {
  border-color: var(--accent);
}

.toolbar-select {
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 11px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-secondary {
  background: var(--btn-secondary-bg);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--btn-secondary-hover);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-toggle {
  background: var(--btn-secondary-bg);
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.btn-toggle:hover {
  background: var(--btn-secondary-hover);
  color: var(--text-primary);
}

.btn-toggle.active {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  border-color: var(--accent);
}

.btn-icon {
  background: transparent;
  color: var(--text-secondary);
  width: 30px;
  padding: 0;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--btn-secondary-hover);
  color: var(--text-primary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
