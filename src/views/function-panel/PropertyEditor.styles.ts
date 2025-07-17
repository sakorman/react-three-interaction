import styled from 'styled-components';

// 属性组
export const PropertyGroup = styled.div`
  margin-bottom: 16px;
`;

// 属性标签
export const PropertyLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #ccc;
  font-weight: 500;
`;

// 属性行
export const PropertyRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

// 属性输入框
export const PropertyInput = styled.input`
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

// 属性复选框
export const PropertyCheckbox = styled.input`
  margin-right: 8px;
`;

// 属性区域
export const PropertySection = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
`;

// 区域标题
export const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #e0e0e0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
`; 