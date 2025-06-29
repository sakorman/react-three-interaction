import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

import { SceneObject } from '../../models/SceneObject';
import { useEditor } from '../../hooks/useEditor';

const PropertyGroup = styled.div`
  margin-bottom: 16px;
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

interface PropertyEditorProps {
  object: SceneObject;
  compact?: boolean;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ 
  object, 
  compact = false 
}) => {
  const { dispatch } = useEditor();
  const [properties, setProperties] = useState(object.getProperties());

  const updateProperty = useCallback((key: string, value: any) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
    
    // 更新对象属性
    dispatch({
      type: 'UPDATE_SCENE_OBJECT',
      payload: { id: object.id, properties: { [key]: value } }
    });
  }, [properties, object.id, dispatch]);

  const updateVectorProperty = useCallback((key: string, axis: 'x' | 'y' | 'z', value: number) => {
    const vector = properties[key as keyof typeof properties] as any;
    if (vector && typeof vector === 'object' && 'x' in vector) {
      const newVector = { ...vector, [axis]: value };
      updateProperty(key, newVector);
    }
  }, [properties, updateProperty]);

  if (!object) return null;

  return (
    <div>
      {/* 基本信息 */}
      <PropertySection>
        <SectionTitle>基本信息</SectionTitle>
        
        <PropertyGroup>
          <PropertyLabel>名称</PropertyLabel>
          <PropertyInput
            type="text"
            value={properties.name}
            onChange={(e) => updateProperty('name', e.target.value)}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>类型</PropertyLabel>
          <PropertyInput
            type="text"
            value={properties.type}
            disabled
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>
            <PropertyCheckbox
              type="checkbox"
              checked={properties.visible}
              onChange={(e) => updateProperty('visible', e.target.checked)}
            />
            显示
          </PropertyLabel>
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
              value={properties.position.x.toFixed(2)}
              onChange={(e) => updateVectorProperty('position', 'x', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              value={properties.position.y.toFixed(2)}
              onChange={(e) => updateVectorProperty('position', 'y', parseFloat(e.target.value))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              value={properties.position.z.toFixed(2)}
              onChange={(e) => updateVectorProperty('position', 'z', parseFloat(e.target.value))}
            />
          </PropertyRow>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>旋转 (X, Y, Z)</PropertyLabel>
          <PropertyRow>
            <PropertyInput
              type="number"
              step="0.1"
              value={(properties.rotation.x * 180 / Math.PI).toFixed(1)}
              onChange={(e) => updateVectorProperty('rotation', 'x', parseFloat(e.target.value) * Math.PI / 180)}
            />
            <PropertyInput
              type="number"
              step="0.1"
              value={(properties.rotation.y * 180 / Math.PI).toFixed(1)}
              onChange={(e) => updateVectorProperty('rotation', 'y', parseFloat(e.target.value) * Math.PI / 180)}
            />
            <PropertyInput
              type="number"
              step="0.1"
              value={(properties.rotation.z * 180 / Math.PI).toFixed(1)}
              onChange={(e) => updateVectorProperty('rotation', 'z', parseFloat(e.target.value) * Math.PI / 180)}
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
              value={properties.scale.x.toFixed(2)}
              onChange={(e) => updateVectorProperty('scale', 'x', Math.max(0.01, parseFloat(e.target.value)))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              min="0.01"
              value={properties.scale.y.toFixed(2)}
              onChange={(e) => updateVectorProperty('scale', 'y', Math.max(0.01, parseFloat(e.target.value)))}
            />
            <PropertyInput
              type="number"
              step="0.1"
              min="0.01"
              value={properties.scale.z.toFixed(2)}
              onChange={(e) => updateVectorProperty('scale', 'z', Math.max(0.01, parseFloat(e.target.value)))}
            />
          </PropertyRow>
        </PropertyGroup>
      </PropertySection>

      {/* 几何信息 */}
      {object.type === 'mesh' && (
        <PropertySection>
          <SectionTitle>几何信息</SectionTitle>
          
          {properties.geometry && (
            <PropertyGroup>
              <PropertyLabel>几何类型</PropertyLabel>
              <PropertyInput
                type="text"
                value={properties.geometry.type || 'Unknown'}
                disabled
              />
            </PropertyGroup>
          )}

          {(() => {
            const bounds = object.getBounds();
            return (
              <PropertyGroup>
                <PropertyLabel>尺寸 (宽, 高, 深)</PropertyLabel>
                <PropertyRow>
                  <PropertyInput
                    type="text"
                    value={bounds.size.x.toFixed(2)}
                    disabled
                  />
                  <PropertyInput
                    type="text"
                    value={bounds.size.y.toFixed(2)}
                    disabled
                  />
                  <PropertyInput
                    type="text"
                    value={bounds.size.z.toFixed(2)}
                    disabled
                  />
                </PropertyRow>
              </PropertyGroup>
            );
          })()}
        </PropertySection>
      )}

      {/* 材质信息 */}
      {object.type === 'mesh' && properties.material && (
        <PropertySection>
          <SectionTitle>材质信息</SectionTitle>
          
          <PropertyGroup>
            <PropertyLabel>材质类型</PropertyLabel>
            <PropertyInput
              type="text"
              value={Array.isArray(properties.material) 
                ? `多材质 (${properties.material.length})`
                : (properties.material as any).type || 'Unknown'
              }
              disabled
            />
          </PropertyGroup>
        </PropertySection>
      )}

      {!compact && (
        <PropertySection>
          <SectionTitle>用户数据</SectionTitle>
          <PropertyGroup>
            <PropertyLabel>ID</PropertyLabel>
            <PropertyInput
              type="text"
              value={properties.id}
              disabled
            />
          </PropertyGroup>
        </PropertySection>
      )}
    </div>
  );
}; 