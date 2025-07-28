import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';

import { editorStore } from '../../stores/EditorStore';
import {
  TopViewContainer,
  TopViewHeader,
  TopViewTitle,
  CloseButton,
  CanvasContainer,
  TopViewToolbar,
  ToolButton
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
  const [viewType, setViewType] = useState<'top' | 'front' | 'side'>('top');

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

  const handleViewTypeChange = (type: 'top' | 'front' | 'side') => {
    setViewType(type);
    if (cameraRef.current) {
      setCameraPosition(cameraRef.current, type);
    }
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
      };
    } else {
      stopRenderLoop();
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

      <CanvasContainer>
        <canvas ref={canvasRef} />
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
      </TopViewToolbar>
    </TopViewContainer>
  );
}); 