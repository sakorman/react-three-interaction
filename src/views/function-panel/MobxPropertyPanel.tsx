import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { editorStore, ModelData } from '../../stores/EditorStore';

const PanelContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  max-height: 60vh;
  background: rgba(45, 45, 55, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const PanelHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const PanelContent = styled.div`
  padding: 16px;
  overflow-y: auto;
  max-height: calc(60vh - 60px);
`;

const PropertySection = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #e0e0e0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
`;

const PropertyGroup = styled.div`
  margin-bottom: 12px;
`;

const PropertyLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #ccc;
  font-weight: 500;
`;

const PropertyRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const PropertyInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 8px;
  color: white;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PropertyCheckbox = styled.input`
  margin-right: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  padding: 20px;
`;

const SelectionSummary = styled.div`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #ccc;
`;

interface PropertyEditorProps {
  model: ModelData;
}

const ModelPropertyEditor: React.FC<PropertyEditorProps> = observer(({ model }) => {
  const updateProperty = (key: keyof ModelData, value: any) => {
    editorStore.updateModel(model.id, { [key]: value });
  };

  const updatePosition = (axis: 'x' | 'y' | 'z', value: number) => {
    editorStore.updateModel(model.id, {
      position: { ...model.position, [axis]: value }
    });
  };

  const updateRotation = (axis: 'x' | 'y' | 'z', value: number) => {
    editorStore.updateModel(model.id, {
      rotation: { ...model.rotation, [axis]: value * Math.PI / 180 }
    });
  };

  const updateScale = (axis: 'x' | 'y' | 'z', value: number) => {
    editorStore.updateModel(model.id, {
      scale: { ...model.scale, [axis]: Math.max(0.01, value) }
    });
  };

  return (
    <div>
      {/* 基本信息 */}
      <PropertySection>
        <SectionTitle>基本信息</SectionTitle>
        
        <PropertyGroup>
          <PropertyLabel>名称</PropertyLabel>
          <PropertyInput
            type="text"
            value={model.name}
            onChange={(e) => updateProperty('name', e.target.value)}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>类型</PropertyLabel>
          <PropertyInput
            type="text"
            value={model.type}
            disabled
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>
            <PropertyCheckbox
              type="checkbox"
              checked={model.visible}
              onChange={(e) => updateProperty('visible', e.target.checked)}
            />
            显示
          </PropertyLabel>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>颜色</PropertyLabel>
          <PropertyInput
            type="color"
            value={model.color}
            onChange={(e) => updateProperty('color', e.target.value)}
          />
        </PropertyGroup>
      </PropertySection>

      {/* 变换属性 */}
      <PropertySection>
        <SectionTitle>变换</SectionTitle>
        
        <PropertyGroup>
          <PropertyLabel>位置 (X, Y, Z)</PropertyLabel>
          <PropertyRow>
            <PropertyInput
              type="number"
              step="0.1"
              value={model.position.x.toFixed(2)}
              onChange={(e) => updatePosition('x', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              value={model.position.y.toFixed(2)}
              onChange={(e) => updatePosition('y', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              value={model.position.z.toFixed(2)}
              onChange={(e) => updatePosition('z', parseFloat(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>旋转 (X, Y, Z) 度</PropertyLabel>
          <PropertyRow>
            <PropertyInput
              type="number"
              step="1"
              value={(model.rotation.x * 180 / Math.PI).toFixed(0)}
              onChange={(e) => updateRotation('x', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="1"
              value={(model.rotation.y * 180 / Math.PI).toFixed(0)}
              onChange={(e) => updateRotation('y', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="1"
              value={(model.rotation.z * 180 / Math.PI).toFixed(0)}
              onChange={(e) => updateRotation('z', parseFloat(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>缩放 (X, Y, Z)</PropertyLabel>
          <PropertyRow>
            <PropertyInput
              type="number"
              step="0.1"
              min="0.01"
              value={model.scale.x.toFixed(2)}
              onChange={(e) => updateScale('x', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              min="0.01"
              value={model.scale.y.toFixed(2)}
              onChange={(e) => updateScale('y', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              min="0.01"
              value={model.scale.z.toFixed(2)}
              onChange={(e) => updateScale('z', parseFloat(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>
      </PropertySection>

      {/* 材质属性 */}
      {model.material && (
        <PropertySection>
          <SectionTitle>材质</SectionTitle>
          
          <PropertyGroup>
            <PropertyLabel>材质类型</PropertyLabel>
            <PropertyInput
              type="text"
              value={model.material.type}
              disabled
            />
          </PropertyGroup>

          {model.material.metalness !== undefined && (
            <PropertyGroup>
              <PropertyLabel>金属度</PropertyLabel>
              <PropertyInput
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={model.material.metalness}
                onChange={(e) => {
                  if (model.material) {
                    editorStore.updateModel(model.id, {
                      material: { ...model.material, metalness: parseFloat(e.target.value) }
                    });
                  }
                }}
              />
              <span style={{ fontSize: '11px', color: '#888' }}>
                {model.material.metalness.toFixed(2)}
              </span>
            </PropertyGroup>
          )}

          {model.material.roughness !== undefined && (
            <PropertyGroup>
              <PropertyLabel>粗糙度</PropertyLabel>
              <PropertyInput
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={model.material.roughness}
                onChange={(e) => {
                  if (model.material) {
                    editorStore.updateModel(model.id, {
                      material: { ...model.material, roughness: parseFloat(e.target.value) }
                    });
                  }
                }}
              />
              <span style={{ fontSize: '11px', color: '#888' }}>
                {model.material.roughness.toFixed(2)}
              </span>
            </PropertyGroup>
          )}
        </PropertySection>
      )}
    </div>
  );
});

export const MobxPropertyPanel: React.FC = observer(() => {
  if (!editorStore.showPropertyPanel) {
    return null;
  }

  const handleClose = () => {
    editorStore.togglePropertyPanel();
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>属性面板</PanelTitle>
        <CloseButton onClick={handleClose}>✕</CloseButton>
      </PanelHeader>
      
      {editorStore.selectionCount > 0 && (
        <SelectionSummary>
          已选择 {editorStore.selectionCount} 个对象
        </SelectionSummary>
      )}

      <PanelContent>
        {editorStore.selectionCount === 0 ? (
          <EmptyState>
            请选择一个或多个对象来查看属性
          </EmptyState>
        ) : editorStore.activeModel ? (
          <ModelPropertyEditor model={editorStore.activeModel} />
        ) : (
          <div>
            <h4 style={{ margin: '0 0 12px 0' }}>多对象编辑</h4>
            {editorStore.selectedModels.map((model, index) => (
              <div key={model.id} style={{ marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#ccc' }}>
                  {model.name || `对象 ${index + 1}`}
                </h5>
                <ModelPropertyEditor model={model} />
              </div>
            ))}
          </div>
        )}
      </PanelContent>
    </PanelContainer>
  );
}); 