import { observer } from 'mobx-react-lite';
import { Card, Form, Input, InputNumber, Checkbox, Collapse, Empty, Button, Space, Tooltip, ColorPicker, ConfigProvider } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { CloseOutlined } from '@ant-design/icons';
import { editorStore, ModelData } from '../../stores/EditorStore';
import { themeStore } from '../../stores/ThemeStore';

const { Panel } = Collapse;

interface PropertyEditorProps {
  model: ModelData;
}

const ModelPropertyEditor: React.FC<PropertyEditorProps> = observer(({ model }) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: any, _allValues: any) => {
    const key = Object.keys(changedValues)[0];
    let value = Object.values(changedValues)[0];

    if (value && typeof value === 'object' && 'toHexString' in (value as Color)) {
        value = (value as Color).toHexString();
    }
    
    if (key === 'rotationX' || key === 'rotationY' || key === 'rotationZ') {
        const axis = key.charAt(key.length - 1).toLowerCase() as 'x' | 'y' | 'z';
        editorStore.updateModel(model.id, {
            rotation: { ...model.rotation, [axis]: (value as number) * Math.PI / 180 }
        });
        return;
    }

    if (key === 'positionX' || key === 'positionY' || key === 'positionZ') {
        const axis = key.charAt(key.length - 1).toLowerCase() as 'x' | 'y' | 'z';
        editorStore.updateModel(model.id, {
            position: { ...model.position, [axis]: value as number }
        });
        return;
    }

    if (key === 'scaleX' || key === 'scaleY' || key === 'scaleZ') {
        const axis = key.charAt(key.length - 1).toLowerCase() as 'x' | 'y' | 'z';
        editorStore.updateModel(model.id, {
            scale: { ...model.scale, [axis]: Math.max(0.01, value as number) }
        });
        return;
    }

    editorStore.updateModel(model.id, { [key]: value });
  };

  const initialValues = {
    name: model.name,
    visible: model.visible,
    color: model.color,
    positionX: model.position.x,
    positionY: model.position.y,
    positionZ: model.position.z,
    rotationX: Math.round(model.rotation.x * 180 / Math.PI),
    rotationY: Math.round(model.rotation.y * 180 / Math.PI),
    rotationZ: Math.round(model.rotation.z * 180 / Math.PI),
    scaleX: model.scale.x,
    scaleY: model.scale.y,
    scaleZ: model.scale.z,
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={initialValues}
      key={model.id}
    >
      <Collapse defaultActiveKey={['1', '2']} ghost>
        <Panel header="基本信息" key="1">
            <Form.Item label="名称" name="name">
                <Input />
            </Form.Item>
            <Form.Item label="类型">
                <Input value={model.type} disabled />
            </Form.Item>
            <Space align="center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item name="visible" valuePropName="checked" noStyle>
                    <Checkbox>显示</Checkbox>
                </Form.Item>
                <Form.Item label="颜色" name="color" style={{ marginBottom: 0 }}>
                    <ColorPicker />
                </Form.Item>
            </Space>
        </Panel>
        <Panel header="变换" key="2">
          <Form.Item label="位置 (X, Y, Z)">
            <Space>
              <Form.Item name="positionX" noStyle><InputNumber step={0.1} /></Form.Item>
              <Form.Item name="positionY" noStyle><InputNumber step={0.1} /></Form.Item>
              <Form.Item name="positionZ" noStyle><InputNumber step={0.1} /></Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="旋转 (X, Y, Z) 度">
            <Space>
              <Form.Item name="rotationX" noStyle><InputNumber step={1} /></Form.Item>
              <Form.Item name="rotationY" noStyle><InputNumber step={1} /></Form.Item>
              <Form.Item name="rotationZ" noStyle><InputNumber step={1} /></Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="缩放 (X, Y, Z)">
            <Space>
              <Form.Item name="scaleX" noStyle><InputNumber step={0.1} min={0.01} /></Form.Item>
              <Form.Item name="scaleY" noStyle><InputNumber step={0.1} min={0.01} /></Form.Item>
              <Form.Item name="scaleZ" noStyle><InputNumber step={0.1} min={0.01} /></Form.Item>
            </Space>
          </Form.Item>
        </Panel>
      </Collapse>
    </Form>
  );
});

export const MobxPropertyPanel = observer(() => {
  const { showPropertyPanel, selectedModels } = editorStore;
  const theme = themeStore.currentTheme;

  const handleClose = () => {
    editorStore.togglePropertyPanel();
  };

  if (!showPropertyPanel) {
    return null;
  }

  const title = selectedModels.length === 1 ? `属性 - ${selectedModels[0].name}` : `已选择 ${selectedModels.length} 个对象`;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: theme.colors.primary,
          colorBgContainer: theme.colors.background,
          colorBgElevated: theme.colors.surface,
          colorText: theme.colors.text,
          colorTextSecondary: theme.colors.textSecondary,
          colorBorder: theme.colors.border,
          borderRadius: 8,
        },
      }}
    >
      <Card
      title={title}
      extra={<Tooltip title="关闭"><Button type="text" icon={<CloseOutlined />} onClick={handleClose} /></Tooltip>}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 320,
        maxHeight: '80vh',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.lg,
      }}
      headStyle={{
        color: theme.colors.text,
        borderBottom: `1px solid ${theme.colors.border}`,
        cursor: 'move',
        backgroundColor: theme.colors.surfaceVariant,
      }}
      bodyStyle={{ padding: '0 16px', overflowY: 'auto', flex: 1 }}
      bordered={false}
    >
      {selectedModels.length > 0 ? (
        selectedModels.map(model => <ModelPropertyEditor key={model.id} model={model} />)
      ) : (
        <Empty description="未选择任何对象" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }} />
      )}
    </Card>
    </ConfigProvider>
  );
}); 