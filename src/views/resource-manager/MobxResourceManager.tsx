import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Input, List, Button, Radio, Space, Tooltip, Typography, Tag, Divider, ConfigProvider } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';

import { editorStore, ModelData } from '../../stores/EditorStore';
import { themeStore } from '../../stores/ThemeStore';

const { Text } = Typography;

const getModelIcon = (type: string) => {
    switch (type) {
      case 'cube': return '立方体';
      case 'sphere': return '球体';
      case 'cylinder': return '圆柱体';
      case 'plane': return '平面';
      case 'mesh': return '网格';
      default: return '❓';
    }
};

export const MobxResourceManager = observer(() => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const theme = themeStore.currentTheme;

  const { showResourceManager, modelList, selectedModelIds, selectionCount } = editorStore;

  const handleClose = () => {
    editorStore.toggleResourceManager();
  };

  const filteredModels = useMemo(() => {
    return modelList.filter(model => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = model.name.toLowerCase().includes(searchTermLower);
      const typeMatch = getModelIcon(model.type).toLowerCase().includes(searchTermLower);

      if (searchTerm && !nameMatch && !typeMatch) {
        return false;
      }
      
      if (filter === 'visible' && !model.visible) return false;
      if (filter === 'hidden' && model.visible) return false;
      
      return true;
    });
  }, [modelList, searchTerm, filter]);

  const handleModelClick = (model: ModelData, event: React.MouseEvent) => {
    editorStore.selectModel(model.id, event.ctrlKey || event.metaKey);
  };

  const handleToggleVisibility = (model: ModelData, event: React.MouseEvent) => {
    event.stopPropagation();
    editorStore.updateModel(model.id, { visible: !model.visible });
  };
  
  if (!showResourceManager) {
    return null;
  }

  const stats = {
    total: modelList.length,
    visible: modelList.filter(model => model.visible).length,
    selected: selectionCount,
  };

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
      title="资源管理器"
      extra={<Tooltip title="关闭"><Button type="text" icon={<CloseOutlined />} onClick={handleClose} /></Tooltip>}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        width: 280,
        maxHeight: '60vh',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.lg,
      }}
      styles={{
        header: {
          color: theme.colors.text,
          borderBottom: `1px solid ${theme.colors.border}`,
          cursor: 'move',
          backgroundColor: theme.colors.surfaceVariant,
        },
        body: { 
          padding: '12px', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column' 
        }
      }}
      variant="borderless"
    >
      <Space direction="vertical" style={{ marginBottom: 12 }}>
        <Input.Search 
          placeholder="搜索名称或类型..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Radio.Group 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          size="small"
          buttonStyle="solid"
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="visible">可见</Radio.Button>
          <Radio.Button value="hidden">隐藏</Radio.Button>
        </Radio.Group>
      </Space>

      <List
        dataSource={filteredModels}
        size="small"
        style={{ flex: 1, overflowY: 'auto' }}
        renderItem={(model) => (
          <List.Item
            key={model.id}
            onClick={(e) => handleModelClick(model, e)}
            style={{
              cursor: 'pointer',
              background: selectedModelIds.includes(model.id) ? 'rgba(0, 122, 204, 0.3)' : 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 8px',
              opacity: model.visible ? 1 : 0.6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = selectedModelIds.includes(model.id) ? 'rgba(0, 122, 204, 0.4)' : 'rgba(255, 255, 255, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = selectedModelIds.includes(model.id) ? 'rgba(0, 122, 204, 0.3)' : 'transparent')}
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Text style={{ color: '#e0e0e0' }}>
                  <span role="img" aria-label={model.type} style={{ marginRight: 8 }}>{getModelIcon(model.type)}</span>
                  {model.name}
                </Text>
              </Space>
              <Space>
                <Tag>{model.type}</Tag>
                <Tooltip title={model.visible ? "隐藏" : "显示"}>
                  <Button
                    type="text"
                    size="small"
                    icon={model.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={(e) => handleToggleVisibility(model, e)}
                  />
                </Tooltip>
              </Space>
            </Space>
          </List.Item>
        )}
      />
      <Divider style={{ margin: '8px 0', borderColor: theme.colors.border }} />
      <div style={{ textAlign: 'center', fontSize: 11, color: theme.colors.textTertiary }}>
        <Text type="secondary">总数: {stats.total} | 可见: {stats.visible} | 已选: {stats.selected}</Text>
      </div>
    </Card>
    </ConfigProvider>
  );
}); 