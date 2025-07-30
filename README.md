# React Three Interaction

一个基于React、TypeScript和Three.js的3D交互编辑器库，提供了完整的3D场景编辑功能，支持对象选择、属性编辑、工具扩展等功能。

## ✨ 特性

- 🎯 **简单易用** - 提供直观的API，几行代码即可集成
- 🔧 **功能丰富** - 支持选择、悬停、移动、添加等多种交互工具
- 🎨 **可视化编辑** - 实时属性面板，支持位置、旋转、缩放等参数调整
- 📁 **资源管理** - 内置资源管理器，方便管理场景中的所有对象
- 👁️ **多视角支持** - 俯视图/前视图/侧视图，支持拖拽、缩放和精确操作
- 🔌 **高度可扩展** - 支持自定义工具和组件扩展
- 💪 **TypeScript** - 完整的类型支持，提供良好的开发体验
- ⚡ **性能优化** - 基于Three.js的高性能3D渲染
- 📱 **响应式** - 支持多种屏幕尺寸和设备

## 🚀 快速开始

### 安装

```bash
npm install react-three-interaction
# 或
yarn add react-three-interaction
```

### 基本用法

```tsx
import React, { useRef, useEffect, useState } from 'react';
import { 
  createEditor, 
  EditorProvider, 
  FunctionPanel,
  createBasicGeometry,
  createBasicMaterial,
  createMesh 
} from 'react-three-interaction';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      const newEditor = createEditor({
        canvas: canvasRef.current,
        enableControls: true,
        autoResize: true,
      });

      // 添加一些基本对象
      const cube = createMesh(
        createBasicGeometry.box(1, 1, 1),
        createBasicMaterial.standard(0x00ff00),
        [0, 0, 0]
      );
      newEditor.addObject(cube);

      setEditor(newEditor);

      return () => newEditor.dispose();
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} />
      
      {editor && (
        <EditorProvider editor={editor}>
          <FunctionPanel />
        </EditorProvider>
      )}
    </div>
  );
}
```

## 📖 功能特性

### 核心功能
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

### UI组件
- 功能面板 (右下角) - 显示和编辑选中对象的属性
- 选择菜单 (右键菜单) - 提供复制、删除、隐藏等操作
- 资源管理器 (左上角) - 管理场景中的所有对象
- 俯视图 (右上角) - 多视角查看和精确操作

### 🎯 俯视图交互功能

**多视角支持** - 俯视图、前视图、侧视图一键切换  
**对象拖拽** - 在俯视图中直接拖拽移动对象  
**视图缩放** - 鼠标滚轮缩放，支持0.1x到5x范围  
**视图平移** - 右键拖拽平移视图  
**多选支持** - Ctrl+点击实现多对象选择  
**实时反馈** - 缩放级别显示和操作提示  

#### 🖱️ 交互说明
```
左键点击      → 选择对象
左键拖拽      → 移动对象  
右键拖拽      → 平移视图
滚轮          → 缩放视图
Ctrl+左键     → 多选对象
```

> 📖 详细文档: [俯视图交互功能文档](docs/TopView-Interactions.md)

## 🛠️ 开发

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行示例

```bash
npm run example
```

## 📁 项目结构

```
src/
├── core/                  # 核心逻辑
│   ├── EditorCore.ts      # 编辑器核心类
│   ├── EventSystem.ts     # 事件系统
│   └── SceneManager.ts    # 场景管理
├── tools/                 # 交互工具
│   ├── select/            # 选择工具
│   ├── drag/              # 拖拽工具
│   ├── top-view/          # 俯视图交互工具
│   └── index.ts           # 工具导出
├── views/                 # UI视图组件
│   ├── function-panel/    # 功能面板
│   ├── select-menu/       # 选择菜单
│   ├── resource-manager/  # 资源管理器
│   ├── top-view/          # 俯视图组件
│   └── context/           # React上下文
├── models/                # 数据模型
│   ├── SceneObject.ts     # 场景对象模型
│   └── EditorState.ts     # 编辑器状态模型
├── hooks/                 # 自定义Hooks
│   ├── useEditor.ts       # 编辑器Hook
│   └── useSelection.ts    # 选择Hook
├── utils/                 # 工具函数
│   └── three-utils.ts     # Three.js工具函数
└── index.ts               # 项目入口
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

[MIT](LICENSE) © Your Name
