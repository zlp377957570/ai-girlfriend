# 💕 AI 聊天女友 Web App

一个基于 **Next.js 14 + Claude API** 的 AI 聊天女友应用，支持：

- 💬 流式聊天回复（逐字显示）
- 🧠 结构化长期记忆（本地持久化）
- ✨ 性格模板与自定义人设
- 🚀 Vercel 一键部署

## 功能特性

### 1) 长期记忆系统
- 对话达到一定长度后，后台自动压缩为结构化记忆
- 每条记忆包含：日期、摘要、关键词、细节
- 聊天时自动注入记忆上下文，让角色“记得你”

### 2) 性格定制系统
- 内置 5 种预设人格：温柔、活泼、高冷、甜蜜、知性
- 支持名字、头像、性格、说话风格、兴趣完全自定义
- 更改设定后不会清空聊天记录和记忆

### 3) 本地持久化
- 聊天记录、人设、记忆全部存储在浏览器 `localStorage`
- 刷新页面后可继续对话

## 本地运行

1. 克隆仓库
2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入 Claude API Key：

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. 启动开发服务

```bash
npm run dev
```

访问：http://localhost:3000

## Vercel 部署

1. 将仓库导入 Vercel
2. 在 Vercel 项目环境变量中设置：
   - `ANTHROPIC_API_KEY`
3. 点击 Deploy

## 长期记忆原理

- 每 10 条消息触发一次记忆整理
- 调用 `POST /api/memorize` 提取结构化摘要
- 新记忆写入本地，旧消息被压缩移除
- `POST /api/chat` 时将记忆拼接进系统提示词

## 预设性格模板

- 温柔体贴 🌸
- 活泼可爱 🌟
- 高冷御姐 ❄️
- 甜蜜撒娇 🍬
- 知性文艺 📚
- 自定义 ✏️
