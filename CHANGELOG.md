# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Added
- **MobX状态管理系统** - 全新的响应式状态管理
  - `EditorStore` - 使用MobX管理全局编辑器状态
  - `ModelData` - 标准化的模型数据接口
  - 支持场景模型、选中状态、实时属性同步
- **响应式属性面板** - `MobxPropertyPanel`
  - 实时响应选中模型变化
  - 支持位置、旋转、缩放属性编辑
  - 支持颜色和材质属性调整
  - 美观的Material Design风格界面
- **调试面板** - `DebugPanel`
  - 实时显示MobX Store状态
  - 模型数量和选中状态统计
  - 开发调试信息展示
- **几何体工具栏**
  - 支持添加立方体、球体、圆柱体
  - 一键创建3D几何体对象
  - 自动添加到场景和状态管理

### Enhanced
- **EditorCore核心优化**
  - 完整的工具管理系统重构
  - 自动初始化SelectTool实例
  - 改进的工具切换与状态同步机制
  - 与MobX Store双向数据绑定
- **选择工具改进**
  - 修复左键点击无法选中对象的问题
  - 优化工具激活逻辑，避免循环调用
  - 改进的选择状态管理
- **React集成优化**
  - 修复React Hook调用错误
  - Webpack配置添加React resolve alias
  - 改进React.createElement用法
  - 更好的组件渲染性能

### Fixed
- 修复左键点击选择功能失效问题
- 修复BaseTool激活时的递归循环调用
- 修复React Hook "Invalid hook call" 错误
- 修复多React实例冲突问题
- 修复属性面板不响应选中状态变化
- 清理所有调试日志，保持代码整洁

### Dependencies
- 添加 `mobx@^6.12.0` - 响应式状态管理
- 添加 `mobx-react-lite@^4.0.5` - React MobX集成
- 更新 `styled-components@^6.1.6` - 样式组件
- 更新 `zustand@^4.4.7` - 状态管理

### Technical Improvements
- 完整的TypeScript类型定义
- 改进的模块导出结构
- 优化的webpack构建配置
- 更好的代码组织和架构

## [1.0.1]

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

## [1.0.0]
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