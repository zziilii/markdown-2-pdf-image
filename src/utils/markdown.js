import { marked } from 'marked'
import hljs from 'highlight.js'

const renderer = new marked.Renderer()

// 代码块渲染：mermaid 保留原始内容等待后续处理，其他语言用 hljs 高亮
renderer.code = function ({ text, lang }) {
  if (lang === 'mermaid') {
    return `<div class="mermaid-wrapper"><pre class="mermaid">${text}</pre></div>`
  }
  const language = hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}

// 链接在新标签打开
renderer.link = function ({ href, title, text }) {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
})

/**
 * 将 Markdown 字符串转换为 HTML 字符串
 * @param {string} content
 * @returns {string}
 */
export function renderMarkdown(content) {
  return marked.parse(content)
}
