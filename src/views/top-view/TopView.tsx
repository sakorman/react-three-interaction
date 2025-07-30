import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';

import { editorStore } from '../../stores/EditorStore';
import { TopViewTool } from '../../tools/top-view';
import {
  TopViewContainer,
  TopViewHeader,
  TopViewTitle,
  CloseButton,
  CanvasContainer,
  TopViewToolbar,
  ToolButton,
  StatusIndicator,
  HelpOverlay,
  InteractionIndicator
} from './TopView.styles';

export interface TopViewProps {
  visible?: boolean;
}

export const TopView: React.FC<TopViewProps> = observer(({ visible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationFrameRef = useRef<number>();
  const topViewToolRef = useRef<TopViewTool | null>(null);
  const [viewType, setViewType] = useState<'top' | 'front' | 'side'>('top');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [interactionState, setInteractionState] = useState<string | null>(null);

  // 获取主编辑器实例
  const editor = editorStore.editorInstance;

  const initTopView = useCallback(() => {
    if (!canvasRef.current || !editor) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x2d2d37, 0.8);
    rendererRef.current = renderer;

    // 创建正交相机
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      -10 * aspect, 10 * aspect,
      10, -10,
      0.1, 1000
    );
    
    // 设置相机位置（俯视图）
    setCameraPosition(camera, viewType);
    cameraRef.current = camera;

    // 使用主场景的引用
    sceneRef.current = editor.sceneInstance;

    // 初始化交互工具
    initializeTopViewTool();

    startRenderLoop();
  }, [editor, viewType]);

  const setCameraPosition = (camera: THREE.OrthographicCamera, type: 'top' | 'front' | 'side') => {
    switch (type) {
      case 'top':
        camera.position.set(0, 20, 0);
        camera.lookAt(0, 0, 0);
        camera.up.set(0, 0, -1);
        break;
      case 'front':
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);
        camera.up.set(0, 1, 0);
        break;
      case 'side':
        camera.position.set(20, 0, 0);
        camera.lookAt(0, 0, 0);
        camera.up.set(0, 1, 0);
        break;
    }
  };

  const startRenderLoop = () => {
    const render = () => {
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const stopRenderLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleClose = () => {
    editorStore.setTopViewVisible(false);
  };

  const initializeTopViewTool = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current || !cameraRef.current || 
        !sceneRef.current || !editor) return;

    // 清理之前的工具实例
    if (topViewToolRef.current) {
      topViewToolRef.current.dispose();
    }

    // 创建新的交互工具
    topViewToolRef.current = new TopViewTool(
      editor,
      cameraRef.current,
      canvasRef.current,
      rendererRef.current,
      sceneRef.current,
      {
        enableDrag: true,
        enableZoom: true,
        enableSelect: true,
        zoomSpeed: 0.1,
        minZoom: 0.1,
        maxZoom: 5,
      }
    );

    // 监听工具事件来更新状态
    setupToolEventListeners();

    // 激活工具
    topViewToolRef.current.activate();
    
    // 设置缩放级别变化回调
    topViewToolRef.current.onZoomChange = (newZoomLevel: number) => {
      setZoomLevel(newZoomLevel);
    };
    
    // 设置当前视角类型
    topViewToolRef.current.setViewType(viewType);
    
    // 初始化缩放级别显示
    setZoomLevel(topViewToolRef.current.getZoomLevel());
  }, [editor, viewType]);

  const handleViewTypeChange = (type: 'top' | 'front' | 'side') => {
    setViewType(type);
    if (cameraRef.current) {
      setCameraPosition(cameraRef.current, type);
    }
    // 更新交互工具的视角类型
    if (topViewToolRef.current) {
      topViewToolRef.current.setViewType(type);
    }
  };

  const setupToolEventListeners = useCallback(() => {
    if (!editor) return;

    // 监听拖拽事件
    editor.eventSystemInstance.on('object:drag:start', () => {
      setInteractionState('拖拽中...');
    });

    editor.eventSystemInstance.on('object:drag:end', () => {
      setInteractionState(null);
    });

  }, [editor]);

  const handleResetView = () => {
    if (topViewToolRef.current) {
      topViewToolRef.current.resetView();
      setZoomLevel(1);
    }
  };

  const handleCanvasMouseEnter = () => {
    setShowHelp(true);
  };

  const handleCanvasMouseLeave = () => {
    setShowHelp(false);
    setInteractionState(null);
  };

  // 响应窗口大小变化
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    const aspect = width / height;

    cameraRef.current.left = -10 * aspect;
    cameraRef.current.right = 10 * aspect;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    if (visible) {
      // 延迟初始化，确保canvas尺寸正确
      const timer = setTimeout(() => {
        initTopView();
      }, 100);

      return () => {
        clearTimeout(timer);
        stopRenderLoop();
        // 清理交互工具
        if (topViewToolRef.current) {
          topViewToolRef.current.dispose();
          topViewToolRef.current = null;
        }
      };
    } else {
      stopRenderLoop();
      // 清理交互工具
      if (topViewToolRef.current) {
        topViewToolRef.current.dispose();
        topViewToolRef.current = null;
      }
    }
  }, [visible, initTopView]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      stopRenderLoop();
      // 最终清理
      if (topViewToolRef.current) {
        topViewToolRef.current.dispose();
        topViewToolRef.current = null;
      }
    };
  }, [handleResize]);

  if (!visible) {
    return null;
  }

  return (
    <TopViewContainer>
      <TopViewHeader>
        <TopViewTitle>
          {viewType === 'top' ? '俯视图' : viewType === 'front' ? '前视图' : '侧视图'}
        </TopViewTitle>
        <CloseButton onClick={handleClose}>✕</CloseButton>
      </TopViewHeader>

      <CanvasContainer 
        onMouseEnter={handleCanvasMouseEnter}
        onMouseLeave={handleCanvasMouseLeave}
      >
        <canvas ref={canvasRef} />
        
        {/* 状态指示器 */}
        <StatusIndicator>
          缩放: {zoomLevel.toFixed(1)}x
        </StatusIndicator>

        {/* 交互状态指示器 */}
        {interactionState && (
          <InteractionIndicator className="visible">
            {interactionState}
          </InteractionIndicator>
        )}

        {/* 帮助提示 */}
        <HelpOverlay className={showHelp ? 'visible' : ''}>
          <div>左键: 选择/拖拽对象</div>
          <div>右键: 拖拽视图</div>
          <div>滚轮: 缩放视图</div>
          <div>Ctrl+左键: 多选</div>
        </HelpOverlay>
      </CanvasContainer>

      <TopViewToolbar>
        <ToolButton 
          className={viewType === 'top' ? 'active' : ''}
          onClick={() => handleViewTypeChange('top')}
        >
          俯视
        </ToolButton>
        <ToolButton 
          className={viewType === 'front' ? 'active' : ''}
          onClick={() => handleViewTypeChange('front')}
        >
          前视
        </ToolButton>
        <ToolButton 
          className={viewType === 'side' ? 'active' : ''}
          onClick={() => handleViewTypeChange('side')}
        >
          侧视
        </ToolButton>
        <ToolButton onClick={handleResetView}>
          重置
        </ToolButton>
      </TopViewToolbar>
    </TopViewContainer>
  );
}); 