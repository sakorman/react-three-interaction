import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  backdrop-filter: blur(2px);
`;

export const LightingSettingsContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  max-height: 80vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const LightingSettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
`;

export const LightingSettingsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #666;
  }
`;

export const LightingSettingsContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
`;

export const SettingSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SettingLabel = styled.label`
  font-size: 14px;
  color: #333;
  font-weight: 500;
  min-width: 120px;
`;

export const SettingControl = styled.div`
  flex: 1;
  margin-left: 16px;
  
  .ant-slider {
    margin: 0;
  }
  
  .ant-input-number {
    width: 100%;
  }
  
  .ant-select {
    width: 100%;
  }
`;

export const ColorPickerButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #d9d9d9;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: #40a9ff;
  }
`;

export const LightTypeCard = styled.div<{ enabled: boolean }>`
  border: 1px solid ${props => props.enabled ? '#1890ff' : '#d9d9d9'};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: ${props => props.enabled ? '#f6ffed' : '#fafafa'};
  transition: all 0.2s;
`;

export const LightTypeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const LightTypeName = styled.h5`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`; 