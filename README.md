# CloakBrowserApp

[English](./README.en.md) | 简体中文

CloakBrowserApp 是一个基于 CloakBrowser 的本地浏览器环境管理桌面应用。它使用 Electron 提供桌面界面，通过本地 Express API、SQLite 和持久化浏览器上下文管理相互隔离的浏览器环境。

> 本项目采用非商业源码许可。允许个人学习、研究、测试和符合许可条款的非商业使用；商业使用需要另行获得授权。

## 界面预览

### 环境管理

![环境管理](./docs/images/environment-management.png)

### 环境配置

![环境配置](./docs/images/profile-editor.png)

### 内核下载

![内核下载](./docs/images/kernel-downloads.png)

## 主要能力

- 创建、编辑、启动、停止和删除本地浏览器环境
- 为环境配置代理、时区、语言、屏幕尺寸、CPU、内存和存储配额
- 使用独立的持久化用户数据目录隔离环境数据
- 根据环境种子生成稳定的浏览器指纹参数
- 在本地 SQLite 数据库中保存环境配置
- 通过仅监听 `127.0.0.1` 的本地 API 管理环境和会话
- 按 Chromium 子版本聚合 Windows、Linux 和 macOS 内核下载
- 提供官方下载、地址复制和 GitHub 备用下载入口

## 技术栈

- Electron 39
- React 19 + TypeScript
- electron-vite + Vite 7
- Tailwind CSS 4
- Express 5
- better-sqlite3
- CloakBrowser + Playwright Core
- Radix UI + Lucide Icons

## 快速开始

### 环境要求

- Windows 10/11
- Node.js 22 LTS
- npm 10 或更高版本

### 本地开发

```bash
npm install
npm run dev
```

### 类型检查

```bash
npm run typecheck
```

### 生产构建

```bash
npm run build
```

## 项目结构

```text
src/
  main/       Electron 主进程、本地 API、SQLite 与浏览器会话
  preload/    安全的窗口控制桥接
  renderer/   React 管理界面
docs/images/  GitHub 项目截图
```

## 本地数据与隐私

- 环境配置和用户数据保存在 Electron 的应用数据目录中。
- 本地管理 API 默认仅监听 `127.0.0.1:6788`。
- 代理凭据可能包含敏感信息，请勿提交数据库、日志或真实配置截图。
- `.gitignore` 已排除数据库、构建产物、依赖目录和环境变量文件。

## 当前状态

项目当前重点支持 Windows 桌面开发与打包。环境管理和内核下载页面可用，代理与设置页面仍在继续完善。

## 上游项目

CloakBrowserApp 使用 [CloakBrowser](https://github.com/CloakHQ/CloakBrowser) 提供浏览器运行能力。CloakBrowser、Chromium、依赖包和下载的二进制文件分别遵循其各自许可证；本仓库许可证仅覆盖 CloakBrowserApp 自有代码。

## 许可证

本项目使用 [PolyForm Noncommercial License 1.0.0](./LICENSE)，SPDX 标识为 `PolyForm-Noncommercial-1.0.0`。

该许可允许符合条款的非商业使用、修改和分发，但不允许未经授权的商业使用。它属于 Source Available 许可，不是 OSI 批准的开源许可证。商业授权请通过 GitHub Issue 联系项目维护者。
