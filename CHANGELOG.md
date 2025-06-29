# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-01-20

### Added
- `SelectMenu` - 右键选择菜单组件
  - 支持复制、重复、删除对象
  - 显示/隐藏对象功能
  - 聚焦到对象和重置变换
  - 美观的现代化界面设计
- `ResourceManager` - 资源管理器组件
  - 显示场景中所有对象的层次结构
  - 搜索和过滤功能（全部/可见/隐藏）
  - 点击选择对象，支持多选
  - 快速切换对象可见性
  - 实时统计信息显示

### Enhanced
- 更新了 `EditorCore` 的getter方法命名，避免属性名冲突
- 示例项目集成了新的UI组件
- 完善了组件导出和类型定义

## [1.0.0] - 2024-01-20

### Added
- 初始版本发布
- 核心编辑器功能 (`EditorCore`)
- 事件系统 (`EventSystem`)
- 场景管理器 (`SceneManager`)
- 选择工具 (`SelectTool`)
- React集成组件
  - `EditorProvider` - 编辑器上下文提供者
  - `FunctionPanel` - 功能面板组件
  - `PropertyEditor` - 属性编辑器组件
- 自定义Hooks
  - `useEditor` - 编辑器状态管理
  - `useSelection` - 选择状态管理
- Three.js工具函数库
- 完整的TypeScript支持
- ESLint代码规范
- Webpack构建配置
- Husky Git钩子
- 示例项目

### Features
- ✅ 3D对象选择和多选
- ✅ 鼠标悬停高亮
- ✅ 对象属性编辑
- ✅ 实时参数调整
- ✅ 场景对象管理
- ✅ 事件系统
- ✅ 状态管理 (Zustand)
- ✅ React组件集成
- ✅ TypeScript完全支持
- ✅ 可扩展的工具系统

### Documentation
- 完整的API文档
- 使用示例
- 开发指南
- 配置说明

### Development
- 专业的项目结构
- 现代化的构建工具链
- 代码质量保证
- 自动化测试准备
- 持续集成准备 