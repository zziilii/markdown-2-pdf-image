export const DEFAULT_CONTENT = `# Markdown 转 PDF 演示文档

> 支持完整的 GFM 语法、代码高亮与 Mermaid 图表渲染，可一键导出为 PDF。

---

## 1. 基本排版

这是一段**粗体文字**和*斜体文字*，也支持 ~~删除线~~ 以及 \`行内代码\`。

超链接示例：[Vue 3 官方文档](https://vuejs.org)

### 无序列表

- 纯前端实现，无需服务器
- 基于 Vue 3 + Vite 构建
- 支持明 / 暗两种主题
  - 编辑器实时预览
  - 一键导出 PDF

### 有序列表

1. 在左侧编辑器输入 Markdown
2. 右侧实时渲染预览
3. 点击"导出 PDF"保存文件

---

## 2. 表格

| 功能           | 支持 |
|--------------|------|
| Markdown 渲染  | ✅    |
| Mermaid 图表  | ✅    |
| 代码高亮       | ✅    |
| 明 / 暗主题    | ✅    |
| 导入 .md 文件  | ✅    |
| 导出 PDF      | ✅    |

---

## 3. 代码高亮

\`\`\`javascript
// 一个简单的 Vue 3 组合式 API 示例
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, doubled, increment }
}
\`\`\`

\`\`\`python
def fibonacci(n: int) -> list[int]:
    """生成斐波那契数列"""
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print(fibonacci(10))
\`\`\`

---

## 4. Mermaid 图表

### 流程图

\`\`\`mermaid
flowchart TD
    A([用户输入 Markdown]) --> B[marked 解析]
    B --> C{是否含 Mermaid?}
    C -- 是 --> D[mermaid.run 渲染]
    C -- 否 --> E[直接显示 HTML]
    D --> F[预览区展示]
    E --> F
    F --> G([点击导出 PDF])
    G --> H[html2canvas 截图]
    H --> I[jsPDF 生成文件]
\`\`\`

### 时序图

\`\`\`mermaid
sequenceDiagram
    participant User as 用户
    participant Editor as 编辑器
    participant Preview as 预览区
    participant PDF as PDF 引擎

    User->>Editor: 输入 Markdown
    Editor->>Preview: 实时同步内容
    Preview->>Preview: marked() 解析
    Preview->>Preview: mermaid.run() 渲染
    User->>PDF: 点击导出
    PDF->>Preview: html2canvas 截图
    PDF->>User: 下载 PDF 文件
\`\`\`

### 甘特图

\`\`\`mermaid
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 前端
    项目初始化     :done,    2024-01-01, 2024-01-02
    组件开发       :done,    2024-01-02, 2024-01-05
    样式设计       :done,    2024-01-04, 2024-01-06
    section 测试
    功能测试       :active,  2024-01-06, 2024-01-08
    PDF 导出测试   :         2024-01-07, 2024-01-09
\`\`\`

---

## 5. 引用块

> **提示**：Mermaid 图表需要稍等片刻渲染完成后再导出 PDF，以确保图表正常显示。
>
> 支持的图表类型包括：flowchart、sequenceDiagram、gantt、classDiagram、stateDiagram、pie 等。

---

*由 Markdown → PDF 工具生成*
`
