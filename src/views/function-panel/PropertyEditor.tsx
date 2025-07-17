import React, { useState, useCallback } from 'react';

import { SceneObject } from '../../models/SceneObject';
import { useEditor } from '../../hooks/useEditor';
import {
  PropertyGroup,
  PropertyLabel,
  PropertyRow,
  PropertyInput,
  PropertyCheckbox,
  PropertySection,
  SectionTitle
} from './PropertyEditor.styles';

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
      payload: {
        id: object.id,
        properties: { [key]: value }
      }
    });
  }, [properties, object.id, dispatch]);

  const handleVectorChange = useCallback((
    vectorKey: string, 
    component: 'x' | 'y' | 'z', 
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const currentVector = (properties as any)[vectorKey] || { x: 0, y: 0, z: 0 };
    const newVector = { ...currentVector, [component]: numValue };
    updateProperty(vectorKey, newVector);
  }, [properties, updateProperty]);

  const renderVectorInput = (
    label: string, 
    vectorKey: string, 
    vector: { x: number; y: number; z: number }
  ) => (
    <PropertyGroup>
      <PropertyLabel>{label}</PropertyLabel>
      <PropertyRow>
        <PropertyInput
          type="number"
          step="0.1"
          value={vector.x}
          onChange={(e) => handleVectorChange(vectorKey, 'x', e.target.value)}
          placeholder="X"
        />
        <PropertyInput
          type="number"
          step="0.1"
          value={vector.y}
          onChange={(e) => handleVectorChange(vectorKey, 'y', e.target.value)}
          placeholder="Y"
        />
        <PropertyInput
          type="number"
          step="0.1"
          value={vector.z}
          onChange={(e) => handleVectorChange(vectorKey, 'z', e.target.value)}
          placeholder="Z"
        />
      </PropertyRow>
    </PropertyGroup>
  );

  if (compact) {
    return (
      <PropertySection>
        <SectionTitle>{object.name}</SectionTitle>
        
        <PropertyGroup>
          <PropertyLabel>名称</PropertyLabel>
          <PropertyInput
            type="text"
            value={object.name}
            onChange={(e) => updateProperty('name', e.target.value)}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>
            <PropertyCheckbox
              type="checkbox"
              checked={object.visible}
              onChange={(e) => updateProperty('visible', e.target.checked)}
            />
            可见
          </PropertyLabel>
        </PropertyGroup>
      </PropertySection>
    );
  }

  return (
    <div>
      {/* 基本属性 */}
      <PropertySection>
        <SectionTitle>基本属性</SectionTitle>
        
        <PropertyGroup>
          <PropertyLabel>名称</PropertyLabel>
          <PropertyInput
            type="text"
            value={object.name}
            onChange={(e) => updateProperty('name', e.target.value)}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>类型</PropertyLabel>
          <PropertyInput
            type="text"
            value={object.type}
            disabled
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>
            <PropertyCheckbox
              type="checkbox"
              checked={object.visible}
              onChange={(e) => updateProperty('visible', e.target.checked)}
            />
            可见
          </PropertyLabel>
        </PropertyGroup>
      </PropertySection>

      {/* 变换属性 */}
      <PropertySection>
        <SectionTitle>变换</SectionTitle>
        
        {renderVectorInput('位置', 'position', properties.position || { x: 0, y: 0, z: 0 })}
        {renderVectorInput('旋转', 'rotation', properties.rotation || { x: 0, y: 0, z: 0 })}
        {renderVectorInput('缩放', 'scale', properties.scale || { x: 1, y: 1, z: 1 })}
      </PropertySection>

      {/* 材质属性 */}
      {object.type === 'mesh' && (
        <PropertySection>
          <SectionTitle>材质</SectionTitle>
          
          <PropertyGroup>
            <PropertyLabel>颜色</PropertyLabel>
            <PropertyInput
              type="color"
              value={(properties as any).color || '#ffffff'}
              onChange={(e) => updateProperty('color', e.target.value)}
            />
          </PropertyGroup>

          <PropertyGroup>
            <PropertyLabel>透明度</PropertyLabel>
            <PropertyInput
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={(properties as any).opacity || 1}
              onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
            />
          </PropertyGroup>

          <PropertyGroup>
            <PropertyLabel>
              <PropertyCheckbox
                type="checkbox"
                checked={(properties as any).wireframe || false}
                onChange={(e) => updateProperty('wireframe', e.target.checked)}
              />
              线框模式
            </PropertyLabel>
          </PropertyGroup>
        </PropertySection>
      )}
    </div>
  );
}; 