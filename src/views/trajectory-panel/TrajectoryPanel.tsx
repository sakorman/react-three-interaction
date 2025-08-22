import React, { useState } from 'react';
import { Button, Select, Card, Form, InputNumber, Switch, Divider } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import * as THREE from 'three';
import { TrajectorySystem, TrajectoryType, TrajectoryParams } from '../../core/TrajectorySystem';
import { SceneObject } from '../../models/SceneObject';

const { Option } = Select;

const PanelContainer = styled(Card)`
  width: 300px;
  .ant-card-body {
    padding: 16px;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

interface TrajectoryPanelProps {
  trajectorySystem: TrajectorySystem;
  selectedObject?: SceneObject;
  onCreateTrajectory?: (type: TrajectoryType, params: TrajectoryParams) => void;
}

export const TrajectoryPanel: React.FC<TrajectoryPanelProps> = ({
  trajectorySystem,
  selectedObject,
  onCreateTrajectory
}) => {
  const [form] = Form.useForm();
  const [trajectoryType, setTrajectoryType] = useState<TrajectoryType>('linear');
  const [activeTrajectories, setActiveTrajectories] = useState<string[]>([]);

  const handleCreateTrajectory = () => {
    if (!selectedObject) return;

    form.validateFields().then(values => {
      const baseOptions = {
        duration: values.duration || 2,
        easing: values.easing || 'linear',
        loop: values.loop || false,
      };

      let params: TrajectoryParams = new THREE.Vector3(0, 0, 0); // 默认为线性轨迹参数
      
      switch (trajectoryType) {
        case 'linear':
          params = new THREE.Vector3(
            values.targetX || 0,
            values.targetY || 0,
            values.targetZ || 0
          );
          break;
        
        case 'circular':
          params = {
            center: new THREE.Vector3(
              selectedObject.object3D.position.x,
              selectedObject.object3D.position.y,
              selectedObject.object3D.position.z
            ),
            radius: values.radius || 3,
            startAngle: 0,
            endAngle: Math.PI * 2,
            clockwise: true,
          };
          break;
        
        case 'arc':
          params = {
            startPoint: selectedObject.object3D.position.clone(),
            endPoint: new THREE.Vector3(
              values.targetX || 0,
              values.targetY || 0,
              values.targetZ || 0
            ),
            height: values.height || 2,
          };
          break;
        
        case 'rectangular':
          params = {
            center: selectedObject.object3D.position.clone(),
            width: values.width || 4,
            height: values.rectHeight || 4,
            startCorner: 'topLeft' as const,
          };
          break;
        
        case 'gravity':
          params = {
            initialVelocity: new THREE.Vector3(
              values.velocityX || 5,
              values.velocityY || 10,
              values.velocityZ || 0
            ),
            gravity: values.gravity || -9.82,
            airResistance: values.airResistance || 0.1,
          };
          break;
        
        case 'spiral':
          params = {
            center: selectedObject.object3D.position.clone(),
            radius: values.radius || 2,
            height: values.height || 3,
            turns: values.turns || 2,
            clockwise: true,
          };
          break;
      }

      const trajectoryId = trajectorySystem.createTrajectory(
        selectedObject,
        trajectoryType,
        params,
        baseOptions
      );

      trajectorySystem.startTrajectory(trajectoryId);
      setActiveTrajectories(prev => [...prev, trajectoryId]);

      if (onCreateTrajectory) {
        onCreateTrajectory(trajectoryType, params);
      }
    });
  };

  const handleStopAll = () => {
    activeTrajectories.forEach(id => {
      trajectorySystem.stopTrajectory(id);
    });
    setActiveTrajectories([]);
  };

  const renderTrajectoryParams = () => {
    switch (trajectoryType) {
      case 'linear':
        return (
          <>
            <Form.Item label="目标 X" name="targetX">
              <InputNumber placeholder="目标X坐标" />
            </Form.Item>
            <Form.Item label="目标 Y" name="targetY">
              <InputNumber placeholder="目标Y坐标" />
            </Form.Item>
            <Form.Item label="目标 Z" name="targetZ">
              <InputNumber placeholder="目标Z坐标" />
            </Form.Item>
          </>
        );
      
      case 'circular':
        return (
          <Form.Item label="半径" name="radius">
            <InputNumber min={0.1} max={20} defaultValue={3} />
          </Form.Item>
        );
      
      case 'arc':
        return (
          <>
            <Form.Item label="目标 X" name="targetX">
              <InputNumber placeholder="目标X坐标" />
            </Form.Item>
            <Form.Item label="目标 Y" name="targetY">
              <InputNumber placeholder="目标Y坐标" />
            </Form.Item>
            <Form.Item label="目标 Z" name="targetZ">
              <InputNumber placeholder="目标Z坐标" />
            </Form.Item>
            <Form.Item label="弧形高度" name="height">
              <InputNumber min={0.1} max={10} defaultValue={2} />
            </Form.Item>
          </>
        );
      
      case 'rectangular':
        return (
          <>
            <Form.Item label="宽度" name="width">
              <InputNumber min={0.1} max={20} defaultValue={4} />
            </Form.Item>
            <Form.Item label="高度" name="rectHeight">
              <InputNumber min={0.1} max={20} defaultValue={4} />
            </Form.Item>
          </>
        );
      
      case 'gravity':
        return (
          <>
            <Form.Item label="初始速度 X" name="velocityX">
              <InputNumber defaultValue={5} />
            </Form.Item>
            <Form.Item label="初始速度 Y" name="velocityY">
              <InputNumber defaultValue={10} />
            </Form.Item>
            <Form.Item label="初始速度 Z" name="velocityZ">
              <InputNumber defaultValue={0} />
            </Form.Item>
            <Form.Item label="重力" name="gravity">
              <InputNumber defaultValue={-9.82} />
            </Form.Item>
            <Form.Item label="空气阻力" name="airResistance">
              <InputNumber min={0} max={1} step={0.01} defaultValue={0.1} />
            </Form.Item>
          </>
        );
      
      case 'spiral':
        return (
          <>
            <Form.Item label="半径" name="radius">
              <InputNumber min={0.1} max={20} defaultValue={2} />
            </Form.Item>
            <Form.Item label="高度" name="height">
              <InputNumber min={0.1} max={20} defaultValue={3} />
            </Form.Item>
            <Form.Item label="圈数" name="turns">
              <InputNumber min={0.5} max={10} step={0.5} defaultValue={2} />
            </Form.Item>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <PanelContainer title="轨迹动画控制">
      <Form form={form} layout="vertical" size="small">
        <Form.Item label="轨迹类型">
          <Select 
            value={trajectoryType} 
            onChange={setTrajectoryType}
            style={{ width: '100%' }}
          >
            <Option value="linear">直线</Option>
            <Option value="circular">圆形</Option>
            <Option value="arc">弧形</Option>
            <Option value="rectangular">矩形</Option>
            <Option value="gravity">重力</Option>
            <Option value="spiral">螺旋</Option>
          </Select>
        </Form.Item>

        {renderTrajectoryParams()}

        <Divider />

        <Form.Item label="持续时间(秒)" name="duration">
          <InputNumber min={0.1} max={60} defaultValue={2} />
        </Form.Item>

        <Form.Item label="缓动类型" name="easing">
          <Select defaultValue="linear">
            <Option value="linear">线性</Option>
            <Option value="easeIn">缓入</Option>
            <Option value="easeOut">缓出</Option>
            <Option value="easeInOut">缓入缓出</Option>
            <Option value="bounce">弹跳</Option>
          </Select>
        </Form.Item>

        <Form.Item name="loop" valuePropName="checked">
          <Switch /> 循环播放
        </Form.Item>

        <ControlsRow>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={handleCreateTrajectory}
            disabled={!selectedObject}
            block
          >
            创建轨迹
          </Button>
        </ControlsRow>

        <ControlsRow>
          <Button 
            icon={<StopOutlined />}
            onClick={handleStopAll}
            disabled={activeTrajectories.length === 0}
            block
          >
            停止所有轨迹
          </Button>
        </ControlsRow>

        {!selectedObject && (
          <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
            请先选择一个对象
          </p>
        )}

        <Divider />

        <div style={{ fontSize: '12px', color: '#666' }}>
          <p><strong>轨迹类型说明：</strong></p>
          <p>• <strong>直线</strong>：从当前位置到目标位置的直线运动</p>
          <p>• <strong>圆形</strong>：以当前位置为中心的圆形轨迹</p>
          <p>• <strong>弧形</strong>：抛物线轨迹，适合投掷动画</p>
          <p>• <strong>矩形</strong>：沿矩形路径运动</p>
          <p>• <strong>重力</strong>：模拟重力影响的物理运动</p>
          <p>• <strong>螺旋</strong>：螺旋向上的轨迹</p>
        </div>
      </Form>
    </PanelContainer>
  );
}; 