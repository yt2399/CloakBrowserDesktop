# CloakBrowserApp

[English](./README.en.md) | 简体中文

CloakBrowserApp 是一个基于 [CloakBrowser](https://github.com/CloakHQ/CloakBrowser) 的本地浏览器环境管理与启动工具。

它将 CloakBrowser 的浏览器启动、持久化 Profile、指纹参数和代理能力整合到桌面管理界面中。用户无需编写启动代码，即可创建多个相互隔离的浏览器环境，并对环境进行统一配置、启动、停止和维护。

> 本项目适合需要长期维护多个独立浏览器环境，同时希望直接使用 CloakBrowser 能力的个人用户和研究场景。

## 环境管理

通过统一列表查看和管理所有浏览器环境，包括运行状态、代理配置和最近打开时间。

![环境管理](./docs/images/environment-management.png)

支持的管理操作：

- 创建、编辑和删除浏览器环境
- 单独或批量启动、停止环境
- 搜索并筛选已有环境
- 查看环境当前运行状态
- 为每个环境保存独立的浏览器数据

## 环境配置

每个环境使用独立的持久化用户数据目录，浏览器 Cookie、LocalStorage、缓存和会话状态可以在关闭后继续保留。

![环境配置](./docs/images/profile-editor.png)

可配置内容包括：

- 浏览器环境名称与启动网址
- HTTP 或 SOCKS5 代理
- 时区和浏览器语言
- 屏幕宽度与高度
- CPU 线程数与设备内存
- 浏览器存储配额
- 根据代理自动匹配时区和语言
- CloakBrowser 指纹种子与启动参数

启动环境时，CloakBrowserApp 会根据配置创建对应的持久化浏览器上下文，并使用 CloakBrowser 启动真实浏览器窗口。

## 内核管理

内核页面按 Chromium 子版本整理 CloakBrowser 可用构建，并展示每个版本支持的操作系统。

![内核下载](./docs/images/kernel-downloads.png)

目前提供：

- Windows、Linux 和 macOS 构建信息
- 官方下载入口
- 下载地址复制
- GitHub 备用下载
- 版本、指纹补丁数量和支持平台展示

## 与 CloakBrowser 的关系

CloakBrowser 是经过源码级指纹修改的 Chromium 浏览器项目，提供持久化 Profile、代理、时区、语言和浏览器指纹等启动能力。

CloakBrowserApp 不修改 CloakBrowser 内核，而是在其能力之上提供可视化的环境管理和启动入口：

- CloakBrowser 负责浏览器内核、指纹能力与浏览器运行
- CloakBrowserApp 负责环境配置、Profile 管理、状态展示和启动控制

有关 CloakBrowser 的详细能力、支持平台和内核版本，请查看 [CloakBrowser 官方项目](https://github.com/CloakHQ/CloakBrowser)。

## 许可证

本项目使用 [PolyForm Noncommercial License 1.0.0](./LICENSE)。

允许符合许可条款的个人学习、研究、测试和其他非商业使用。未经单独授权，不允许将本项目用于商业用途。CloakBrowser、Chromium 和其他第三方组件分别遵循其各自许可证。
