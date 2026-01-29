# G-Note

一个现代化的桌面笔记应用，集成了 Git 版本控制功能，基于 Electron、React、TypeScript 和 TipTap 构建。

## 功能特性

- 📝 基于 TipTap 编辑器的富文本编辑
- 🗂️ 分类管理
- 🔍 基于 FlexSearch 的全文搜索
- 📦 使用 isomorphic-git 实现 Git 版本控制
- 🔄 自动保存并记录提交历史
- ⚡ 撤销/恢复任意历史版本
- 🎨 支持亮色和暗色主题
- 📤 导出为 PDF、HTML 和 Markdown
- 💾 本地存储，支持远程 Git 同步

## 技术栈

- **Electron** - 桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **TipTap** - 富文本编辑器
- **Zustand** - 状态管理
- **Tailwind CSS** - 样式框架
- **isomorphic-git** - Git 版本控制
- **FlexSearch** - 全文搜索

## 快速开始

### 环境要求

- Node.js 18+ 和 npm/yarn/pnpm

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd g-note

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 生产环境构建
npm run build

# 构建特定平台的安装包
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 项目结构

```
g-note/
├── src/
│   ├── main/           # 主进程
│   │   ├── index.ts
│   │   ├── ipc/        # IPC 处理器
│   │   └── services/   # 业务逻辑
│   ├── preload/        # 预加载脚本
│   └── renderer/       # 渲染进程 (React)
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── stores/
│       │   └── types/
└── resources/          # 静态资源
```

## 使用指南

### 创建笔记

1. 点击侧边栏的"新建笔记"按钮
2. 在编辑器中开始输入
3. 笔记每 3 秒自动保存一次

### 版本历史

1. 打开一篇笔记
2. 点击"历史记录"标签
3. 查看所有历史版本
4. 点击"恢复"可还原到任意版本

### Git 远程同步

1. 进入设置页面
2. 配置 Git 仓库地址和访问令牌
3. 点击"推送到远程"同步笔记

### 导出笔记

1. 打开一篇笔记
2. 点击"导出"按钮
3. 选择格式：PDF、HTML 或 Markdown

## 快捷键

- `Ctrl/Cmd + S` - 保存笔记
- `Ctrl/Cmd + N` - 新建笔记
- `Ctrl/Cmd + F` - 搜索

## 开发指南

### 添加新功能

1. 在 `src/main/ipc/` 中添加 IPC 处理器
2. 在 `src/main/services/` 中创建服务
3. 在 `src/preload/index.ts` 中更新预加载 API
4. 在 `src/renderer/src/components/` 中构建 UI 组件
5. 在 `src/renderer/src/stores/` 中更新状态管理

### 代码规范

本项目使用：
- TypeScript 确保类型安全
- ESLint 进行代码检查
- Prettier 进行代码格式化

## 许可证

MIT

## 贡献

欢迎贡献！欢迎提交 Pull Request。
