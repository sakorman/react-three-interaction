# Changelog

All notable changes to this project will be documented in this file.

## [1.2.9]
### Enhanced 
- **UI:** 修复俯视图拖拽功能失效问题

## [1.2.8]
### Fixed 
- **UX:** 修改操作说明展示逻辑

## [1.2.7]
### Enhanced 
- **UI:** 创建了一个独立的俯视图窗口，提供实时渲染、多视角切换等功能

## [1.2.6]
### Fixed
- **UI:** 修复了拖拽失败的问题

## [1.2.5]

### Fixed
- **UI:** 修复了SelectMenu偶尔不展示的问题

## [1.2.4]

### Enhanced
- **UX:** 基于antDesign重构属性面板、选择菜单、资源管理器。

## [1.2.3]

### Fixed
- **UI & Ant:** 引入了Ant Design，并优化toolbar的样式


## [1.2.2]

### Fixed
- **UI & State Sync:** 修复了属性面板、资源管理器和SelectMenu不显示的问题，统一了MobX和Zustand的状态管理，避免了状态不同步。
- **Build & TS:** 解决了TypeScript `rootDir`路径冲突导致的编译报错问题。

### Enhanced
- **UX:** 优化了资源管理器的位置，调整到左下角，并移除了所有调试信息，使代码更适合生产环境。

## [1.2.1]

### Enhanced
- **React架构重构** - 示例项目改为React组件架构
  - 新增`Toolbar`、`InfoPanel`、`CanvasContainer`、`App`组件
  - 入口点重构为JSX，支持动态操作说明和状态同步

## [1.2.0]

### Added
- **拖拽工具 (DragTool)** - 3D对象拖拽功能
  - 支持自由拖拽和平面约束拖拽(XY/XZ/YZ)
  - 网格吸附功能
  - 拖拽事件系统(start/update/end)
- **工具管理API** - 新增工具切换和管理方法

### Enhanced
- 事件系统支持拖拽事件
- 工具系统改进和示例项目更新

## [1.1.0]

### Added
- **MobX状态管理** - 响应式状态管理系统
  - `EditorStore`全局状态管理
  - `MobxPropertyPanel`属性面板
  - `DebugPanel`调试面板
- **几何体工具栏** - 支持添加立方体、球体、圆柱体

### Enhanced
- EditorCore核心重构和工具管理优化
- 选择工具改进，修复点击选择问题
- React集成优化

### Fixed
- 修复选择功能和React Hook错误
- 修复工具激活循环调用问题

## [1.0.1]

### Added
- **SelectMenu** - 右键菜单组件(复制/删除/显隐对象)
- **ResourceManager** - 资源管理器组件(对象层次/搜索/选择)

### Enhanced
- 优化EditorCore方法命名和组件集成

## [1.0.0]

### Added
- **核心编辑器功能** - EditorCore、EventSystem、SceneManager
- **选择工具** - 3D对象选择和多选功能
- **React组件** - EditorProvider、FunctionPanel、PropertyEditor
- **Hooks** - useEditor、useSelection状态管理
- **开发工具** - TypeScript、ESLint、Webpack配置

### Features
- 3D对象选择、悬停高亮、属性编辑
- 事件系统和状态管理
- 完整TypeScript支持 