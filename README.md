# Markdown云笔记本:cloud:——Electron+React+七牛云
仿Typora软件：Electron与React的联调（window.loadUrl）

### 架构：

- Electron主进程：创建窗口、提供原生应用的各种模块
- Electron渲染进程：提供浏览器环境。React作为View层完成各种交互
- Node.js: 负责本地文件的创建管理、网络文件的下载等
- 七牛云OSS: 负责本地文件同步到云端，并提供上传和下载的服务



### 需求阶段：

1. 初期：

- 持久化数据，保存文件到本地文件系统
- 原生菜单，通过菜单和快捷键新建、保存、搜索、重命名文件等

React: 搜索框、文件列表、新建文件、文件tabs、编辑器

Electron: 文件列表右键子菜单、文件导入、应用菜单、全局快捷键、文件数据持久化保存

