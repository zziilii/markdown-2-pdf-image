import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/** PDF 页面格式定义 */
export const PDF_FORMATS = {
  a4:     { label: 'A4 (210mm)',  widthMm: 210, heightMm: 297, contentPx: 780, paddingV: 48, paddingH: 56, fontSize: 15, marginV: '15mm', marginH: '18mm' },
  a5:     { label: 'A5 (148mm)',  widthMm: 148, heightMm: 210, contentPx: 550, paddingV: 36, paddingH: 40, fontSize: 13, marginV: '12mm', marginH: '14mm' },
  mobile: { label: '手机 (90mm)', widthMm: 90,  heightMm: 190, contentPx: 420, paddingV: 16, paddingH: 12, fontSize: 12, marginV: '5mm',  marginH: '4mm'  },
  letter: { label: 'Letter',      widthMm: 216, heightMm: 279, contentPx: 800, paddingV: 48, paddingH: 60, fontSize: 15, marginV: '15mm', marginH: '18mm' },
}

/** PDF / 长图 主题定义 */
export const PDF_THEMES = {
  light: {
    label: '亮色',
    vars: { bg:'#ffffff', text:'#1a1a1a', textSub:'#555555', border:'#dddddd', codeBg:'#f5f5f5',
            quoteLeft:'#4f46e5', quoteBg:'#f0f0ff', tableHead:'#f5f5f5', tableStripe:'#fafafa',
            link:'#4f46e5', hr:'#dddddd', inlineCode:'#e74c3c' },
  },
  github: {
    label: 'GitHub',
    vars: { bg:'#ffffff', text:'#24292f', textSub:'#57606a', border:'#d0d7de', codeBg:'#f6f8fa',
            quoteLeft:'#d0d7de', quoteBg:'#f6f8fa', tableHead:'#f6f8fa', tableStripe:'#ffffff',
            link:'#0969da', hr:'#d0d7de', inlineCode:'#cf222e' },
  },
  sepia: {
    label: '复古',
    vars: { bg:'#f4ede4', text:'#3b2f2f', textSub:'#6b5a4e', border:'#d5c5b5', codeBg:'#ebe0d5',
            quoteLeft:'#a0522d', quoteBg:'#ede4d8', tableHead:'#ebe0d5', tableStripe:'#f0e8dd',
            link:'#a0522d', hr:'#d5c5b5', inlineCode:'#a0522d' },
  },
  dark: {
    label: '暗色',
    vars: { bg:'#1e1e2e', text:'#cdd6f4', textSub:'#a6adc8', border:'#313244', codeBg:'#313244',
            quoteLeft:'#cba6f7', quoteBg:'#1e1e38', tableHead:'#24243e', tableStripe:'#1e1e38',
            link:'#89b4fa', hr:'#313244', inlineCode:'#f38ba8' },
  },
}

// ── 公共工具 ──────────────────────────────────────────────

/**
 * 构建离屏截图容器的 inline style 字符串
 * 关键：同时设置 CSS 自定义属性，使 markdown-body 样式正确响应主题颜色
 */
function buildOffscreenStyle(fmt, thm) {
  const c = thm.vars
  return [
    'position:fixed', 'top:-99999px', 'left:-99999px',
    `width:${fmt.contentPx}px`,
    `background:${c.bg}`, `color:${c.text}`,
    `padding:${fmt.paddingV}px ${fmt.paddingH}px`,
    'box-sizing:border-box',
    `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`,
    `font-size:${fmt.fontSize}px`, 'line-height:1.75',
    // CSS 自定义属性覆盖（内联 style 优先级最高，保证主题颜色生效）
    `--text-primary:${c.text}`,
    `--text-secondary:${c.textSub}`,
    `--border-color:${c.border}`,
    `--code-bg:${c.codeBg}`,
    `--blockquote-border:${c.quoteLeft}`,
    `--blockquote-bg:${c.quoteBg}`,
    `--table-header-bg:${c.tableHead}`,
    `--table-stripe-bg:${c.tableStripe}`,
    `--link-color:${c.link}`,
    `--hr-color:${c.hr}`,
  ].join(';')
}

/**
 * 将 sourceEl 克隆到离屏容器，截图后清理，返回 canvas
 */
async function screenshotEl(sourceEl, fmt, thm, scale) {
  const wrapper = document.createElement('div')
  wrapper.setAttribute('style', buildOffscreenStyle(fmt, thm))
  const clone = sourceEl.cloneNode(true)
  clone.style.cssText = 'max-width:100%;padding:0;margin:0;'
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)
  try {
    return await html2canvas(wrapper, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: thm.vars.bg,
      logging: false,
      width:       wrapper.offsetWidth,
      height:      wrapper.scrollHeight,
      windowWidth: wrapper.offsetWidth,
    })
  } finally {
    document.body.removeChild(wrapper)
  }
}

// ── 矢量 PDF（浏览器 Print API） ──────────────────────────

function buildPrintCSS(fmt, thm, singlePage) {
  const c = thm.vars
  // singlePage is best-effort in the browser print pipeline. Real automatic
  // pagination should use a fixed page height and let Chromium split pages.
  const pageSize = singlePage
    ? `${fmt.widthMm}mm auto`
    : `${fmt.widthMm}mm ${fmt.heightMm}mm`

  return `
@page {
  size: ${pageSize};
  margin: ${fmt.marginV} ${fmt.marginH};
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  background: ${c.bg};
}

body {
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
               'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: ${fmt.fontSize}px;
  line-height: 1.75;
  color: ${c.text};
  background: ${c.bg};
  word-wrap: break-word;
}

.print-root {
  width: 100%;
  max-width: 100%;
  overflow: visible;
}

h1,h2,h3,h4,h5,h6 {
  margin-top:1.4em; margin-bottom:0.5em; font-weight:700; line-height:1.3; color:${c.text};
  break-after: avoid-page;
  break-inside: avoid-page;
  page-break-after: avoid;
  page-break-inside: avoid;
}
h1 { font-size:2em;    border-bottom:2px solid ${c.border}; padding-bottom:0.3em; }
h2 { font-size:1.5em;  border-bottom:1px solid ${c.border}; padding-bottom:0.25em; }
h3 { font-size:1.25em; }
h4 { font-size:1.1em; }
h5,h6 { font-size:1em; color:${c.textSub}; }

p { margin-bottom:0.9em; orphans:3; widows:3; }
a { color:${c.link}; text-decoration:none; }
ul,ol { padding-left:1.8em; margin-bottom:0.9em; }
li { margin-bottom:0.2em; orphans:3; widows:3; }

blockquote {
  margin:0.9em 0; padding:0.6em 1em;
  border-left:4px solid ${c.quoteLeft};
  background:${c.quoteBg};
  border-radius:0 4px 4px 0;
  color:${c.textSub};
  break-inside: avoid-page;
  page-break-inside: avoid;
}
blockquote p { margin:0; }
blockquote p+p { margin-top:0.4em; }

code {
  background:${c.codeBg}; padding:0.15em 0.4em; border-radius:3px;
  font-size:0.86em;
  font-family:'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace;
  color:${c.inlineCode};
}

pre {
  margin:0.9em 0; border-radius:6px; overflow:hidden;
  background:#282c34;
  break-inside: avoid-page;
  page-break-inside: avoid;
}
pre code {
  display:block; padding:1em 1.2em; background:transparent; color:#abb2bf;
  font-family:'JetBrains Mono','Fira Code',Consolas,monospace;
  font-size:0.88em; line-height:1.6; overflow-wrap:anywhere; white-space:pre-wrap;
}

hr { border:none; border-top:1px solid ${c.hr}; margin:1.5em 0; }

table {
  width:100%; border-collapse:collapse; margin:0.9em 0;
  font-size:0.93em; border:1px solid ${c.border};
  break-inside: avoid-page;
  page-break-inside: avoid;
}
thead { background:${c.tableHead}; }
th,td { padding:8px 14px; border:1px solid ${c.border}; text-align:left; }
th { font-weight:600; }
tbody tr:nth-child(even) { background:${c.tableStripe}; }

img { max-width:100%; border-radius:4px; break-inside:avoid-page; page-break-inside:avoid; }

.mermaid-wrapper {
  text-align:center; margin:1em 0;
  break-inside: avoid-page;
  page-break-inside: avoid;
}
pre.mermaid { background:transparent !important; padding:0; }
pre.mermaid svg,.mermaid-wrapper svg { max-width:100%; height:auto; }

.hljs                               { background:#282c34; color:#abb2bf; }
.hljs-keyword,.hljs-operator        { color:#c678dd; }
.hljs-function .hljs-title,
.hljs-title.function_               { color:#61afef; }
.hljs-string,.hljs-template-string  { color:#98c379; }
.hljs-number,.hljs-literal          { color:#d19a66; }
.hljs-comment                       { color:#7f848e; font-style:italic; }
.hljs-class,.hljs-title.class_      { color:#e5c07b; }
.hljs-attr,.hljs-attribute          { color:#e06c75; }
.hljs-built_in                      { color:#e5c07b; }
.hljs-variable,.hljs-name           { color:#e06c75; }
.hljs-type                          { color:#e5c07b; }
.hljs-tag                           { color:#e06c75; }
.hljs-meta                          { color:#56b6c2; }
.hljs-property                      { color:#56b6c2; }
.hljs-regexp                        { color:#98c379; }
.hljs-selector-class,.hljs-selector-id { color:#61afef; }
`
}

/**
 * 矢量 PDF：浏览器打印对话框（文字可选中，SVG 矢量）
 */
export function exportToPdf(sourceEl, filename = 'document', formatKey = 'a4', themeKey = 'light', singlePage = false) {
  const fmt = PDF_FORMATS[formatKey] ?? PDF_FORMATS.a4
  const thm = PDF_THEMES[themeKey] ?? PDF_THEMES.light

  const css = buildPrintCSS(fmt, thm, singlePage)
  const bodyHTML = sourceEl.innerHTML

  // 以内容宽度打开打印窗口，让浏览器以正确宽度渲染
  const marginHMm = parseFloat(fmt.marginH)
  const contentWidthMm = fmt.widthMm - marginHMm * 2
  const winWidth = Math.round(contentWidthMm / 25.4 * 96) + 80
  const win = window.open('', '_blank', `width=${winWidth},height=700,scrollbars=yes`)
  if (!win) { alert('请允许弹出窗口以导出 PDF'); return }

  win.document.write(`<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8">
<title>${filename}</title>
<style>${css}</style>
</head><body><main class="print-root">${bodyHTML}</main></body></html>`)
  win.document.close()

  win.addEventListener('load', () => {
    setTimeout(() => {
      win.focus()
      win.print()
      win.addEventListener('afterprint', () => win.close())
    }, 300)
  })
}

// ── 位图 PDF（html2canvas + jsPDF） ───────────────────────

/**
 * 位图 PDF（文字不可选，排版像素级还原）
 * singlePage=true 时生成一张高度自适应的超长单页
 */
export async function exportToPdfBitmap(sourceEl, filename = 'document', formatKey = 'a4', themeKey = 'light', singlePage = false) {
  const fmt = PDF_FORMATS[formatKey] ?? PDF_FORMATS.a4
  const thm = PDF_THEMES[themeKey] ?? PDF_THEMES.light

  const canvas = await screenshotEl(sourceEl, fmt, thm, 2)
  const imgData = canvas.toDataURL('image/png')

  const pageW = fmt.widthMm
  const imgH  = (canvas.height * pageW) / canvas.width  // 总图高（mm）

  if (singlePage) {
    // 单页：PDF 高度 = 图片实际高度
    const pdf = new jsPDF('p', 'mm', [pageW, imgH])
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH)
    pdf.save(`${filename}.pdf`)
    return
  }

  // 分页
  const pageH = fmt.heightMm
  const pdf   = new jsPDF('p', 'mm', [pageW, pageH])
  let remaining = imgH
  let yOffset   = 0

  pdf.addImage(imgData, 'PNG', 0, yOffset, pageW, imgH)
  remaining -= pageH

  while (remaining > 0) {
    pdf.addPage()
    yOffset = -(imgH - remaining)
    pdf.addImage(imgData, 'PNG', 0, yOffset, pageW, imgH)
    remaining -= pageH
  }

  pdf.save(`${filename}.pdf`)
}

// ── 导出长图 PNG ──────────────────────────────────────────

/**
 * 长图 PNG 下载
 * @param {number} scale - 像素倍率（1 / 2 / 3）
 */
export async function exportToImage(sourceEl, filename = 'document', formatKey = 'a4', themeKey = 'light', scale = 2) {
  const fmt = PDF_FORMATS[formatKey] ?? PDF_FORMATS.a4
  const thm = PDF_THEMES[themeKey] ?? PDF_THEMES.light

  const canvas = await screenshotEl(sourceEl, fmt, thm, scale)
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `${filename}@${scale}x.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, 'image/png')
}
